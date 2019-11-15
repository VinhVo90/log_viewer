Vue.component('v-select', VueSelect.VueSelect);

window.app = new Vue({
  el: '#app',
  data() {
    return {
      waiting: false,
      datePickerFormat: 'dd/MM/yyyy',
      momentDateFormat: 'YYYY-MM-DD HH:mm:ss',
      searchData: {
        processId: '',
        emitterId: '',
        startDate: null,
        endDate: null,
        startTimeStamp: null,
        endTimeStamp: null,
        selectLogLevel: [],
        selectSearchOrder: [],
        selectTimeZone: null,
        timeStampOrder: '',
        limit: null,
        offset: null,
      },
      logData: [],
      logLevelArr: [
        { code: 'debug', label: 'DEBUG' },
        { code: 'warn', label: 'WARNING' },
        { code: 'info', label: 'INFO' },
        { code: 'error', label: 'ERROR' },
        { code: 'fail', label: 'FAIL' },
      ],
      timeZoneArr: [
        { code: 0, label: 'UTC, GMT' },
        { code: 1, label: 'ECT, GMT+1:00' },
        { code: 2, label: 'EET, GMT+2:00' },
        { code: 2, label: 'ART, GMT+2:00' },
        { code: 3, label: 'EAT, GMT+3:00' },
        { code: 3.5, label: 'MET, GMT+3:30' },
        { code: 4, label: 'NET, GMT+4:00' },
        { code: 5, label: 'PLT, GMT+5:00' },
        { code: 5.5, label: 'IST, GMT+5:30' },
        { code: 6, label: 'BST, GMT+6:00' },
        { code: 7, label: 'VST, GMT+7:00' },
        { code: 8, label: 'CTT, GMT+8:00' },
        { code: 9, label: 'KST,JST, GMT+9:00' },
        { code: 9.5, label: 'ACT, GMT+9:30' },
        { code: 10, label: 'AET, GMT+10:00' },
        { code: 11, label: 'SST, GMT+11:00' },
        { code: 12, label: 'NST, GMT+12:00' },
        { code: -11, label: 'MIT, GMT-11:00' },
        { code: -10, label: 'HST, GMT-10:00' },
        { code: -9, label: 'AST, GMT-9:00' },
        { code: -8, label: 'PST, GMT-8:00' },
        { code: -7, label: 'PNT, GMT-7:00' },
        { code: -7, label: 'MST, GMT-7:00' },
        { code: -6, label: 'CST, GMT-6:00' },
        { code: -5, label: 'EST, GMT-5:00' },
        { code: -5, label: 'IET, GMT-5:00' },
        { code: -4, label: 'PRT, GMT-4:00' },
        { code: -3.5, label: 'CNT, GMT-3:30' },
        { code: -3, label: 'AGT, GMT-3:00' },
        { code: -3, label: 'BET, GMT-3:00' },
        { code: -1, label: 'CAT, GMT-1:00' },
      ],
      searchOrderArr: [
        { code: 'timestamp', label: 'Time Stamp' },
      ],
    };
  },
  mounted() {
    this.initTimeEvent();
    this.initValidator();
  },

  methods: {
    onBtnSearchClick() {
      if ($('#logSearchForm').valid()) {
        $('.data-section').removeClass('d-none');
        this.waiting = true;
        const data = this.createRequestParam();
        axios.post('/logviewer/get-log-data', data).then((response) => {
          this.waiting = false;
          this.logData = response.data;
        });
      }

      setTimeout(() => {
        this.waiting = false;
      }, 30000);
    },

    onUpdateUTCTime() {
      const start = this.convertToUTCTime(this.searchData.startDate);
      const end = this.convertToUTCTime(this.searchData.endDate);
      this.searchData.startTimeStamp = start.format(this.momentDateFormat);
      this.searchData.endTimeStamp = end.format(this.momentDateFormat);
      $('#logTimeStamp').val(`${start.format(this.momentDateFormat)} - ${end.format(this.momentDateFormat)}`);
    },

    classObject(item) {
      return {
        'bg-primary': item.log_level === 'debug',
        'bg-success': item.log_level === 'info',
        'bg-warning': item.log_level === 'warn',
        'bg-danger': item.log_level === 'error',
        'bg-dark': item.log_level === 'fail',
      };
    },

    createRequestParam() {
      const {
        processId, emitterId, startTimeStamp, endTimeStamp,
        selectLogLevel, selectSearchOrder, limit, offset,
      } = this.searchData;
      const data = {};
      const arrQuery = [];
      const arrFilter = [];

      if (processId !== '') {
        data.searchProcess = true;
        data.processId = processId;
      } else {
        data.searchEmitter = true;
        data.emitterId = emitterId;
      }

      if (startTimeStamp !== null) {
        arrFilter.push(`timestamp between '${startTimeStamp}' and '${endTimeStamp}'`);
      }

      const arrLogLevel = _.map(selectLogLevel, (item) => `log_level = '${item.code}'`);
      const arrLogSearchOrder = _.map(selectSearchOrder, (item) => `orderBy=${item.code}`);

      if (arrLogLevel.length > 0) {
        arrFilter.push(arrLogLevel.join(' and '));
      }

      if (arrFilter.length > 0) {
        arrQuery.push(`filter=${arrFilter.join(' and ')}`);
      }

      if (arrLogSearchOrder.length > 0) {
        arrQuery.push(arrLogSearchOrder.join('&'));
      }

      if (limit !== '' && limit !== null) {
        arrQuery.push(`limit=${limit}`);
      }

      if (offset !== '' && offset !== null) {
        arrQuery.push(`offset=${offset - 1}`);
      }

      data.querystring = arrQuery.length === 0 ? '' : arrQuery.join('&');
      return data;
    },

    initTimeEvent() {
      const self = this;
      const fromDate = moment(new Date());
      const toDate = fromDate.clone().subtract(1, 'day');
      self.searchData.startDate = fromDate;
      self.searchData.endDate = toDate;
      self.onUpdateUTCTime();

      $('#logTimeStamp').daterangepicker({
        timePicker: true,
        timePickerSeconds: true,
        timePicker24Hour: true,
        autoUpdateInput: false,
        cancelButtonClasses: 'd-none',
        format: self.momentDateFormat,
        locale: {
          format: self.momentDateFormat,
        },
      }, (startDate, endDate) => {
        const start = self.convertToUTCTime(startDate);
        const end = self.convertToUTCTime(endDate);
        self.searchData.startDate = startDate;
        self.searchData.endDate = endDate;
        self.searchData.startTimeStamp = start.format(self.momentDateFormat);
        self.searchData.endTimeStamp = end.format(self.momentDateFormat);
        $('#logTimeStamp').val(`${start.format(self.momentDateFormat)} - ${end.format(self.momentDateFormat)}`);
      });

      $('#logTimeStamp').on('apply.daterangepicker', function (ev, picker) {
        const start = self.convertToUTCTime(picker.startDate);
        const end = self.convertToUTCTime(picker.endDate);
        self.searchData.startDate = picker.startDate;
        self.searchData.endDate = picker.endDate;
        self.searchData.startTimeStamp = start.format(self.momentDateFormat);
        self.searchData.endTimeStamp = end.format(self.momentDateFormat);
        $(this).val(`${start.format(self.momentDateFormat)} - ${end.format(self.momentDateFormat)}`);
      });
    },

    initValidator() {
      $.validator.addMethod('onlyOne', function (value, element, param) {
        return (!this.optional(element) && $(param[0]).is(':blank')) || (this.optional(element) && !$(param[0]).is(':blank'));
      }, 'Please fill out only one of these fields');

      $('#logSearchForm').validate({
        rules: {
          processIdText: {
            onlyOne: ['#emitterIdText'],
          },
          emitterIdText: {
            onlyOne: ['#processIdText'],
          },
        },
      });
    },

    convertToUTCTime(date) {
      const { selectTimeZone } = this.searchData;
      if (selectTimeZone == null) {
        return moment(date.valueOf() + (new Date()).getTimezoneOffset() * 60000);
      }
      const timeZone = selectTimeZone.code;
      return moment(date.valueOf() + (-1) * timeZone * 60 * 60000);
    },

    validateNumber(event, field) {
      const inputText = event.target.value;
      if (inputText === '' || inputText === '0') {
        this.searchData[field] = null;
      }
    },
  },
});

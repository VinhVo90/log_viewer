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
        startTimeStamp: '',
        endTimeStamp: '',
        selectLogLevel: [],
        selectSearchOrder: [],
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
        { code: 'fatal', label: 'FATAL' },
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

    classObject(item) {
      return {
        'bg-primary': item.log_level === 'debug',
        'bg-success': item.log_level === 'info',
        'bg-warning': item.log_level === 'warn',
        'bg-danger': item.log_level === 'error',
        'bg-dark': item.log_level === 'fatal',
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

      if (startTimeStamp !== '') {
        arrFilter.push(`filter=timestamp between '${startTimeStamp}' and '${endTimeStamp}'`);
      }

      const arrLogLevel = _.map(selectLogLevel, (item) => `log_level = '${item.code}'`);
      const arrLogSearchOrder = _.map(selectSearchOrder, (item) => `orderBy=${item.code}`);

      if (arrLogLevel.length > 0) {
        arrFilter.push(arrLogLevel.join(' and '));
      }

      if (arrFilter.length > 0) {
        arrQuery.push(arrFilter.join(' and '));
      }

      if (arrLogSearchOrder.length > 0) {
        arrQuery.push(arrLogSearchOrder.join('&'));
      }

      if (limit !== '' && limit !== null) {
        arrQuery.push(`limit=${limit}`);
      }

      if (offset !== '' && offset !== null) {
        arrQuery.push(`offset=${offset}`);
      }

      data.querystring = arrQuery.length === 0 ? '' : arrQuery.join('&');
      return data;
    },

    initTimeEvent() {
      const self = this;
      $('#logTimeStamp').daterangepicker({
        timePicker: true,
        timePickerSeconds: true,
        timePicker24Hour: true,
        autoUpdateInput: false,
        format: self.momentDateFormat,
        locale: {
          format: self.momentDateFormat,
        },
      }, (startDate, endDate) => {
        const start = self.convertToUTCTime(startDate);
        const end = self.convertToUTCTime(endDate);
        self.searchData.startTimeStamp = start.format(self.momentDateFormat);
        self.searchData.endTimeStamp = end.format(self.momentDateFormat);
        $('#logTimeStamp').val(`${start.format(self.momentDateFormat)} - ${end.format(self.momentDateFormat)}`);
      });

      $('#logTimeStamp').on('apply.daterangepicker', function (ev, picker) {
        const start = self.convertToUTCTime(picker.startDate);
        const end = self.convertToUTCTime(picker.endDate);
        self.searchData.startTimeStamp = start.format(self.momentDateFormat);
        self.searchData.endTimeStamp = end.format(self.momentDateFormat);
        $(this).val(`${start.format(self.momentDateFormat)} - ${end.format(self.momentDateFormat)}`);
      });

      $('#logTimeStamp').on('cancel.daterangepicker', function () {
        $(this).val('');
        self.searchData.startTimeStamp = null;
        self.searchData.endTimeStamp = null;
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
          offsetInputText: {
            min: 1,
            number: true,
          },
          limitInputText: {
            min: 1,
            number: true,
          },
        },
      });
    },

    convertToUTCTime(date) {
      return moment(date.valueOf() + (new Date()).getTimezoneOffset() * 60000);
    },
  },
});

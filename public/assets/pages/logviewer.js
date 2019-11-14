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
        selectLogLevel, timeStampOrder, limit, offset,
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

      if (arrLogLevel.length > 0) {
        arrFilter.push(arrLogLevel.join(' and '));
      }

      if (arrFilter.length > 0) {
        arrQuery.push(arrFilter.join(' and '));
      }

      if (timeStampOrder !== '') {
        arrQuery.push(`orderBy=timestamp ${timeStampOrder}`);
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
      }, (start, end) => {
        self.searchData.startTimeStamp = start.format(self.momentDateFormat);
        self.searchData.endTimeStamp = end.format(self.momentDateFormat);
        $('#logTimeStamp').val(`${start.format(self.momentDateFormat)} - ${end.format(self.momentDateFormat)}`);
      });

      $('#logTimeStamp').on('apply.daterangepicker', function (ev, picker) {
        $(this).val(`${picker.startDate.format(self.momentDateFormat)} - ${picker.endDate.format(self.momentDateFormat)}`);
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
        },
      });
    },
  },
});

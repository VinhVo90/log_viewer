Vue.component('multiselect', VueMultiselect.Multiselect);

window.app = new Vue({
  el: '#app',
  data() {
    return {
      waiting: false,
      datePickerFormat: 'dd/MM/yyyy',
      timestampFormat: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
      momentDateFormat: 'YYYY-MM-DD HH:mm:ss',
      searchData: {
        userId: '',
        processSetupId: '',
        processId: '',
        emitterId: '',
        startDate: null,
        endDate: null,
        startTimeStamp: null,
        endTimeStamp: null,
        selectLogLevel: null,
        selectSearchOrder: null,
        selectTimeZone: null,
        limit: null,
        offset: null,
      },
      arrSearchOption: ['userIdText', 'processSetupIdText', 'processIdText', 'emitterIdText'],
      formErrorClass: 'form-input-error',
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
        { code: 'timestamp asc', label: 'Time Asc' },
        { code: 'timestamp desc', label: 'Time Desc' },
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
        this.createDateParam();
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

    onRemoveTimezone(selectOption) {
      this.searchData.removeTimeZone = selectOption;
    },

    onInputTimezone(value) {
      if (value === null) {
        this.searchData.selectTimeZone = this.searchData.removeTimeZone;
      }
    },

    classObject(item) {
      return {
        'bg-primary': item.log_level.toLowerCase() === 'debug',
        'bg-success': item.log_level.toLowerCase() === 'info',
        'bg-warning': item.log_level.toLowerCase() === 'warn',
        'bg-danger': item.log_level.toLowerCase() === 'error',
        'bg-dark': item.log_level.toLowerCase() === 'fail',
      };
    },

    normalizeText(item) {
      if (item === null) {
        return '';
      }
      return item;
    },

    createRequestParam() {
      const {
        userId, processSetupId, processId, emitterId, startTimeStamp, endTimeStamp,
        selectLogLevel, selectSearchOrder, limit, offset,
      } = this.searchData;
      const data = {};
      const arrQuery = [];
      const arrFilter = [];

      if (userId !== '') {
        data.searchUser = true;
        data.userId = userId;
      } else if (processSetupId !== '') {
        data.searchProcessSetup = true;
        data.processSetupId = processSetupId;
      } else if (processId !== '') {
        data.searchProcess = true;
        data.processId = processId;
      } else {
        data.searchEmitter = true;
        data.emitterId = emitterId;
      }

      arrFilter.push(`timestamp between '${startTimeStamp}' and '${endTimeStamp}'`);

      if (selectLogLevel !== null) {
        arrFilter.push(`log_level = '${selectLogLevel.code}'`);
      }

      if (arrFilter.length > 0) {
        arrQuery.push(`filter=${arrFilter.join(' and ')}`);
      }

      if (selectSearchOrder !== null) {
        arrQuery.push(`orderBy=${selectSearchOrder.code}`);
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
      const timeZoneLocale = (-1) * ((new Date()).getTimezoneOffset() / 60);
      self.searchData.selectTimeZone = _.find(self.timeZoneArr,
        (timeZone) => timeZone.code === timeZoneLocale);

      const toDate = moment(new Date());
      const fromDate = toDate.clone().subtract(1, 'day');
      self.searchData.startDate = fromDate;
      self.searchData.endDate = toDate;
      $('#logTimeStamp').val(`${fromDate.format(this.momentDateFormat)} - ${toDate.format(this.momentDateFormat)}`);

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
        self.searchData.startDate = startDate;
        self.searchData.endDate = endDate;
        $('#logTimeStamp').val(`${startDate.format(self.momentDateFormat)} - ${endDate.format(self.momentDateFormat)}`);
      });

      $('#logTimeStamp').on('apply.daterangepicker', function (ev, picker) {
        self.searchData.startDate = picker.startDate;
        self.searchData.endDate = picker.endDate;
        $(this).val(`${picker.startDate.format(self.momentDateFormat)} - ${picker.endDate.format(self.momentDateFormat)}`);
      });
    },

    createDateParam() {
      const start = this.convertToUTCTime(this.searchData.startDate.valueOf());
      const end = this.convertToUTCTime(this.searchData.endDate.valueOf());
      this.searchData.startTimeStamp = start.format(this.momentDateFormat);
      this.searchData.endTimeStamp = end.format(this.momentDateFormat);
    },

    initValidator() {
      const self = this;
      const { formErrorClass } = self;

      $.validator.addMethod('onlyOne', function (value, element, param) {
        const hasValue = self.hasValueInput(param);
        const isValid = (!this.optional(element) && !hasValue)
                        || (this.optional(element) && hasValue);
        self.clearError(self.arrSearchOption);
        return isValid;
      }, 'Please fill out only one of these fields');

      const displayError = (field, message) => {
        const input = $(`#${field}`);
        input.removeClass(formErrorClass);
        input.siblings(`.${formErrorClass}`).remove();
        $(`<label id="${field}-error" class="form-input-error" for="${field}">${message}</label>`).insertAfter(input);
      };

      $('#logSearchForm').validate({
        errorClass: formErrorClass,
        rules: {
          userIdText: {
            onlyOne: self.validArrSearch('userIdText'),
          },
          processSetupIdText: {
            onlyOne: self.validArrSearch('processSetupIdText'),
          },
          processIdText: {
            onlyOne: self.validArrSearch('processIdText'),
          },
          emitterIdText: {
            onlyOne: self.validArrSearch('emitterIdText'),
          },
        },
        showErrors(errorMap, errorList) {
          for (let i = 0; i < errorList.length; i += 1) {
            const { message } = errorList[i];
            self.arrSearchOption.forEach((element) => displayError(element, message));
          }
        },
      });
    },

    convertToUTCTime(time) {
      const { code: timeZone } = this.searchData.selectTimeZone;
      return moment(time + (-1) * timeZone * 60 * 60000);
    },

    convertToLocalTime(time) {
      const { code: timeZone } = this.searchData.selectTimeZone;
      return moment(time + timeZone * 60 * 60000).utc();
    },

    inputTimestamp(timestamp) {
      if (timestamp !== '') {
        return this.convertToLocalTime(moment(timestamp,
          this.timestampFormat).valueOf()).format(this.momentDateFormat);
      }
      return '';
    },

    validateNumber(event, field) {
      const inputText = event.target.value;
      if (inputText === '' || inputText === '0') {
        this.searchData[field] = null;
      }
    },

    validArrSearch(input) {
      return _.filter(this.arrSearchOption, (item) => item !== input);
    },

    hasValueInput(arrInput) {
      for (let i = 0; i < arrInput.length; i += 1) {
        const input = arrInput[i];
        if (!$(`[name=${input}]`).is(':blank')) {
          return true;
        }
      }
      return false;
    },

    clearError(arrInput) {
      const { formErrorClass } = this;
      for (let i = 0; i < arrInput.length; i += 1) {
        const input = arrInput[i];
        const element = $(`[name=${input}]`);
        element.removeClass(formErrorClass);
        element.siblings(`.${formErrorClass}`).remove();
      }
    },
  },
});

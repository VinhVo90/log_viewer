
const DATE_FORMAT = 'YYYY.MM.DD';
Vue.component('v-select', VueSelect.VueSelect);
Vue.component('datepicker', vuejsDatepicker);

window.app = new Vue({
  el: '#app',
  data() {
    return {
      waiting: false,
      configs: [],
      datePickerFormat: 'dd/MM/yyyy',
      momentDateFormat: 'DD/MM/YYYY HH:mm:ss',
      searchData: {
        sendTime: null,
        sendTimeFrom: null,
        sendTimeTo: null,
        recvTime: null,
        recvTimeFrom: null,
        recvTimeTo: null,
        processId: '',
        emitterId: '',
        messageName: '',
      },
      messageData: [],
      selectedMessage: {},
      logData: [],
    };
  },
  mounted() {
  },

  methods: {

    onBtnSearchClick() {
      $('.data-section').removeClass('d-none');
      this.waiting = true;
      this.logData = [
        {
          record_id: 13254,
          process_id: 'processId',
          emitter_id: 'algetacore',
          timestamp: '2019-11-08T05:46:36.000Z',
          log_level: 'DEBUG',
          process_code: 'test2',
          message: '{"value" : "debug log"}',
        },
        {
          record_id: 13254,
          process_id: 'processId',
          emitter_id: 'algetacore',
          timestamp: '2019-11-08T05:46:36.000Z',
          log_level: 'INFO',
          process_code: 'test2',
          message: '{"value" : "info log"}',
        },
        {
          record_id: 13254,
          process_id: 'processId',
          emitter_id: 'algetacore',
          timestamp: '2019-11-08T05:46:36.000Z',
          log_level: 'WARN',
          process_code: 'test2',
          message: '{"value" : "warning log"}',
        },
        {
          record_id: 13254,
          process_id: 'processId',
          emitter_id: 'algetacore',
          timestamp: '2019-11-08T05:46:36.000Z',
          log_level: 'ERROR',
          process_code: 'test2',
          message: '{"value" : "error log"}',
        },
        {
          record_id: 13254,
          process_id: 'processId',
          emitter_id: 'algetacore',
          timestamp: '2019-11-08T05:46:36.000Z',
          log_level: 'FATAL',
          process_code: 'test2',
          message: '{"value" : "fatal log"}',
        },
      ];
      this.waiting = false;
      setTimeout(() => {
        this.waiting = false;
      }, 30000);
    },

    classObject(item) {
      return {
        'bg-primary': item.log_level == 'DEBUG',
        'bg-success': item.log_level == 'INFO',
        'bg-warning': item.log_level == 'WARN',
        'bg-danger': item.log_level == 'ERROR',
        'bg-dark': item.log_level == 'FATAL',
      };
    },
  },
});

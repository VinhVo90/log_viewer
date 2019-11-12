window.app = new Vue({
  el: '#app',
  data() {
    return {
      waiting: false,
      searchData: {
        processId: '',
        emitterId: ''
      },
      logData: [],
    };
  },
  mounted() {
  },

  methods: {
    onBtnSearchClick() {
      $('.data-section').removeClass('d-none');
      this.waiting = true;
      
      axios.post('/logviewer/get-log-data', {}).then((response) => {
        this.waiting = false;
        let data = response.data;
        if (data.length > 0) {
          data = _.orderBy(data, [ function (item) { return moment(item.timestamp, 'YYYY-MM-DDTHH:mm:ss.SSSZ').valueOf(); }], ["desc"]);
        }

        this.logData = data;
      });

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
  },
});

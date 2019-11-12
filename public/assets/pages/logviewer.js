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
        this.logData = response.data;
      });

      setTimeout(() => {
        this.waiting = false;
      }, 30000);
    },

    classObject(item) {
      return {
        'bg-primary': item.log_level === 'DEBUG',
        'bg-success': item.log_level === 'INFO',
        'bg-warning': item.log_level === 'WARN',
        'bg-danger': item.log_level === 'ERROR',
        'bg-dark': item.log_level === 'FATAL',
      };
    },
  },
});

const axios = require('axios');
const CONSTANT = require('../configs/constants');

const getLogData = async (ctx) => {
  await axios.get(`${CONSTANT.API_SERVER}/logs/emitters/bright?filter=timestamp%20between%20%272019-11-12%2004:41:00%27%20and%20%272019-11-12%2004:43:00%27%20and%20log_level%20=%20%27%27info%27%27&limit=3&offset=2`)
    .then((response) => {
      ctx.body = response.data;
    })
    .catch((error) => {
      ctx.body = {
        error: error.response.status,
        data: error.response.data,
      };
    });
};

module.exports = {
  getLogData,
};

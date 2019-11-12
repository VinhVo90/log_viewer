const axios = require('axios');
const CONSTANT = require('../configs/constants');

const getLogData = async (ctx) => {
  console.log("get log data");
  await axios.get(`${CONSTANT.API_SERVER}/logs/emitters/algetacore?page=2&per_page=100`)
    .then((response) => {
      ctx.body = response.data;
    })
    .catch((error) => {
      ctx.body = {
        error : error.response.status,
        data : error.response.data
      };
    });
}

module.exports = {
  getLogData
}
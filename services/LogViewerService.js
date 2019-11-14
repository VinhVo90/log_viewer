const axios = require('axios');
const CONSTANT = require('../configs/constants');

const getLogData = async (ctx) => {
  const searchData = ctx.request.body;
  const {
    searchProcess, processId, emitterId, querystring,
  } = searchData;
  let url = '';

  if (searchProcess) {
    url = `${CONSTANT.API_SERVER}/logs/processes/${processId}?${querystring}`;
  } else {
    url = `${CONSTANT.API_SERVER}/logs/emitters/${emitterId}?${querystring}`;
  }

  await axios.get(url)
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

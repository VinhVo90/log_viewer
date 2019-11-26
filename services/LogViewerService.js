const axios = require('axios');
const CONSTANT = require('../configs/constants');

const getLogData = async (ctx) => {
  const searchData = ctx.request.body;
  const {
    searchUser, searchProcessSetup, searchProcess, searchEmitter, userId,
    processSetupId, processId, emitterId, querystring,
  } = searchData;
  let url = '';

  if (searchUser) {
    url = `${CONSTANT.API_SERVER}/logs/users/${userId}`;
  } else if (searchProcessSetup) {
    url = `${CONSTANT.API_SERVER}/logs/process-setups/${processSetupId}`;
  } else if (searchProcess) {
    url = `${CONSTANT.API_SERVER}/logs/processes/${processId}`;
  } else if (searchEmitter) {
    url = `${CONSTANT.API_SERVER}/logs/emitters/${emitterId}`;
  }

  if (querystring !== '') {
    url = `${url}?${querystring}`;
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

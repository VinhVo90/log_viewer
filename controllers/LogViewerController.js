const LogViewerService = require('../services/LogViewerService');

const getIndex = async (ctx) => {
  const model = {
    title: 'Log Viewer',
  };
  await ctx.render('logviewer/index', model);
};

const getLogData = async (ctx) => {
  await LogViewerService.getLogData(ctx);
}

module.exports = {
  getIndex,
  getLogData
};

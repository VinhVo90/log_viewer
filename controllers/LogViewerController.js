const getIndex = async (ctx) => {
  const model = {
    title: 'Log Viewer',
  };
  await ctx.render('logviewer/index', model);
};

module.exports = {
  getIndex,
};

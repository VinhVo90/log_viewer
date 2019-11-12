const path = require('path');
const sassMiddleware = require('node-sass-middleware');

const sassOpts = {
  src: path.resolve(__dirname, '..', 'sass'),
  dest: path.resolve(__dirname, '..', 'public', 'assets', 'css'),
  outputStyle: 'compressed',
  prefix: '/assets/css',
};

function nodesass(options) {
  const sass = sassMiddleware(options);
  return (ctx, next) => new Promise((resolve, reject) => {
    sass.call(sass, ctx.req, ctx.res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(next());
      }
    });
  });
}

module.exports = nodesass(sassOpts);

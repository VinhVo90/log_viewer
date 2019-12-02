const Koa = require('koa');
const Pug = require('koa-pug');
const koastatic = require('koa-static');
const bodyParser = require('koa-body');
const path = require('path');
const router = require('./routes/index.js');
const sass = require('./configs/sass.js');

const app = new Koa();

app.use(router.allowedMethods());

app.use(bodyParser({
  multipart: true,
  urlencoded: true,
}));

app.use(async (ctx, next) => {
  if (ctx.request.path.indexOf('assets') < 0) {
    const segments = ctx.request.path.split('/');
    console.log('Segments...', segments);
    const pageIndex = 1;
    if (segments.length > 1) {
      ctx.state.activePage = segments[pageIndex];
    } else {
      ctx.state.activePage = '';
    }
  }

  await next();
});

(
  () => new Pug({
    viewPath: path.resolve(__dirname, './views'),
    basedir: path.resolve(__dirname, './views'),
    app,
  })
)();

app.use(sass);
app.use(koastatic(`${__dirname}/public`));
app.use(router.routes());

app.listen(3003, () => {
  console.log('  App is running at https://localhost:3003');
  console.log('  Press CTRL-C to stop\n');
});

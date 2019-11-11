const Router = require('koa-router');

const router = new Router();
const HomeController = require('../controllers/HomeController');
const LogViewerController = require('../controllers/LogViewerController');

router.get('/', HomeController.getIndex);

router.get('/logviewer', async (ctx) => {
  await LogViewerController.getIndex(ctx);
});

module.exports = router;

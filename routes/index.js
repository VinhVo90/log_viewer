const Router = require('koa-router');
const HomeController = require('../controllers/HomeController');
const LogViewerController = require('../controllers/LogViewerController');

const router = new Router();

router.get('/', HomeController.getIndex);

router.get('/logviewer', async (ctx) => {
  await LogViewerController.getIndex(ctx);
});

module.exports = router;

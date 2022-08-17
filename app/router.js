'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller, middleware } = app;
  const _jwt = middleware.jwtErr(app.config.jwt.secret); // 传入加密字符串
  router.get('/', controller.home.index);
  router.get('/user', controller.home.user)
  router.get('/api/user/getUserinfo', _jwt, controller.user.getUserInfo)
  router.post('/add', controller.home.add)
  router.post('/addUser', controller.home.addUser)
  router.post('/editUser', controller.home.editUser)
  router.post('/deleteUser', controller.home.deleteUser)
  router.post('/api/user/register', controller.user.register)
  router.post('/api/user/login', controller.user.login)
  router.post('/api/user/test', _jwt, controller.user.test)
  router.get('/api/user/getUserList', _jwt, controller.user.getUserList)
  router.post('/api/bill/add', _jwt, controller.bill.add)
};

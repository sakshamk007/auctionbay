const express = require('express');

const viewErrorsMiddleware = require('@middlewares/viewErrors.middleware');

const authController = require('@controllers/web/auth.controller');

module.exports = function(app){
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/web', authController)

  app.use(viewErrorsMiddleware);

}  
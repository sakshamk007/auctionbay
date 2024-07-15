const express = require('express');

const viewErrorsMiddleware = require('@middlewares/viewErrors.middleware');

const authController = require('@controllers/web/auth.controller');
const landingController = require('@controllers/web/landing.controller');

module.exports = function(app){
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/auth', authController)
  app.use('/', landingController)

  app.use(viewErrorsMiddleware);

}  
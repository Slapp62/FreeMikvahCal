const express = require('express');

const createRouteTestApp = (router, options = {}) => {
  const {
    basePath = '/api',
    authenticated = true,
    user = { _id: 'test-user-id', email: 'tester@example.com' }
  } = options;

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    req.isAuthenticated = () => authenticated;
    req.user = authenticated ? user : undefined;
    req.login = (loginUser, callback) => {
      req.user = loginUser;
      if (callback) callback();
    };
    req.logout = (callback) => {
      req.user = undefined;
      if (callback) callback();
    };
    req.session = {
      destroy: (callback) => {
        if (callback) callback();
      }
    };
    next();
  });

  app.use(basePath, router);

  app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
      error: true,
      message: error.message || 'Internal server error'
    });
  });

  return app;
};

module.exports = {
  createRouteTestApp
};

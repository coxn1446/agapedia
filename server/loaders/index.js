const express = require('express');
const loadExpress = require('./express');
const loadPassport = require('./passport');

const loadApp = async () => {
  const app = express();

  // Load Express middleware
  loadExpress(app);

  // Load Passport authentication
  const passport = loadPassport();
  app.use(passport.initialize());
  app.use(passport.session());

  // Load routes (after middleware is configured)
  const routes = require('../routes');
  app.use('/api', routes);

  // Serve React app for all non-API routes (production/QA)
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'qa') {
    const path = require('path');
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../../build/index.html'));
    });
  }

  return app;
};

module.exports = loadApp;


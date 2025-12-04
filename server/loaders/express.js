const express = require('express');
const cors = require('cors');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const path = require('path');

const loadExpress = (app) => {
  // CORS configuration
  const corsOptions = {
    origin: process.env.DEFAULT_CLIENT_URL || process.env.QA_CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  };
  app.use(cors(corsOptions));

  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Session configuration
  const sessionConfig = {
    secret: process.env.SESSION_SECRET || process.env.QA_SESSION_SECRET || process.env.REACT_APP_SESSION_SECRET || 'dev-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  // In production/QA, use PostgreSQL session store
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'qa') {
    const pgSession = require('connect-pg-simple')(session);
    const { getPool } = require('../db');
    
    sessionConfig.store = new pgSession({
      pool: getPool(),
      tableName: 'session',
    });
  }

  app.use(session(sessionConfig));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
  });
  app.use('/api/', limiter);

  // Serve static files from React app in production
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'qa') {
    app.use(express.static(path.join(__dirname, '../../build')));
  }

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
};

module.exports = loadExpress;


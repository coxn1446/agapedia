const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const articleRoutes = require('./articles');
const userRoutes = require('./users');

// Mount routes
router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);
router.use('/users', userRoutes);

// API info route
router.get('/', (req, res) => {
  res.json({ 
    message: 'Agapedia API - MediaWiki Integration',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      articles: '/api/articles',
      users: '/api/users',
    },
  });
});

module.exports = router;


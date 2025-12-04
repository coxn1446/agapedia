const express = require('express');
const router = express.Router();
const mediawikiService = require('../services/mediawikiService');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Helper to get MediaWiki cookies from session
const getMediaWikiCookies = (req) => {
  return req.session.mediawikiCookies || {};
};

// GET /api/articles - List all pages
router.get('/', async (req, res) => {
  try {
    const { from, limit } = req.query;
    const cookies = getMediaWikiCookies(req);
    
    const pages = await mediawikiService.listAllPages(
      from || '',
      parseInt(limit) || 500,
      cookies
    );

    // Transform MediaWiki page format to our API format
    const articles = pages.map(page => ({
      title: page.title,
      id: page.pageid,
    }));

    res.json({ articles });
  } catch (error) {
    console.error('Error listing articles:', error);
    res.status(500).json({ error: error.message || 'Failed to list articles' });
  }
});

// GET /api/articles/search?q=... - Search pages
router.get('/search', async (req, res) => {
  try {
    const { q, limit } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const cookies = getMediaWikiCookies(req);
    const results = await mediawikiService.searchPages(
      q,
      parseInt(limit) || 50,
      cookies
    );

    // Transform MediaWiki search format to our API format
    const articles = results.map(result => ({
      title: result.title,
      id: result.pageid,
      snippet: result.snippet,
      size: result.size,
      wordcount: result.wordcount,
    }));

    res.json({ articles, query: q });
  } catch (error) {
    console.error('Error searching articles:', error);
    res.status(500).json({ error: error.message || 'Search failed' });
  }
});

// GET /api/articles/:title - Get page content
router.get('/:title', async (req, res) => {
  try {
    const { title } = req.params;
    const cookies = getMediaWikiCookies(req);
    
    const pageContent = await mediawikiService.getPageContent(
      decodeURIComponent(title),
      cookies
    );

    if (!pageContent) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({
      title: pageContent.title,
      content: pageContent.content,
      timestamp: pageContent.timestamp,
      user: pageContent.user,
      comment: pageContent.comment,
      revid: pageContent.revid,
    });
  } catch (error) {
    console.error('Error getting article:', error);
    res.status(500).json({ error: error.message || 'Failed to get article' });
  }
});

// GET /api/articles/:title/parse - Get parsed HTML
router.get('/:title/parse', async (req, res) => {
  try {
    const { title } = req.params;
    const cookies = getMediaWikiCookies(req);
    
    // First get the raw content
    const pageContent = await mediawikiService.getPageContent(
      decodeURIComponent(title),
      cookies
    );

    if (!pageContent) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Parse the WikiText to HTML
    const parsed = await mediawikiService.parseWikiText(
      pageContent.content,
      pageContent.title,
      cookies
    );

    res.json({
      title: pageContent.title,
      html: parsed.html,
      links: parsed.links,
    });
  } catch (error) {
    console.error('Error parsing article:', error);
    res.status(500).json({ error: error.message || 'Failed to parse article' });
  }
});

// GET /api/articles/:title/revisions - Get revision history
router.get('/:title/revisions', async (req, res) => {
  try {
    const { title } = req.params;
    const { limit } = req.query;
    const cookies = getMediaWikiCookies(req);
    
    const revisions = await mediawikiService.getRevisionHistory(
      decodeURIComponent(title),
      parseInt(limit) || 50,
      cookies
    );

    // Transform MediaWiki revision format to our API format
    const history = revisions.map(rev => ({
      revid: rev.revid,
      parentid: rev.parentid,
      timestamp: rev.timestamp,
      user: rev.user,
      comment: rev.comment,
      size: rev.size,
    }));

    res.json({ title: decodeURIComponent(title), revisions: history });
  } catch (error) {
    console.error('Error getting revisions:', error);
    res.status(500).json({ error: error.message || 'Failed to get revisions' });
  }
});

// POST /api/articles - Create page (authenticated)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, content, summary } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const cookies = getMediaWikiCookies(req);
    
    const result = await mediawikiService.editPage(
      title,
      content,
      summary || '',
      cookies
    );

    res.status(201).json({
      success: true,
      title: result.title,
      revid: result.newrevid,
      message: 'Article created successfully',
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: error.message || 'Failed to create article' });
  }
});

// PUT /api/articles/:title - Edit page (authenticated)
router.put('/:title', requireAuth, async (req, res) => {
  try {
    const { title } = req.params;
    const { content, summary } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const cookies = getMediaWikiCookies(req);
    
    const result = await mediawikiService.editPage(
      decodeURIComponent(title),
      content,
      summary || '',
      cookies
    );

    res.json({
      success: true,
      title: result.title,
      revid: result.newrevid,
      message: 'Article updated successfully',
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: error.message || 'Failed to update article' });
  }
});

// DELETE /api/articles/:title - Delete page (admin only)
router.delete('/:title', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title } = req.params;
    const { reason } = req.body;
    const cookies = getMediaWikiCookies(req);
    
    await mediawikiService.deletePage(
      decodeURIComponent(title),
      reason || 'Deleted by admin',
      cookies
    );

    res.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: error.message || 'Failed to delete article' });
  }
});

module.exports = router;


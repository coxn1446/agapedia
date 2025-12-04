const express = require('express');
const router = express.Router();
const mediawikiService = require('../services/mediawikiService');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');

// Helper to get MediaWiki cookies from session
const getMediaWikiCookies = (req) => {
  return req.session.mediawikiCookies || {};
};

// GET /api/users - List all users (admin only)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { from, limit } = req.query;
    const cookies = getMediaWikiCookies(req);
    
    const users = await mediawikiService.listAllUsers(
      from || '',
      parseInt(limit) || 500,
      cookies
    );

    // Transform MediaWiki user format to our API format
    const userList = users.map(user => ({
      username: user.name,
      id: user.userid,
      groups: user.groups || [],
      rights: user.rights || [],
      editcount: user.editcount || 0,
    }));

    res.json({ users: userList });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: error.message || 'Failed to list users' });
  }
});

// GET /api/users/:username - Get user info and rights
router.get('/:username', requireAuth, async (req, res) => {
  try {
    const { username } = req.params;
    const cookies = getMediaWikiCookies(req);
    
    // Get user rights
    const userRights = await mediawikiService.getUserRights(
      decodeURIComponent(username),
      cookies
    );

    if (!userRights) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user info
    const userInfo = await mediawikiService.getUserInfo(cookies);

    res.json({
      username: decodeURIComponent(username),
      groups: userRights.groups,
      rights: userRights.rights,
      isAdmin: userRights.groups.includes('sysop'),
    });
  } catch (error) {
    console.error('Error getting user info:', error);
    res.status(500).json({ error: error.message || 'Failed to get user info' });
  }
});

// PUT /api/users/:username/block - Block user (admin only)
router.put('/:username/block', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { username } = req.params;
    const { reason, expiry } = req.body;
    const cookies = getMediaWikiCookies(req);
    
    const result = await mediawikiService.blockUser(
      decodeURIComponent(username),
      reason || 'Blocked by admin',
      expiry || 'indefinite',
      cookies
    );

    res.json({
      success: true,
      message: 'User blocked successfully',
      block: result.block,
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ error: error.message || 'Failed to block user' });
  }
});

// PUT /api/users/:username/role - Modify user groups (admin only)
router.put('/:username/role', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { username } = req.params;
    const { add, remove, reason } = req.body;
    const cookies = getMediaWikiCookies(req);
    
    if (!add && !remove) {
      return res.status(400).json({ error: 'Either add or remove groups must be specified' });
    }

    const result = await mediawikiService.setUserRights(
      decodeURIComponent(username),
      add || [],
      remove || [],
      reason || 'Role changed by admin',
      cookies
    );

    res.json({
      success: true,
      message: 'User role updated successfully',
      user: result.user,
      added: result.added,
      removed: result.removed,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: error.message || 'Failed to update user role' });
  }
});

module.exports = router;


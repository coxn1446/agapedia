// MediaWiki Authentication Service
// Handles authentication with MediaWiki and session management

const mediawikiService = require('./mediawikiService');

// Authenticate user with MediaWiki
const authenticateUser = async (username, password) => {
  try {
    const result = await mediawikiService.login(username, password);
    
    if (result.success) {
      // Get user info to check groups/rights
      const userInfo = await mediawikiService.getUserInfo(result.cookies);
      const userRights = await mediawikiService.getUserRights(username, result.cookies);
      
      return {
        success: true,
        username: result.username,
        cookies: result.cookies,
        userInfo,
        groups: userRights?.groups || [],
        rights: userRights?.rights || [],
      };
    }
    
    return { success: false };
  } catch (error) {
    console.error('MediaWiki authentication error:', error);
    throw error;
  }
};

// Create user in MediaWiki
// Note: MediaWiki API doesn't have a direct user creation endpoint
// Users must be created through the web interface or Special:UserLogin
// This function attempts to create via API if possible, otherwise returns instructions
const createUser = async (username, password, email = '') => {
  try {
    // MediaWiki doesn't support user creation via API by default
    // This would require a custom extension or manual creation
    // For now, we'll return an error indicating manual creation is needed
    throw new Error('User creation via API is not supported. Users must be created through MediaWiki web interface or Special:UserLogin page.');
  } catch (error) {
    console.error('MediaWiki user creation error:', error);
    throw error;
  }
};

// Validate MediaWiki session
const validateSession = async (cookies) => {
  try {
    const userInfo = await mediawikiService.getUserInfo(cookies);
    
    if (userInfo.id && userInfo.id > 0) {
      return {
        valid: true,
        userInfo,
      };
    }
    
    return { valid: false };
  } catch (error) {
    console.error('MediaWiki session validation error:', error);
    return { valid: false };
  }
};

// Logout from MediaWiki
// Note: MediaWiki API doesn't have a logout endpoint
// Sessions are typically managed via cookies
const logout = async (cookies) => {
  // MediaWiki logout is typically handled by clearing cookies
  // There's no API endpoint for logout
  // Return success as cookie clearing will be handled by Express
  return { success: true };
};

// Check if user is admin (has sysop group)
const isAdmin = (groups) => {
  return groups && groups.includes('sysop');
};

// Check if user is blocked
const isBlocked = (userInfo) => {
  return userInfo && (userInfo.blocked || userInfo.blockid);
};

module.exports = {
  authenticateUser,
  createUser,
  validateSession,
  logout,
  isAdmin,
  isBlocked,
};


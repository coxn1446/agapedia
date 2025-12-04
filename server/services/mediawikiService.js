// MediaWiki API Service
// Handles all interactions with MediaWiki Action API

const { getApiUrl, getMediaWikiConfig } = require('../config/mediawiki');

// Helper function to make API requests
const apiRequest = async (params, cookies = {}) => {
  const apiUrl = getApiUrl();
  const url = new URL(apiUrl);
  
  // Add format parameter
  params.format = 'json';
  
  // Add params to URL
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });

  // Prepare headers
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  // Add cookies if provided
  const cookieString = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');

  if (cookieString) {
    headers['Cookie'] = cookieString;
  }

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`MediaWiki API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check for API errors
    if (data.error) {
      throw new Error(`MediaWiki API error: ${data.error.info} (code: ${data.error.code})`);
    }

    return { data, cookies: response.headers.get('set-cookie') || null };
  } catch (error) {
    console.error('MediaWiki API request failed:', error);
    throw error;
  }
};

// POST request for write operations
const apiPostRequest = async (params, cookies = {}) => {
  const apiUrl = getApiUrl();
  
  // Add format parameter
  params.format = 'json';

  // Prepare headers
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  // Add cookies if provided
  const cookieString = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');

  if (cookieString) {
    headers['Cookie'] = cookieString;
  }

  // Convert params to form data
  const formData = new URLSearchParams();
  Object.keys(params).forEach(key => {
    formData.append(key, params[key]);
  });

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`MediaWiki API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check for API errors
    if (data.error) {
      throw new Error(`MediaWiki API error: ${data.error.info} (code: ${data.error.code})`);
    }

    return { data, cookies: response.headers.get('set-cookie') || null };
  } catch (error) {
    console.error('MediaWiki API POST request failed:', error);
    throw error;
  }
};

// Login to MediaWiki
const login = async (username, password) => {
  // First, get login token
  const tokenResponse = await apiRequest({
    action: 'query',
    meta: 'tokens',
    type: 'login',
  });

  const loginToken = tokenResponse.data.query.tokens.logintoken;

  // Perform login
  const loginResponse = await apiPostRequest({
    action: 'login',
    lgname: username,
    lgpassword: password,
    lgtoken: loginToken,
  });

  if (loginResponse.data.login.result === 'Success') {
    // Extract cookies from response
    const cookies = {};
    if (loginResponse.cookies) {
      // Parse set-cookie header
      const cookieHeader = loginResponse.cookies;
      cookieHeader.split(',').forEach(cookie => {
        const parts = cookie.split(';')[0].trim().split('=');
        if (parts.length === 2) {
          cookies[parts[0].trim()] = parts[1].trim();
        }
      });
    }

    return {
      success: true,
      username: loginResponse.data.login.lgusername,
      cookies,
    };
  } else {
    throw new Error(`Login failed: ${loginResponse.data.login.result}`);
  }
};

// Get CSRF token for write operations
const getCsrfToken = async (cookies = {}) => {
  const response = await apiRequest({
    action: 'query',
    meta: 'tokens',
    type: 'csrf',
  }, cookies);

  return response.data.query.tokens.csrftoken;
};

// Query pages
const queryPages = async (params, cookies = {}) => {
  const queryParams = {
    action: 'query',
    ...params,
  };

  const response = await apiRequest(queryParams, cookies);
  return response.data;
};

// Get page content
const getPageContent = async (title, cookies = {}) => {
  const response = await queryPages({
    titles: title,
    prop: 'revisions',
    rvprop: 'content|timestamp|user|comment|ids',
    rvslots: 'main',
  }, cookies);

  const pages = response.query.pages;
  const pageId = Object.keys(pages)[0];
  const page = pages[pageId];

  if (page.missing) {
    return null;
  }

  return {
    title: page.title,
    content: page.revisions?.[0]?.slots?.main?.content || '',
    timestamp: page.revisions?.[0]?.timestamp || null,
    user: page.revisions?.[0]?.user || null,
    comment: page.revisions?.[0]?.comment || null,
    revid: page.revisions?.[0]?.revid || null,
  };
};

// Edit/create page
const editPage = async (title, content, summary = '', cookies = {}) => {
  // Get CSRF token
  const token = await getCsrfToken(cookies);

  // Perform edit
  const response = await apiPostRequest({
    action: 'edit',
    title: title,
    text: content,
    summary: summary,
    token: token,
    bot: '1', // Mark as bot edit if using bot account
  }, cookies);

  if (response.data.edit.result === 'Success') {
    return {
      success: true,
      title: response.data.edit.title,
      newrevid: response.data.edit.newrevid,
    };
  } else {
    throw new Error(`Edit failed: ${response.data.edit.result}`);
  }
};

// Delete page
const deletePage = async (title, reason = '', cookies = {}) => {
  // Get CSRF token
  const token = await getCsrfToken(cookies);

  // Perform delete
  const response = await apiPostRequest({
    action: 'delete',
    title: title,
    reason: reason,
    token: token,
  }, cookies);

  if (response.data.delete) {
    return { success: true };
  } else {
    throw new Error('Delete failed');
  }
};

// Parse WikiText to HTML
const parseWikiText = async (text, title = 'Main Page', cookies = {}) => {
  const response = await apiPostRequest({
    action: 'parse',
    text: text,
    title: title,
    contentmodel: 'wikitext',
    prop: 'text|links',
  }, cookies);

  if (response.data.parse) {
    return {
      html: response.data.parse.text['*'],
      links: response.data.parse.links || [],
    };
  } else {
    throw new Error('Parse failed');
  }
};

// Get current user info
const getUserInfo = async (cookies = {}) => {
  const response = await queryPages({
    meta: 'userinfo',
  }, cookies);

  return response.query.userinfo;
};

// Block user
const blockUser = async (username, reason = '', expiry = 'indefinite', cookies = {}) => {
  // Get CSRF token
  const token = await getCsrfToken(cookies);

  // Perform block
  const response = await apiPostRequest({
    action: 'block',
    user: username,
    reason: reason,
    expiry: expiry,
    token: token,
  }, cookies);

  if (response.data.block) {
    return { success: true, block: response.data.block };
  } else {
    throw new Error('Block failed');
  }
};

// Get user rights
const getUserRights = async (username, cookies = {}) => {
  const response = await queryPages({
    list: 'users',
    ususers: username,
    usprop: 'groups|rights',
  }, cookies);

  const users = response.query.users;
  if (users.length > 0 && users[0].name === username) {
    return {
      groups: users[0].groups || [],
      rights: users[0].rights || [],
    };
  }
  return null;
};

// Set user rights (modify user groups)
const setUserRights = async (username, add = [], remove = [], reason = '', cookies = {}) => {
  // Get CSRF token
  const token = await getCsrfToken(cookies);

  const params = {
    action: 'userrights',
    user: username,
    token: token,
    reason: reason,
  };

  if (add.length > 0) {
    params.add = add.join('|');
  }

  if (remove.length > 0) {
    params.remove = remove.join('|');
  }

  const response = await apiPostRequest(params, cookies);

  if (response.data.userrights) {
    return {
      success: true,
      user: response.data.userrights.user,
      added: response.data.userrights.added || [],
      removed: response.data.userrights.removed || [],
    };
  } else {
    throw new Error('Set user rights failed');
  }
};

// List all pages
const listAllPages = async (apfrom = '', aplimit = 500, cookies = {}) => {
  const response = await queryPages({
    list: 'allpages',
    apfrom: apfrom,
    aplimit: aplimit,
  }, cookies);

  return response.query.allpages || [];
};

// Search pages
const searchPages = async (query, srlimit = 50, cookies = {}) => {
  const response = await queryPages({
    list: 'search',
    srsearch: query,
    srlimit: srlimit,
  }, cookies);

  return response.query.search || [];
};

// List all users
const listAllUsers = async (aufrom = '', aulimit = 500, cookies = {}) => {
  const response = await queryPages({
    list: 'allusers',
    aufrom: aufrom,
    aulimit: aulimit,
    auprop: 'groups|rights|editcount',
  }, cookies);

  return response.query.allusers || [];
};

// Get revision history
const getRevisionHistory = async (title, rvlimit = 50, cookies = {}) => {
  const response = await queryPages({
    titles: title,
    prop: 'revisions',
    rvprop: 'ids|timestamp|user|comment|size',
    rvlimit: rvlimit,
    rvdir: 'newer', // or 'older'
  }, cookies);

  const pages = response.query.pages;
  const pageId = Object.keys(pages)[0];
  const page = pages[pageId];

  return page.revisions || [];
};

module.exports = {
  login,
  getCsrfToken,
  queryPages,
  getPageContent,
  editPage,
  deletePage,
  parseWikiText,
  getUserInfo,
  blockUser,
  getUserRights,
  setUserRights,
  listAllPages,
  searchPages,
  listAllUsers,
  getRevisionHistory,
};


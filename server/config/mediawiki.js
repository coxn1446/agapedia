// MediaWiki API Configuration

const getMediaWikiConfig = () => {
  return {
    baseUrl: process.env.MEDIAWIKI_BASE_URL || process.env.QA_MEDIAWIKI_BASE_URL || 'http://localhost/mediawiki',
    apiPath: '/api.php',
    botUsername: process.env.MEDIAWIKI_BOT_USERNAME || process.env.QA_MEDIAWIKI_BOT_USERNAME || null,
    botPassword: process.env.MEDIAWIKI_BOT_PASSWORD || process.env.QA_MEDIAWIKI_BOT_PASSWORD || null,
    rateLimit: {
      requests: 100,
      window: 60000, // 1 minute
    },
  };
};

const getApiUrl = () => {
  const config = getMediaWikiConfig();
  return `${config.baseUrl}${config.apiPath}`;
};

module.exports = {
  getMediaWikiConfig,
  getApiUrl,
};


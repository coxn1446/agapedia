// Utility to convert MediaWiki HTML links to React Router links
// MediaWiki generates HTML with <a> tags, we need to intercept these
// and convert them to React Router Link components

// This function processes HTML string and converts MediaWiki internal links
// to work with React Router. Since we're using dangerouslySetInnerHTML,
// we'll process the HTML string to add data attributes that can be handled
// by a click handler, or we can use a simpler approach of modifying the href
// to use our React Router paths.

const mediawikiLinkHandler = (html) => {
  if (!html) return '';

  // MediaWiki generates links like: <a href="/wiki/Article_Name" title="Article Name">Article Name</a>
  // We want to convert these to: <a href="/article/Article_Name" ...>Article Name</a>
  // Then React Router can handle them, or we can add click handlers

  // Replace MediaWiki wiki links with our article routes
  // Pattern: href="/wiki/..." or href="/index.php?title=..."
  let processed = html.replace(
    /href="\/wiki\/([^"]+)"/g,
    (match, title) => {
      // Decode the title and re-encode for our route
      const decodedTitle = decodeURIComponent(title.replace(/_/g, ' '));
      return `href="/article/${encodeURIComponent(decodedTitle)}"`;
    }
  );

  // Also handle index.php?title= links
  processed = processed.replace(
    /href="\/index\.php\?title=([^&"]+)"/g,
    (match, title) => {
      const decodedTitle = decodeURIComponent(title);
      return `href="/article/${encodeURIComponent(decodedTitle)}"`;
    }
  );

  // Add a class to identify internal links for potential click handling
  processed = processed.replace(
    /href="\/article\/([^"]+)"/g,
    'href="/article/$1" class="article-link"'
  );

  return processed;
};

export default mediawikiLinkHandler;


<?php
/**
 * Router script for PHP built-in development server
 * Routes requests to appropriate MediaWiki entry points
 */

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . $path;

// Route MediaWiki paths first (before checking if file exists)
if (preg_match('#^/mw-config#', $path)) {
    // Installation/config paths
    if ($path === '/mw-config' || $path === '/mw-config/') {
        $_SERVER['SCRIPT_NAME'] = '/mw-config/index.php';
        $_SERVER['PHP_SELF'] = '/mw-config/index.php';
    } else {
        $_SERVER['SCRIPT_NAME'] = $path;
        $_SERVER['PHP_SELF'] = $path;
    }
    chdir(__DIR__ . '/mw-config');
    require __DIR__ . '/mw-config/index.php';
    return true;
}

// If the file exists and is not a directory, serve it
if ($path !== '/' && file_exists($file) && !is_dir($file)) {
    return false; // Serve the file as-is
}

if ($path === '/api.php' || strpos($path, '/api.php?') === 0) {
    // API endpoint
    $_SERVER['SCRIPT_NAME'] = '/api.php';
    require __DIR__ . '/api.php';
    return true;
}

if ($path === '/rest.php' || strpos($path, '/rest.php?') === 0) {
    // REST API endpoint
    $_SERVER['SCRIPT_NAME'] = '/rest.php';
    require __DIR__ . '/rest.php';
    return true;
}

// Default: route to index.php
$_SERVER['SCRIPT_NAME'] = '/index.php';
require __DIR__ . '/index.php';
return true;


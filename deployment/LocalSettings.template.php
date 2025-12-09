<?php
/**
 * LocalSettings.php Template for AgaPedia
 * 
 * After running the MediaWiki installation wizard, add these configurations
 * to the end of the generated LocalSettings.php file.
 * 
 * Copy everything below the "CUSTOM AGAPEDIA CONFIGURATION" line
 * to the end of your generated LocalSettings.php
 */

# ========================================
# CUSTOM AGAPEDIA CONFIGURATION
# Add this to the end of your generated LocalSettings.php
# ========================================

## Custom Logo Configuration
$wgLogos = [
	'1x' => "$wgResourceBasePath/resources/assets/camp-logo.png",
	'icon' => "$wgResourceBasePath/resources/assets/camp-logo.png",
];

## File Upload Configuration
$wgEnableUploads = true;
$wgMaxUploadSize = 100 * 1024 * 1024; // 100 MB

# Allowed file extensions for uploads
$wgFileExtensions = [ 'png', 'gif', 'jpg', 'jpeg', 'webp', 'svg' ];

# Use InstantCommons for common images (optional)
# $wgUseInstantCommons = true;

## VisualEditor Extension
wfLoadExtension( 'VisualEditor' );

# Enable Parsoid REST API (required for VisualEditor in MediaWiki 1.44+)
$wgParsoidEnableREST = true;

# Enable VisualEditor for all namespaces
$wgVisualEditorAvailableNamespaces = [
	NS_MAIN => true,        # Main namespace (articles)
	NS_USER => true,        # User pages
	NS_FILE => true,        # File pages
	NS_CATEGORY => true,    # Category pages
	NS_TEMPLATE => true,    # Template pages
	NS_HELP => true,        # Help pages
];

# Enable VisualEditor for wikitext content model
$wgVisualEditorAvailableContentModels = [
	'wikitext' => 'article',
];

# Allow VisualEditor to work with anonymous users (optional)
$wgVisualEditorDisableForAnons = false;

## Performance and Caching
# Enable file cache for anonymous users (recommended for production)
# $wgUseFileCache = true;
# $wgFileCacheDirectory = "$IP/cache";
# $wgShowIPinHeader = false;

## Security Settings
# Prevent new user registrations except by sysops
# $wgGroupPermissions['*']['createaccount'] = false;

# Disable anonymous editing (optional)
# $wgGroupPermissions['*']['edit'] = false;

# Require email confirmation for new accounts
$wgEmailConfirmToEdit = true;

## Additional Extensions (optional)
# Enable these as needed:
# wfLoadExtension( 'Cite' );
# wfLoadExtension( 'ParserFunctions' );
# wfLoadExtension( 'ImageMap' );

## Logging and Debugging (disable in production)
# For troubleshooting only - disable these in production:
# $wgShowExceptionDetails = true;
# $wgShowDBErrorBacktrace = true;
# $wgDebugToolbar = true;

# ========================================
# END CUSTOM CONFIGURATION
# ========================================


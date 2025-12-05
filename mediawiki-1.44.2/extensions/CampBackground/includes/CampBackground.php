<?php
/**
 * Camp Background Extension
 * Adds custom background image CSS to all pages
 */

class CampBackground {
	public static function onBeforePageDisplay( \OutputPage $out, \Skin $skin ) {
		// Add the CSS and JS module
		$out->addModules( 'ext.campBackground' );
		
		// Also add inline style as backup to ensure it loads
		$css = '
		html, body {
			background-image: url("/resources/assets/Camp-Aerial-Shot.jpg") !important;
			background-size: cover !important;
			background-position: center center !important;
			background-attachment: fixed !important;
			background-repeat: no-repeat !important;
			background-color: transparent !important;
			min-height: 100vh !important;
		}
		.mw-page-container {
			background-color: transparent !important;
		}
		.mw-body, #content, .vector-body, #bodyContent {
			background-color: rgba(255, 255, 255, 0.95) !important;
			padding: 1.5rem !important;
		}
		#mw-content-text {
			padding: 1rem 0 !important;
		}
		.vector-page-toolbar, .vector-page-titlebar {
			padding-left: 1rem !important;
			padding-right: 1rem !important;
		}
		.mw-header, .vector-header-container, .vector-header-container .mw-header,
		.vector-sticky-header-container, .vector-sticky-header-container .mw-header {
			background-color: #ffffff !important;
			backdrop-filter: none !important;
		}
		.mw-footer-container, .mw-footer {
			background-color: #ffffff !important;
			padding: 1.5rem !important;
		}
		.vector-main-menu, .vector-main-menu-container, .vector-menu-dropdown,
		.vector-sidebar, .vector-sidebar .vector-menu-content {
			z-index: 1000 !important;
		}
		.vector-menu-dropdown-content {
			z-index: 1001 !important;
		}
		#mw-teleport-target:empty,
		#mw-teleport-target.vector-body:empty {
			display: none !important;
		}
		#mw-teleport-target.vector-body {
			background-color: transparent !important;
		}
		.vector-sticky-pinned-container {
			background-color: transparent !important;
			min-height: 0 !important;
		}
		#vector-toc-pinned-container:empty {
			display: none !important;
		}
		.mw-table-of-contents-container #vector-toc-pinned-container:empty {
			display: none !important;
		}
		.vector-sticky-pinned-container nav,
		.vector-sticky-pinned-container #mw-panel-toc {
			background-color: transparent !important;
		}
		.vector-sticky-pinned-container #mw-panel-toc:has(#vector-toc-pinned-container:empty:only-child) {
			display: none !important;
		}
		';
		$out->addInlineStyle( $css );
		
		return true;
	}
}

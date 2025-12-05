// Hide empty sticky pinned container
(function() {
	'use strict';
	
	function hideEmptyStickyContainer() {
		const stickyContainer = document.querySelector('.vector-sticky-pinned-container');
		if (stickyContainer) {
			const tocContainer = stickyContainer.querySelector('#vector-toc-pinned-container');
			// Hide if TOC container is empty or doesn't exist
			if (!tocContainer || tocContainer.children.length === 0) {
				stickyContainer.style.display = 'none';
			} else {
				stickyContainer.style.display = '';
			}
		}
	}
	
	// Run on DOM ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', hideEmptyStickyContainer);
	} else {
		hideEmptyStickyContainer();
	}
	
	// Also run after a short delay to catch dynamically loaded content
	setTimeout(hideEmptyStickyContainer, 100);
})();


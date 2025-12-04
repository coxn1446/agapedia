#!/bin/bash

# Start MediaWiki local server with auto-reload
# This script starts a PHP built-in server for MediaWiki with nodemon for auto-reload

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting MediaWiki on http://localhost:8080 with auto-reload"
echo "Press Ctrl+C to stop the server"
echo ""
echo "Access the installer at: http://localhost:8080/mw-config/"
echo ""
echo "Server will automatically restart when files change"
echo ""

# Use nodemon for auto-reload
npx nodemon --config nodemon-mediawiki.json


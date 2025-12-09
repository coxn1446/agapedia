#!/bin/bash
#
# Upload LocalSettings.php to Production Server
# Use this after downloading LocalSettings.php from the installation wizard
#

set -e

# Configuration
ZONE="us-east1-b"
VM_NAME="agapedia"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}AgaPedia LocalSettings.php Upload Script${NC}"
echo "=========================================="
echo ""

# Check if LocalSettings.php exists in current directory
if [ ! -f "LocalSettings.php" ]; then
    echo -e "${RED}Error: LocalSettings.php not found in current directory${NC}"
    echo ""
    echo "Please:"
    echo "1. Download LocalSettings.php from the MediaWiki installation wizard"
    echo "2. Add custom configurations from LocalSettings.template.php"
    echo "3. Place the file in the deployment/ directory"
    echo "4. Run this script again"
    exit 1
fi

echo -e "${YELLOW}Found LocalSettings.php${NC}"
echo ""
echo -e "${YELLOW}Uploading to production server...${NC}"

# Upload to VM
gcloud compute scp LocalSettings.php $VM_NAME:/tmp/LocalSettings.php --zone=$ZONE

echo -e "${GREEN}✓ File uploaded to VM${NC}"
echo ""
echo -e "${YELLOW}Moving to web directory and setting permissions...${NC}"

# Move to web directory and set permissions
gcloud compute ssh $VM_NAME --zone=$ZONE --command="
    sudo mv /tmp/LocalSettings.php /var/www/html/wiki/LocalSettings.php
    sudo chown www-data:www-data /var/www/html/wiki/LocalSettings.php
    sudo chmod 644 /var/www/html/wiki/LocalSettings.php
    echo 'LocalSettings.php installed successfully'
"

echo -e "${GREEN}✓ LocalSettings.php configured${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Configuration Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Your wiki should now be fully configured."
echo ""
echo "Next steps:"
echo "1. Navigate to your wiki in a browser"
echo "2. Log in with your admin credentials"
echo "3. Start creating content!"
echo ""
echo "Optional:"
echo "- Set up HTTPS: See DEPLOYMENT.md for instructions"
echo "- Configure your domain name"
echo "- Install additional extensions"


#!/bin/bash
#
# Complete Deployment for Existing VM
# Use this script if the main deploy.sh was interrupted
#

set -e

# Configuration
PROJECT_ID="agapedia-480420"
REGION="us-east1"
ZONE="us-east1-b"
VM_NAME="agapedia"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}AgaPedia Deployment Completion Script${NC}"
echo "========================================"
echo ""

# Wait for VM to be ready
echo -e "${YELLOW}Checking if VM is ready for deployment...${NC}"
echo ""

# First check if VM is accessible
echo "Testing VM connection..."
if ! gcloud compute ssh $VM_NAME --zone=$ZONE --command="echo 'VM is accessible'" 2>/dev/null; then
    echo -e "${RED}Cannot connect to VM. Is it running?${NC}"
    echo "Check with: gcloud compute instances list"
    exit 1
fi
echo -e "${GREEN}✓ VM is accessible${NC}"
echo ""

# Check if Apache is installed
echo "Checking for Apache installation..."
APACHE_CHECK=$(gcloud compute ssh $VM_NAME --zone=$ZONE --command="sudo systemctl status apache2 2>&1 | grep -q 'active' && echo 'running' || echo 'not_running'" 2>/dev/null)

if [[ "$APACHE_CHECK" == "running" ]]; then
    echo -e "${GREEN}✓ Apache is installed and running!${NC}"
else
    echo -e "${YELLOW}Apache not found. Checking startup script status...${NC}"
    
    # Show startup script logs
    echo ""
    echo "Startup script logs:"
    echo "-------------------"
    gcloud compute ssh $VM_NAME --zone=$ZONE --command="sudo journalctl -u google-startup-scripts.service --no-pager | tail -20"
    echo "-------------------"
    echo ""
    
    echo -e "${RED}Apache is not installed on the VM.${NC}"
    echo ""
    echo "The startup script either:"
    echo "  1. Hasn't run yet (VM just started)"
    echo "  2. Failed to execute"
    echo "  3. Was created before the script was attached"
    echo ""
    echo "OPTIONS:"
    echo ""
    echo "A) Install manually (recommended - fastest):"
    echo "   gcloud compute ssh $VM_NAME --zone=$ZONE"
    echo "   # Then run the commands from the installation guide"
    echo ""
    echo "B) Wait and try again (if VM just started):"
    echo "   # Wait 5 minutes and re-run this script"
    echo ""
    echo "C) Recreate VM with startup script:"
    echo "   gcloud compute instances delete $VM_NAME --zone=$ZONE"
    echo "   # Then run ./deployment/deploy.sh again"
    echo ""
    
    read -p "Do you want to skip the Apache check and continue anyway? (y/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting. Please install Apache first."
        exit 1
    fi
    
    echo -e "${YELLOW}Continuing without Apache check...${NC}"
fi

echo ""

# Create deployment package
echo -e "${YELLOW}Creating deployment package...${NC}"
echo "This may take 1-2 minutes for ~30,000 files..."
cd "$(dirname "$0")/.."

if [ -f mediawiki.tar.gz ]; then
    echo "Removing old package..."
    rm mediawiki.tar.gz
fi

echo "Compressing MediaWiki files..."
tar -czf mediawiki.tar.gz mediawiki-1.44.2/

# Show file size
PACKAGE_SIZE=$(du -h mediawiki.tar.gz | cut -f1)
echo -e "${GREEN}✓ Package created ($PACKAGE_SIZE)${NC}"

# Upload to VM
echo ""
echo -e "${YELLOW}Uploading MediaWiki to VM...${NC}"
gcloud compute scp mediawiki.tar.gz $VM_NAME:~/ --zone=$ZONE
echo -e "${GREEN}✓ Files uploaded${NC}"

# Extract files on VM
echo ""
echo -e "${YELLOW}Extracting and configuring files on VM...${NC}"

gcloud compute ssh $VM_NAME --zone=$ZONE --command="
    # Create directory if needed
    sudo mkdir -p /var/www/html
    
    # Extract MediaWiki
    sudo tar -xzf ~/mediawiki.tar.gz -C /var/www/html/
    
    # Move to wiki directory (remove if exists)
    sudo rm -rf /var/www/html/wiki
    sudo mv /var/www/html/mediawiki-1.44.2 /var/www/html/wiki
    
    # Set permissions
    sudo chown -R www-data:www-data /var/www/html/wiki
    sudo chmod -R 755 /var/www/html/wiki
    
    # Create images subdirectories
    sudo mkdir -p /var/www/html/wiki/images/temp
    sudo chown -R www-data:www-data /var/www/html/wiki/images
    
    echo 'Files extracted successfully'
"

echo -e "${GREEN}✓ Files extracted${NC}"

# Configure Apache
echo ""
echo -e "${YELLOW}Configuring Apache...${NC}"

gcloud compute scp deployment/apache-wiki.conf $VM_NAME:/tmp/ --zone=$ZONE

gcloud compute ssh $VM_NAME --zone=$ZONE --command="
    sudo mv /tmp/apache-wiki.conf /etc/apache2/sites-available/wiki.conf
    sudo a2ensite wiki.conf
    sudo a2dissite 000-default.conf 2>/dev/null || true
    sudo systemctl restart apache2
    echo 'Apache configured successfully'
"

echo -e "${GREEN}✓ Apache configured${NC}"

# Get external IP
echo ""
EXTERNAL_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(networkInterfaces[0].accessConfigs[0].natIP)")

# Get Cloud SQL connection name
DB_CONNECTION=$(gcloud sql instances describe agapedia --format='value(connectionName)')

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}Your wiki is ready for installation!${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Navigate to: ${GREEN}http://$EXTERNAL_IP/mw-config/${NC}"
echo ""
echo "2. Use these database settings in the installation wizard:"
echo "   Database type: PostgreSQL"
echo "   Database host: ${GREEN}$DB_CONNECTION${NC}"
echo "   Database name: agapedia_wiki"
echo "   Database user: wikiuser"
echo "   Database password: (the one you set earlier)"
echo ""
echo "3. After completing the wizard, download LocalSettings.php"
echo ""
echo "4. Add custom configurations from deployment/LocalSettings.template.php"
echo ""
echo "5. Upload LocalSettings.php:"
echo "   cd deployment"
echo "   cp ~/Downloads/LocalSettings.php ."
echo "   ./upload-localsettings.sh"
echo ""
echo "6. Access your wiki at: ${GREEN}http://$EXTERNAL_IP/${NC}"
echo ""
echo "For HTTPS setup, see DEPLOYMENT.md"
echo ""


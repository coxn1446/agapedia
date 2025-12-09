#!/bin/bash
#
# AgaPedia Deployment Helper Script
# This script helps automate the deployment process to GCP
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration - Update these values
PROJECT_ID="agapedia-480420"
REGION="us-east1"
ZONE="us-east1-b"
VM_NAME="agapedia"
DB_INSTANCE="agapedia"
STATIC_IP_NAME="agapedia"

echo -e "${GREEN}AgaPedia MediaWiki Deployment Script${NC}"
echo "========================================"
echo ""

# Function to check if gcloud is installed
check_gcloud() {
    if ! command -v gcloud &> /dev/null; then
        echo -e "${RED}Error: gcloud CLI not found. Please install Google Cloud SDK.${NC}"
        echo "Visit: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    echo -e "${GREEN}✓ gcloud CLI found${NC}"
}

# Function to set project
set_project() {
    echo ""
    echo -e "${YELLOW}Setting GCP project...${NC}"
    gcloud config set project $PROJECT_ID
    echo -e "${GREEN}✓ Project set to: $PROJECT_ID${NC}"
}

# Function to enable APIs
enable_apis() {
    echo ""
    echo -e "${YELLOW}Enabling required APIs...${NC}"
    gcloud services enable compute.googleapis.com
    gcloud services enable sqladmin.googleapis.com
    gcloud services enable storage-api.googleapis.com
    echo -e "${GREEN}✓ APIs enabled${NC}"
}

# Function to create Cloud SQL instance
create_database() {
    echo ""
    echo -e "${YELLOW}Creating Cloud SQL instance...${NC}"
    
    # Check if instance already exists
    if gcloud sql instances describe $DB_INSTANCE &> /dev/null; then
        echo -e "${YELLOW}Cloud SQL instance already exists${NC}"
    else
        echo "Please enter a root password for the database:"
        read -s DB_ROOT_PASSWORD
        echo ""
        
        gcloud sql instances create $DB_INSTANCE \
            --database-version=POSTGRES_15 \
            --tier=db-f1-micro \
            --region=$REGION \
            --root-password=$DB_ROOT_PASSWORD
        
        echo -e "${GREEN}✓ Cloud SQL instance created${NC}"
    fi
    
    # Create database
    if gcloud sql databases describe agapedia_wiki --instance=$DB_INSTANCE &> /dev/null; then
        echo -e "${YELLOW}Database already exists${NC}"
    else
        gcloud sql databases create agapedia_wiki --instance=$DB_INSTANCE
        echo -e "${GREEN}✓ Database created${NC}"
    fi
    
    # Create user
    echo "Please enter a password for the wikiuser:"
    read -s WIKI_PASSWORD
    echo ""
    
    gcloud sql users create wikiuser \
        --instance=$DB_INSTANCE \
        --password=$WIKI_PASSWORD || echo -e "${YELLOW}User may already exist${NC}"
    
    echo -e "${GREEN}✓ Database user configured${NC}"
}

# Function to create static IP
create_static_ip() {
    echo ""
    echo -e "${YELLOW}Creating static IP address...${NC}"
    
    if gcloud compute addresses describe $STATIC_IP_NAME --region=$REGION &> /dev/null; then
        echo -e "${YELLOW}Static IP already exists${NC}"
    else
        gcloud compute addresses create $STATIC_IP_NAME --region=$REGION
        echo -e "${GREEN}✓ Static IP created${NC}"
    fi
    
    STATIC_IP=$(gcloud compute addresses describe $STATIC_IP_NAME --region=$REGION --format="value(address)")
    echo -e "${GREEN}Your static IP: $STATIC_IP${NC}"
}

# Function to create firewall rules
create_firewall_rules() {
    echo ""
    echo -e "${YELLOW}Creating firewall rules...${NC}"
    
    # HTTP
    if gcloud compute firewall-rules describe allow-http &> /dev/null; then
        echo -e "${YELLOW}HTTP firewall rule already exists${NC}"
    else
        gcloud compute firewall-rules create allow-http \
            --allow=tcp:80 \
            --target-tags=http-server \
            --description="Allow HTTP traffic"
        echo -e "${GREEN}✓ HTTP firewall rule created${NC}"
    fi
    
    # HTTPS
    if gcloud compute firewall-rules describe allow-https &> /dev/null; then
        echo -e "${YELLOW}HTTPS firewall rule already exists${NC}"
    else
        gcloud compute firewall-rules create allow-https \
            --allow=tcp:443 \
            --target-tags=https-server \
            --description="Allow HTTPS traffic"
        echo -e "${GREEN}✓ HTTPS firewall rule created${NC}"
    fi
}

# Function to create VM
create_vm() {
    echo ""
    echo -e "${YELLOW}Creating Compute Engine VM...${NC}"
    
    if gcloud compute instances describe $VM_NAME --zone=$ZONE &> /dev/null; then
        echo -e "${YELLOW}VM already exists${NC}"
    else
        gcloud compute instances create $VM_NAME \
            --zone=$ZONE \
            --machine-type=e2-micro \
            --image-family=ubuntu-2204-lts \
            --image-project=ubuntu-os-cloud \
            --boot-disk-size=20GB \
            --boot-disk-type=pd-standard \
            --tags=http-server,https-server \
            --address=$STATIC_IP_NAME \
            --metadata-from-file startup-script=deployment/startup-script.sh
        
        echo -e "${GREEN}✓ VM created${NC}"
        echo -e "${YELLOW}Waiting for VM to finish setup (this may take a few minutes)...${NC}"
        sleep 60
    fi
}

# Function to create and upload deployment package
create_deployment_package() {
    echo ""
    echo -e "${YELLOW}Creating deployment package...${NC}"
    
    cd "$(dirname "$0")/.."
    
    if [ -f mediawiki.tar.gz ]; then
        echo -e "${YELLOW}Removing old package...${NC}"
        rm mediawiki.tar.gz
    fi
    
    tar -czf mediawiki.tar.gz mediawiki-1.44.2/
    echo -e "${GREEN}✓ Deployment package created${NC}"
}

# Function to upload to VM
upload_to_vm() {
    echo ""
    echo -e "${YELLOW}Uploading MediaWiki to VM...${NC}"
    
    gcloud compute scp mediawiki.tar.gz $VM_NAME:~/ --zone=$ZONE
    echo -e "${GREEN}✓ Files uploaded${NC}"
}

# Function to wait for VM setup to complete
wait_for_vm_setup() {
    echo ""
    echo -e "${YELLOW}Waiting for VM startup script to complete...${NC}"
    echo "This may take 5-10 minutes. The script is installing Apache, PHP, and dependencies."
    
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo -n "."
        
        # Check if Apache is installed
        if gcloud compute ssh $VM_NAME --zone=$ZONE --command="which apache2" &> /dev/null; then
            echo ""
            echo -e "${GREEN}✓ VM setup complete!${NC}"
            return 0
        fi
        
        sleep 10
        attempt=$((attempt + 1))
    done
    
    echo ""
    echo -e "${RED}Timeout waiting for VM setup. You may need to check the VM manually.${NC}"
    return 1
}

# Function to extract on VM
extract_on_vm() {
    echo ""
    echo -e "${YELLOW}Extracting files on VM...${NC}"
    
    gcloud compute ssh $VM_NAME --zone=$ZONE --command="
        # Create directory if it doesn't exist
        sudo mkdir -p /var/www/html
        
        # Extract MediaWiki
        sudo tar -xzf ~/mediawiki.tar.gz -C /var/www/html/
        sudo mv /var/www/html/mediawiki-1.44.2 /var/www/html/wiki
        
        # Set permissions
        sudo chown -R www-data:www-data /var/www/html/wiki
        sudo chmod -R 755 /var/www/html/wiki
        
        # Create images subdirectories
        sudo mkdir -p /var/www/html/wiki/images/temp
        sudo chown -R www-data:www-data /var/www/html/wiki/images
    "
    
    echo -e "${GREEN}✓ Files extracted and permissions set${NC}"
}

# Function to configure Apache
configure_apache() {
    echo ""
    echo -e "${YELLOW}Configuring Apache...${NC}"
    
    # Upload Apache config
    gcloud compute scp deployment/apache-wiki.conf $VM_NAME:/tmp/ --zone=$ZONE
    
    # Configure Apache on VM
    gcloud compute ssh $VM_NAME --zone=$ZONE --command="
        sudo mv /tmp/apache-wiki.conf /etc/apache2/sites-available/wiki.conf
        sudo a2ensite wiki.conf
        sudo a2dissite 000-default.conf
        sudo systemctl restart apache2
    "
    
    echo -e "${GREEN}✓ Apache configured${NC}"
}

# Main deployment flow
main() {
    echo ""
    echo "This script will deploy AgaPedia to Google Cloud Platform."
    echo "Make sure you have:"
    echo "  1. Updated the configuration variables at the top of this script"
    echo "  2. Enabled billing on your GCP project"
    echo ""
    read -p "Continue? (y/n) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
    
    check_gcloud
    set_project
    enable_apis
    create_static_ip
    create_firewall_rules
    create_database
    create_vm
    wait_for_vm_setup
    create_deployment_package
    upload_to_vm
    extract_on_vm
    configure_apache
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Deployment Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Get Cloud SQL connection name:"
    echo "   gcloud sql instances describe $DB_INSTANCE --format='value(connectionName)'"
    echo ""
    echo "2. Navigate to http://$STATIC_IP/mw-config/"
    echo "   to complete the MediaWiki installation wizard"
    echo ""
    echo "3. After completing the wizard, download LocalSettings.php"
    echo "   and upload it using:"
    echo "   gcloud compute scp LocalSettings.php $VM_NAME:/tmp/ --zone=$ZONE"
    echo "   gcloud compute ssh $VM_NAME --zone=$ZONE"
    echo "   sudo mv /tmp/LocalSettings.php /var/www/html/wiki/"
    echo "   sudo chown www-data:www-data /var/www/html/wiki/LocalSettings.php"
    echo ""
    echo "For detailed instructions, see DEPLOYMENT.md"
}

# Run main function
main


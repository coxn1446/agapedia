# AgaPedia MediaWiki - GCP Deployment Guide

This guide will help you deploy AgaPedia to Google Cloud Platform.

## Prerequisites

- Google Cloud SDK installed (`gcloud` command)
- GCP project created
- Billing enabled on your GCP project
- Domain name (optional, for HTTPS)

## Phase 1: Set Up GCP Infrastructure

### 1. Set Your GCP Project

```bash
gcloud config set project YOUR_PROJECT_ID
```

### 2. Enable Required APIs

```bash
gcloud services enable compute.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable storage-api.googleapis.com
```

### 3. Create Cloud SQL Instance

```bash
# Create PostgreSQL instance
gcloud sql instances create agapedia-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=CHANGE_THIS_PASSWORD

# Create database
gcloud sql databases create agapedia_wiki --instance=agapedia-db

# Create database user
gcloud sql users create wikiuser \
  --instance=agapedia-db \
  --password=CHANGE_THIS_PASSWORD
```

**Important:** Save these credentials securely!

### 4. Reserve Static IP Address

```bash
gcloud compute addresses create agapedia-ip --region=us-central1
```

Get the IP address:
```bash
gcloud compute addresses describe agapedia-ip --region=us-central1 --format="value(address)"
```

### 5. Create Compute Engine VM

```bash
gcloud compute instances create agapedia-vm \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --boot-disk-type=pd-standard \
  --tags=http-server,https-server \
  --address=agapedia-ip \
  --metadata-from-file startup-script=deployment/startup-script.sh
```

### 6. Configure Firewall Rules

```bash
# Allow HTTP
gcloud compute firewall-rules create allow-http \
  --allow=tcp:80 \
  --target-tags=http-server \
  --description="Allow HTTP traffic"

# Allow HTTPS
gcloud compute firewall-rules create allow-https \
  --allow=tcp:443 \
  --target-tags=https-server \
  --description="Allow HTTPS traffic"
```

### 7. Allow VM to Connect to Cloud SQL

```bash
# Get the Cloud SQL connection name
gcloud sql instances describe agapedia-db --format="value(connectionName)"

# The connection name will be: PROJECT_ID:REGION:INSTANCE_NAME
# You'll use this in the MediaWiki installation
```

## Phase 2: Deploy MediaWiki

### 1. Create Deployment Package

From the agapedia directory:

```bash
cd /Users/williamnash/Desktop/Coding/repos/agapedia
tar -czf mediawiki.tar.gz mediawiki-1.44.2/
```

### 2. Upload to VM

```bash
gcloud compute scp mediawiki.tar.gz agapedia-vm:~/ --zone=us-central1-a
```

### 3. SSH into VM and Extract Files

```bash
gcloud compute ssh agapedia-vm --zone=us-central1-a
```

Once connected to the VM:

```bash
# Extract MediaWiki
sudo tar -xzf ~/mediawiki.tar.gz -C /var/www/html/
sudo mv /var/www/html/mediawiki-1.44.2 /var/www/html/wiki

# Set permissions
sudo chown -R www-data:www-data /var/www/html/wiki
sudo chmod -R 755 /var/www/html/wiki

# Create images subdirectories if needed
sudo mkdir -p /var/www/html/wiki/images/temp
sudo chown -R www-data:www-data /var/www/html/wiki/images
sudo chmod -R 755 /var/www/html/wiki/images
```

### 4. Configure Apache

```bash
# Copy the Apache configuration
sudo cp /var/www/html/wiki/deployment/apache-wiki.conf /etc/apache2/sites-available/wiki.conf

# Edit the configuration if needed
sudo nano /etc/apache2/sites-available/wiki.conf

# Enable site
sudo a2ensite wiki.conf
sudo a2dissite 000-default.conf
sudo systemctl restart apache2
```

## Phase 3: Run MediaWiki Installation

### 1. Access Installation Wizard

Get your VM's external IP:
```bash
gcloud compute instances describe agapedia-vm --zone=us-central1-a --format="value(networkInterfaces[0].accessConfigs[0].natIP)"
```

Navigate to: `http://YOUR_VM_IP/mw-config/`

### 2. Complete Installation Wizard

**Database Configuration:**
- Database type: PostgreSQL
- Database host: `/cloudsql/PROJECT_ID:REGION:agapedia-db`
  - Or use the IP from Cloud SQL (requires authorized networks)
- Database name: `agapedia_wiki`
- Database username: `wikiuser`
- Database password: (the password you set earlier)

**Wiki Configuration:**
- Wiki name: `AgaPedia`
- Admin username: Choose your admin username
- Admin password: Choose a strong password
- Admin email: Your email

**Options:**
- User rights: Choose appropriate settings
- Enable file uploads: Yes
- Enable VisualEditor: Yes

### 3. Download LocalSettings.php

After installation completes, download the `LocalSettings.php` file.

### 4. Customize LocalSettings.php

Edit the downloaded file to add:

```php
# At the end of the file, add:

## Custom logo
$wgLogos = [
    '1x' => "$wgResourceBasePath/resources/assets/camp-logo.png",
    'icon' => "$wgResourceBasePath/resources/assets/camp-logo.png",
];

## File uploads
$wgEnableUploads = true;
$wgMaxUploadSize = 100 * 1024 * 1024; // 100 MB
$wgFileExtensions = [ 'png', 'gif', 'jpg', 'jpeg', 'webp', 'svg' ];

## VisualEditor
wfLoadExtension( 'VisualEditor' );
$wgParsoidEnableREST = true;
$wgVisualEditorAvailableNamespaces = [
    NS_MAIN => true,
    NS_USER => true,
    NS_FILE => true,
    NS_CATEGORY => true,
    NS_TEMPLATE => true,
    NS_HELP => true,
];
$wgVisualEditorAvailableContentModels = [
    'wikitext' => 'article',
];
$wgVisualEditorDisableForAnons = false;
```

### 5. Upload LocalSettings.php

```bash
gcloud compute scp LocalSettings.php agapedia-vm:/tmp/ --zone=us-central1-a

# SSH into VM
gcloud compute ssh agapedia-vm --zone=us-central1-a

# Move file to wiki directory
sudo mv /tmp/LocalSettings.php /var/www/html/wiki/
sudo chown www-data:www-data /var/www/html/wiki/LocalSettings.php
sudo chmod 644 /var/www/html/wiki/LocalSettings.php
```

## Phase 4: Set Up HTTPS (Optional but Recommended)

### 1. Point Your Domain to VM

Update your domain's DNS A record to point to your VM's static IP.

### 2. Install SSL Certificate

SSH into your VM:

```bash
gcloud compute ssh agapedia-vm --zone=us-central1-a
```

Install Certbot:
```bash
sudo apt install certbot python3-certbot-apache -y
```

Get certificate:
```bash
sudo certbot --apache -d yourdomain.com -d www.yourdomain.com
```

### 3. Update MediaWiki Configuration

Edit LocalSettings.php:
```bash
sudo nano /var/www/html/wiki/LocalSettings.php
```

Update the server URL:
```php
$wgServer = "https://yourdomain.com";
```

## Phase 5: Configure PHP Upload Limits

SSH into VM and edit PHP configuration:

```bash
sudo nano /etc/php/8.1/apache2/php.ini
```

Update these values:
```ini
upload_max_filesize = 100M
post_max_size = 100M
memory_limit = 256M
max_execution_time = 300
```

Restart Apache:
```bash
sudo systemctl restart apache2
```

## Monitoring and Maintenance

### View Apache Logs
```bash
sudo tail -f /var/log/apache2/wiki_error.log
sudo tail -f /var/log/apache2/wiki_access.log
```

### Backup Database
Cloud SQL automatically backs up daily. To create manual backup:
```bash
gcloud sql backups create --instance=agapedia-db
```

### Create VM Snapshot
```bash
gcloud compute disks snapshot agapedia-vm \
  --snapshot-names=agapedia-vm-snapshot-$(date +%Y%m%d) \
  --zone=us-central1-a
```

## Troubleshooting

### Can't connect to database
- Check Cloud SQL connection name is correct
- Verify database credentials
- Ensure VM has Cloud SQL access

### File upload errors
- Check `/var/www/html/wiki/images` permissions
- Verify PHP upload limits are set
- Check Apache error logs

### Wiki not accessible
- Verify firewall rules allow HTTP/HTTPS
- Check Apache is running: `sudo systemctl status apache2`
- Verify site configuration: `sudo apache2ctl -S`

## Estimated Costs

- Cloud SQL (db-f1-micro): ~$7/month
- Compute Engine (e2-micro): Free tier or ~$7/month
- Static IP: ~$3/month
- **Total: ~$10-20/month**

## Security Checklist

- [ ] Use strong passwords for database and admin account
- [ ] Enable HTTPS with Let's Encrypt
- [ ] Configure Cloud SQL for SSL connections
- [ ] Set up automated backups
- [ ] Configure fail2ban for brute force protection
- [ ] Keep MediaWiki and extensions updated
- [ ] Restrict database access to only your VM

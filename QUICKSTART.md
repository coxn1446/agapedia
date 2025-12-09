# AgaPedia - Quick Deployment Guide

This is a quick reference for deploying AgaPedia to Google Cloud Platform.

## Prerequisites

1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Create a GCP project: https://console.cloud.google.com
3. Enable billing on your project

## Quick Deploy (Automated)

### 1. Configure the deployment script

Edit `deployment/deploy.sh` and update these variables:

```bash
PROJECT_ID="your-gcp-project-id"
REGION="us-central1"  # Change if needed
ZONE="us-central1-a"  # Change if needed
```

### 2. Run the deployment script

```bash
cd /Users/williamnash/Desktop/Coding/repos/agapedia
./deployment/deploy.sh
```

The script will:
- Create Cloud SQL database
- Create VM instance
- Upload MediaWiki files
- Configure Apache

### 3. Complete MediaWiki Installation

After the script completes, it will display your VM's IP address.

Navigate to: `http://YOUR_VM_IP/mw-config/`

During installation:
- **Database type:** PostgreSQL
- **Database host:** Use the Cloud SQL connection name (script will show you how to get it)
- **Database name:** `agapedia_wiki`
- **Database user:** `wikiuser`
- **Database password:** (the one you set during deployment)
- **Wiki name:** AgaPedia
- **Enable file uploads:** Yes
- **Install VisualEditor:** Yes

### 4. Download and customize LocalSettings.php

1. Download the generated `LocalSettings.php` from the installation wizard
2. Open `deployment/LocalSettings.template.php` in this repo
3. Copy the custom configuration section to the end of your downloaded `LocalSettings.php`
4. Upload to your VM:

```bash
gcloud compute scp LocalSettings.php agapedia-vm:/tmp/ --zone=us-central1-a
gcloud compute ssh agapedia-vm --zone=us-central1-a --command="sudo mv /tmp/LocalSettings.php /var/www/html/wiki/ && sudo chown www-data:www-data /var/www/html/wiki/LocalSettings.php"
```

### 5. Your wiki is live!

Access it at: `http://YOUR_VM_IP/`

## Manual Deployment

For step-by-step manual deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

## Set Up HTTPS (Recommended)

After your domain is pointing to your VM:

```bash
gcloud compute ssh agapedia-vm --zone=us-central1-a
sudo apt install certbot python3-certbot-apache -y
sudo certbot --apache -d yourdomain.com
```

Then update `LocalSettings.php`:
```php
$wgServer = "https://yourdomain.com";
```

## Costs

Expected monthly costs:
- Cloud SQL (db-f1-micro): ~$7/month
- Compute Engine (e2-micro): Free tier or ~$7/month
- Static IP: ~$3/month
- **Total: ~$10-20/month**

## Support

For issues or questions, refer to:
- [MediaWiki Installation Guide](https://www.mediawiki.org/wiki/Manual:Installing_MediaWiki)
- [GCP Documentation](https://cloud.google.com/docs)
- Full deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)

## What's Included

Your deployment includes:
- MediaWiki 1.44.2
- Custom AgaPedia logo
- VisualEditor extension
- File upload support (up to 100MB)
- PostgreSQL database (Cloud SQL)
- Automated daily backups
- Apache web server with security configurations

## Troubleshooting

### Can't access the wiki
- Check firewall rules: `gcloud compute firewall-rules list`
- Verify VM is running: `gcloud compute instances list`
- Check Apache logs: `gcloud compute ssh agapedia-vm --zone=us-central1-a --command="sudo tail -f /var/log/apache2/wiki_error.log"`

### Database connection issues
- Get Cloud SQL connection: `gcloud sql instances describe agapedia-db --format='value(connectionName)'`
- Verify credentials in LocalSettings.php
- Check Cloud SQL is running: `gcloud sql instances list`

### File uploads not working
- Check PHP limits: `php -i | grep upload`
- Verify directory permissions on VM
- Check `/var/www/html/wiki/images` is writable

## Next Steps

After deployment:
1. Create your first pages
2. Set up user accounts
3. Configure your domain name
4. Enable HTTPS
5. Set up automated backups
6. Install additional MediaWiki extensions as needed


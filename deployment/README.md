# Deployment Files for AgaPedia

This directory contains all the necessary files and scripts for deploying AgaPedia to Google Cloud Platform.

## Files

### `deploy.sh`
Automated deployment script that sets up the entire GCP infrastructure and deploys MediaWiki.

**Usage:**
```bash
# Edit the script to set your PROJECT_ID
nano deploy.sh

# Make it executable (if not already)
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

### `startup-script.sh`
VM initialization script that runs when the Compute Engine instance first boots. This script:
- Installs Apache web server
- Installs PHP 8.1 and all required extensions
- Installs PostgreSQL client
- Configures PHP settings for MediaWiki
- Sets up Cloud SQL Proxy
- Configures log rotation

This script is automatically used by `deploy.sh` when creating the VM.

### `apache-wiki.conf`
Apache VirtualHost configuration file for AgaPedia. Includes:
- DocumentRoot configuration
- Security headers
- Directory access restrictions
- File upload directory configuration
- Logging configuration
- HTTPS template (commented out)

**Installation:**
```bash
sudo cp apache-wiki.conf /etc/apache2/sites-available/wiki.conf
sudo a2ensite wiki.conf
sudo a2dissite 000-default.conf
sudo systemctl restart apache2
```

### `LocalSettings.template.php`
Template with custom AgaPedia configurations to add to the MediaWiki-generated LocalSettings.php.

**Usage:**
1. Complete the MediaWiki installation wizard
2. Download the generated LocalSettings.php
3. Open this template file
4. Copy the custom configuration section to the end of your LocalSettings.php
5. Upload the modified LocalSettings.php to your server

Includes configurations for:
- Custom logo
- File uploads (100MB limit)
- VisualEditor extension
- Security settings
- Performance optimizations

## Deployment Process

### Quick Deployment (Recommended)
1. Edit `deploy.sh` and set your GCP project ID
2. Run `./deploy.sh`
3. Follow the prompts
4. Access the installation wizard at the displayed IP address
5. Download and customize LocalSettings.php
6. Upload LocalSettings.php to the server

### Manual Deployment
See the main [DEPLOYMENT.md](../DEPLOYMENT.md) file for detailed manual deployment instructions.

## GCP Resources Created

The deployment script creates:
- **Cloud SQL Instance** (`agapedia-db`)
  - Type: PostgreSQL 15
  - Tier: db-f1-micro
  - Database: `agapedia_wiki`
  - User: `wikiuser`

- **Compute Engine VM** (`agapedia-vm`)
  - Machine type: e2-micro (free tier eligible)
  - OS: Ubuntu 22.04 LTS
  - Disk: 20GB standard persistent disk
  - Static IP assigned

- **Firewall Rules**
  - `allow-http`: TCP port 80
  - `allow-https`: TCP port 443

- **Static IP Address** (`agapedia-ip`)

## Cost Estimate

- Cloud SQL (db-f1-micro): ~$7/month
- Compute Engine (e2-micro): Free tier or ~$7/month  
- Static IP: ~$3/month
- Total: **~$10-20/month**

## Post-Deployment

After deploying:

1. **Set up HTTPS** (recommended)
   ```bash
   gcloud compute ssh agapedia-vm --zone=us-central1-a
   sudo apt install certbot python3-certbot-apache -y
   sudo certbot --apache -d yourdomain.com
   ```

2. **Update LocalSettings.php for HTTPS**
   ```php
   $wgServer = "https://yourdomain.com";
   ```

3. **Configure backups**
   - Cloud SQL backups are automatic (enabled by default)
   - Set up VM snapshots for the boot disk

4. **Monitor your wiki**
   - Check Apache logs: `/var/log/apache2/wiki_error.log`
   - Monitor Cloud SQL in GCP Console
   - Set up uptime checks in Cloud Monitoring

## Troubleshooting

### Deployment script fails
- Verify you have gcloud installed and authenticated
- Check billing is enabled on your GCP project
- Ensure you have necessary permissions in the project

### Can't connect to database during installation
- Get the Cloud SQL connection name: `gcloud sql instances describe agapedia-db --format='value(connectionName)'`
- Use the full connection name in the format: `PROJECT:REGION:INSTANCE`
- Verify database credentials

### VM not accessible
- Check VM is running: `gcloud compute instances list`
- Verify firewall rules exist: `gcloud compute firewall-rules list`
- Check VM external IP: `gcloud compute instances describe agapedia-vm --zone=us-central1-a --format='value(networkInterfaces[0].accessConfigs[0].natIP)'`

### Apache not working
- SSH into VM: `gcloud compute ssh agapedia-vm --zone=us-central1-a`
- Check Apache status: `sudo systemctl status apache2`
- View error logs: `sudo tail -f /var/log/apache2/wiki_error.log`
- Verify site is enabled: `sudo apache2ctl -S`

## Security Checklist

- [ ] Strong database passwords set
- [ ] HTTPS configured with Let's Encrypt
- [ ] File upload directory properly secured (no PHP execution)
- [ ] Sensitive directories restricted in Apache config
- [ ] Regular backups configured
- [ ] Cloud SQL authorized networks configured
- [ ] Firewall rules properly restricted
- [ ] MediaWiki and extensions kept up to date

## Maintenance

### Update MediaWiki
1. Backup database and files
2. Upload new MediaWiki version
3. Run `php maintenance/update.php`
4. Test thoroughly

### Backup Database
```bash
gcloud sql backups create --instance=agapedia-db
```

### Create VM Snapshot
```bash
gcloud compute disks snapshot agapedia-vm \
  --snapshot-names=agapedia-vm-$(date +%Y%m%d) \
  --zone=us-central1-a
```

## Support

- [MediaWiki Documentation](https://www.mediawiki.org/wiki/Documentation)
- [GCP Documentation](https://cloud.google.com/docs)
- Main deployment guide: [DEPLOYMENT.md](../DEPLOYMENT.md)
- Quick start: [QUICKSTART.md](../QUICKSTART.md)


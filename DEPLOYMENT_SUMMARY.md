# AgaPedia GCP Deployment - Summary

## ✅ Deployment Preparation Complete

Your MediaWiki installation is ready for deployment to Google Cloud Platform!

## What Was Done

### 1. Local Configuration Removed
- ✅ Deleted `LocalSettings.php` (will be regenerated on production server)
- ✅ Created `.gcloudignore` to exclude unnecessary files from deployment
- ✅ Kept custom assets: `camp-logo.png` and `camp-background.jpg`

### 2. Deployment Scripts Created
- ✅ `deployment/deploy.sh` - Automated deployment script
- ✅ `deployment/startup-script.sh` - VM initialization script  
- ✅ `deployment/apache-wiki.conf` - Apache web server configuration
- ✅ `deployment/LocalSettings.template.php` - Configuration template

### 3. Documentation Created
- ✅ `DEPLOYMENT.md` - Detailed deployment guide (8 KB)
- ✅ `QUICKSTART.md` - Quick start guide (3.8 KB)
- ✅ `README.md` - Main project documentation
- ✅ `deployment/README.md` - Deployment files documentation

## Next Steps to Deploy

### Option A: Automated Deployment (Recommended - 30 minutes)

1. **Edit the deployment script:**
   ```bash
   nano /Users/williamnash/Desktop/Coding/repos/agapedia/deployment/deploy.sh
   ```
   Update line 13: `PROJECT_ID="your-gcp-project-id"`

2. **Run the deployment:**
   ```bash
   cd /Users/williamnash/Desktop/Coding/repos/agapedia
   ./deployment/deploy.sh
   ```

3. **Complete installation wizard:**
   - Navigate to `http://YOUR_VM_IP/mw-config/`
   - Use the Cloud SQL connection details provided by the script
   - Download generated `LocalSettings.php`

4. **Add custom configurations:**
   - Open `deployment/LocalSettings.template.php`
   - Copy the custom section to your downloaded `LocalSettings.php`
   - Upload to server:
     ```bash
     gcloud compute scp LocalSettings.php agapedia-vm:/tmp/ --zone=us-central1-a
     gcloud compute ssh agapedia-vm --zone=us-central1-a
     sudo mv /tmp/LocalSettings.php /var/www/html/wiki/
     sudo chown www-data:www-data /var/www/html/wiki/LocalSettings.php
     ```

5. **Your wiki is live!** 🎉

### Option B: Manual Deployment (2-3 hours)

Follow the detailed step-by-step guide in `DEPLOYMENT.md`.

## Files Ready for Deployment

```
agapedia/
├── mediawiki-1.44.2/          # 30,000+ files ready to deploy
│   ├── .gcloudignore          # Optimized for GCP deployment
│   ├── resources/assets/
│   │   ├── camp-logo.png      # ✓ Custom logo
│   │   └── camp-background.jpg # ✓ Background image
│   └── (no LocalSettings.php) # ✓ Will be created fresh
├── deployment/
│   ├── deploy.sh              # ✓ Main deployment script
│   ├── startup-script.sh      # ✓ VM setup automation
│   ├── apache-wiki.conf       # ✓ Web server config
│   └── LocalSettings.template.php # ✓ Configuration template
└── Documentation              # ✓ Complete guides
```

## Estimated Costs (Monthly)

| Resource | Tier | Cost |
|----------|------|------|
| Cloud SQL (PostgreSQL) | db-f1-micro | ~$7 |
| Compute Engine VM | e2-micro | Free tier or ~$7 |
| Static IP Address | - | ~$3 |
| **Total** | | **~$10-20/month** |

## What Gets Deployed

### Infrastructure (GCP)
- PostgreSQL database (Cloud SQL)
- Ubuntu 22.04 VM (Compute Engine)
- Static external IP address
- Firewall rules (HTTP/HTTPS)
- Automated daily database backups

### Software Stack (VM)
- Apache 2.4 web server
- PHP 8.1 with all required extensions
- PostgreSQL client
- Cloud SQL Proxy
- Certbot (for HTTPS)

### MediaWiki
- MediaWiki 1.44.2 core
- VisualEditor extension
- Custom AgaPedia branding
- File upload support (100MB limit)
- All bundled extensions

## Key Configuration Details

### Database Configuration (for installation wizard)
- **Type:** PostgreSQL
- **Host:** Get from: `gcloud sql instances describe agapedia-db --format='value(connectionName)'`
- **Database:** `agapedia_wiki`
- **Username:** `wikiuser`
- **Password:** (set during deployment)

### Wiki Configuration
- **Name:** AgaPedia
- **File Uploads:** Enabled (100MB max)
- **VisualEditor:** Enabled
- **Default Skin:** Minerva (mobile-friendly)

## Security Features Included

✅ Apache security headers  
✅ Directory access restrictions  
✅ PHP execution disabled in uploads directory  
✅ Sensitive files blocked (.git, .env, etc.)  
✅ HTTPS ready (Let's Encrypt)  
✅ Automated database backups  
✅ Cloud SQL SSL connections supported  

## Post-Deployment Tasks

### Immediately After Deployment
1. Complete MediaWiki installation wizard
2. Upload customized LocalSettings.php
3. Test wiki access and functionality
4. Create admin account

### Within First Week
1. Set up domain name and DNS
2. Configure HTTPS with Let's Encrypt
3. Create main page and initial content
4. Set up user accounts
5. Test file uploads and VisualEditor

### Ongoing Maintenance
- Monitor error logs weekly
- Update MediaWiki monthly
- Review backups monthly
- Check security updates regularly

## Troubleshooting Resources

**If deployment fails:**
- Check `deployment/README.md` for common issues
- Verify GCP project has billing enabled
- Ensure you have necessary GCP permissions
- Check gcloud CLI is authenticated

**If installation wizard fails:**
- Verify Cloud SQL connection details
- Check database credentials
- Review Apache error logs on VM
- Ensure firewall rules allow HTTP

**For help:**
- Read `DEPLOYMENT.md` for detailed troubleshooting
- Check MediaWiki.org documentation
- Review GCP Cloud SQL documentation
- Check Apache logs: `/var/log/apache2/wiki_error.log`

## Quick Command Reference

### Check deployment status:
```bash
# List all GCP resources
gcloud compute instances list
gcloud sql instances list
gcloud compute addresses list

# Check VM status
gcloud compute ssh agapedia-vm --zone=us-central1-a --command="sudo systemctl status apache2"

# View logs
gcloud compute ssh agapedia-vm --zone=us-central1-a
sudo tail -f /var/log/apache2/wiki_error.log
```

### Create manual backup:
```bash
gcloud sql backups create --instance=agapedia-db
gcloud compute disks snapshot agapedia-vm --zone=us-central1-a
```

### Update DNS after deployment:
1. Get static IP: `gcloud compute addresses describe agapedia-ip --region=us-central1 --format="value(address)"`
2. Create A record pointing your domain to this IP
3. Wait for DNS propagation (up to 48 hours)
4. Set up HTTPS with Certbot

## Support Contacts

- **MediaWiki:** https://www.mediawiki.org/wiki/Project:Support_desk
- **GCP Support:** https://cloud.google.com/support
- **Documentation:** All guides in this repository

---

## Ready to Deploy? 🚀

**For automated deployment:**
```bash
cd /Users/williamnash/Desktop/Coding/repos/agapedia
./deployment/deploy.sh
```

**For manual deployment:**
Read [DEPLOYMENT.md](DEPLOYMENT.md)

**Questions?**
Check [QUICKSTART.md](QUICKSTART.md) for quick answers

---

**Status:** ✅ Ready for Production Deployment  
**Date Prepared:** December 6, 2024  
**MediaWiki Version:** 1.44.2  
**Target Platform:** Google Cloud Platform


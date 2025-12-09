# AgaPedia Deployment Checklist

Use this checklist to track your deployment progress.

## Pre-Deployment ✅

- [x] MediaWiki 1.44.2 installed locally
- [x] Custom logo added (camp-logo.png)
- [x] Custom background image added (camp-background.jpg)
- [x] VisualEditor extension configured
- [x] LocalSettings.php removed (will be regenerated)
- [x] .gcloudignore file created
- [x] Deployment scripts created
- [x] Documentation prepared

## GCP Account Setup

- [ ] Google Cloud account created
- [ ] GCP project created
- [ ] Billing enabled on project
- [ ] Google Cloud SDK installed locally
- [ ] gcloud CLI authenticated (`gcloud auth login`)
- [ ] Project ID noted: `_________________`

## Infrastructure Setup

### Cloud SQL Database
- [ ] Cloud SQL instance created (`agapedia-db`)
- [ ] Database created (`agapedia_wiki`)
- [ ] Database user created (`wikiuser`)
- [ ] Database password saved securely
- [ ] Cloud SQL connection name noted: `_________________`

### Compute Engine VM
- [ ] Static IP address reserved
- [ ] Static IP noted: `_________________`
- [ ] VM instance created (`agapedia-vm`)
- [ ] Firewall rules created (HTTP/HTTPS)
- [ ] VM is running and accessible
- [ ] VM external IP matches static IP

### Files Deployed
- [ ] MediaWiki files uploaded to VM
- [ ] Files extracted to `/var/www/html/wiki`
- [ ] Permissions set correctly (www-data:www-data)
- [ ] Images directory writable
- [ ] Apache configuration uploaded
- [ ] Apache restarted successfully

## MediaWiki Installation

### Installation Wizard
- [ ] Accessed installation wizard at `http://VM_IP/mw-config/`
- [ ] Selected language: English
- [ ] Database type: PostgreSQL
- [ ] Database host configured (Cloud SQL connection)
- [ ] Database credentials entered
- [ ] Database connection successful
- [ ] Wiki name set: AgaPedia
- [ ] Admin account created
- [ ] Admin username: `_________________`
- [ ] Admin password saved securely
- [ ] Admin email: `_________________`
- [ ] File uploads enabled
- [ ] LocalSettings.php downloaded

### LocalSettings.php Configuration
- [ ] Downloaded LocalSettings.php from wizard
- [ ] Opened `deployment/LocalSettings.template.php`
- [ ] Copied custom configuration section
- [ ] Added custom configs to downloaded LocalSettings.php
- [ ] Verified logo paths are correct
- [ ] Verified file upload settings (100MB)
- [ ] Verified VisualEditor configuration
- [ ] LocalSettings.php uploaded to server
- [ ] File permissions set (644, www-data:www-data)
- [ ] Wiki accessible at `http://VM_IP/`

## Testing

### Basic Functionality
- [ ] Can access main page
- [ ] Can log in as admin
- [ ] Can create a new page
- [ ] Can edit existing pages
- [ ] Logo displays correctly
- [ ] Navigation works

### VisualEditor
- [ ] Edit button appears on pages
- [ ] VisualEditor loads when clicking Edit
- [ ] Can make edits in VisualEditor
- [ ] Can save changes
- [ ] Can switch between Visual and Source modes

### File Uploads
- [ ] Special:Upload page accessible
- [ ] Can select file to upload
- [ ] File uploads successfully
- [ ] Uploaded file appears on File: page
- [ ] Can embed uploaded files in pages
- [ ] Thumbnails generate correctly

### Performance
- [ ] Pages load quickly (< 2 seconds)
- [ ] No errors in browser console
- [ ] Apache error log clean (`/var/log/apache2/wiki_error.log`)

## Domain and HTTPS Setup (Optional but Recommended)

### DNS Configuration
- [ ] Domain name purchased: `_________________`
- [ ] DNS A record created
- [ ] A record points to static IP: `_________________`
- [ ] DNS propagation complete (check with `nslookup yourdomain.com`)
- [ ] Can access wiki via domain name

### HTTPS/SSL Configuration
- [ ] Certbot installed on VM
- [ ] SSL certificate obtained (`certbot --apache -d yourdomain.com`)
- [ ] HTTPS works (`https://yourdomain.com`)
- [ ] HTTP redirects to HTTPS
- [ ] LocalSettings.php updated: `$wgServer = "https://yourdomain.com"`
- [ ] SSL certificate auto-renewal tested

## Security Hardening

- [ ] Strong database password used (16+ characters)
- [ ] Strong admin password used (16+ characters)
- [ ] HTTPS enabled
- [ ] Database SSL connection configured (optional)
- [ ] Fail2ban installed (optional)
- [ ] Cloud SQL authorized networks configured
- [ ] Sensitive directories restricted in Apache config
- [ ] PHP execution disabled in images directory
- [ ] Security headers enabled in Apache

## Backup Configuration

- [ ] Cloud SQL automated backups enabled (default)
- [ ] Backup retention period set (7 days default)
- [ ] Manual backup tested
- [ ] VM snapshot created
- [ ] Snapshot schedule configured (optional)
- [ ] Backup restoration procedure documented
- [ ] Recovery tested (optional but recommended)

## Monitoring and Maintenance

- [ ] Apache logs location verified
- [ ] Can access logs: `sudo tail -f /var/log/apache2/wiki_error.log`
- [ ] Cloud Monitoring configured (optional)
- [ ] Uptime checks configured (optional)
- [ ] Email alerts configured (optional)
- [ ] Update schedule planned
- [ ] Maintenance window identified

## Post-Deployment

### Initial Content
- [ ] Main page created
- [ ] About page created
- [ ] Help/Documentation pages created
- [ ] Navigation menu configured
- [ ] Categories created
- [ ] Templates created (if needed)

### User Management
- [ ] Additional admin accounts created (if needed)
- [ ] User registration policy configured
- [ ] User permissions reviewed
- [ ] Email notifications configured
- [ ] User welcome page created

### Extensions and Features
- [ ] All required extensions installed
- [ ] Extension configurations verified
- [ ] Special pages tested
- [ ] API access tested (optional)
- [ ] Mobile view tested

## Ongoing Tasks

### Weekly
- [ ] Review error logs
- [ ] Check disk space usage
- [ ] Monitor traffic and performance
- [ ] Review recent changes

### Monthly
- [ ] Check for MediaWiki updates
- [ ] Check for extension updates
- [ ] Verify backups are working
- [ ] Review security updates
- [ ] Test restore procedure

### Quarterly
- [ ] Audit user accounts
- [ ] Review permissions and policies
- [ ] Update documentation
- [ ] Performance optimization review
- [ ] Security audit

## Troubleshooting Reference

### Quick Diagnostic Commands

```bash
# Check VM status
gcloud compute instances list

# Check Cloud SQL status  
gcloud sql instances list

# SSH into VM
gcloud compute ssh agapedia-vm --zone=us-central1-a

# Check Apache status
sudo systemctl status apache2

# View Apache error logs
sudo tail -f /var/log/apache2/wiki_error.log

# Check file permissions
ls -la /var/www/html/wiki/images/

# Test database connection
psql -h /cloudsql/PROJECT:REGION:agapedia-db -U wikiuser -d agapedia_wiki
```

### Common Issues

**Can't access wiki**
- Check: Firewall rules, VM running, Apache running
- Solution: See DEPLOYMENT.md troubleshooting section

**Database connection failed**
- Check: Cloud SQL running, connection name correct, credentials valid
- Solution: Verify connection string in LocalSettings.php

**File uploads failing**
- Check: Directory permissions, PHP limits, Apache config
- Solution: See DEPLOYMENT.md file upload section

**VisualEditor not loading**
- Check: Browser console, Parsoid enabled, LocalSettings.php
- Solution: Clear cache, verify configuration

## Resources

- 📖 Full Guide: [DEPLOYMENT.md](../DEPLOYMENT.md)
- 🚀 Quick Start: [QUICKSTART.md](../QUICKSTART.md)
- 📋 Summary: [DEPLOYMENT_SUMMARY.md](../DEPLOYMENT_SUMMARY.md)
- 🛠️ Deployment Files: [deployment/README.md](README.md)

## Support

- MediaWiki: https://www.mediawiki.org/wiki/Manual:FAQ
- GCP: https://cloud.google.com/support
- PostgreSQL: https://www.postgresql.org/docs/

---

**Last Updated:** December 6, 2024  
**MediaWiki Version:** 1.44.2  
**Deployment Target:** Google Cloud Platform


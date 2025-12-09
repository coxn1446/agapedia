# AgaPedia - MediaWiki Installation

AgaPedia is a MediaWiki-based knowledge base for camp information and documentation.

## What's Included

- **MediaWiki 1.44.2** - Latest stable version
- **Custom Branding** - AgaPedia logo and styling
- **VisualEditor** - WYSIWYG editor for easy content creation
- **File Upload Support** - Upload images and documents (up to 100MB)
- **PostgreSQL Database** - Production-ready database configuration

## Deployment Options

### Option 1: Quick Deploy to Google Cloud (Recommended)

The fastest way to get AgaPedia online with automated setup.

**Read:** [QUICKSTART.md](QUICKSTART.md)

**Steps:**
1. Install Google Cloud SDK
2. Run `./deployment/deploy.sh`
3. Complete the web-based installation wizard
4. Your wiki is live!

**Cost:** ~$10-20/month

### Option 2: Manual GCP Deployment

For more control over the deployment process.

**Read:** [DEPLOYMENT.md](DEPLOYMENT.md)

Includes detailed step-by-step instructions for:
- Setting up Cloud SQL
- Configuring Compute Engine
- Installing LAMP stack
- Configuring HTTPS
- Security hardening

### Option 3: Local Development

For testing and development on your local machine.

**Requirements:**
- PHP 8.1+
- PostgreSQL 12+ or MySQL/MariaDB
- Apache or Nginx

**Steps:**
1. Set up local LAMP/LEMP stack
2. Navigate to `http://localhost:8080/mediawiki-1.44.2/mw-config/`
3. Complete the installation wizard
4. Start editing!

## Project Structure

```
agapedia/
├── mediawiki-1.44.2/              # MediaWiki core files
│   ├── .gcloudignore              # GCP deployment exclusions
│   ├── resources/assets/          # Custom logo and images
│   │   ├── camp-logo.png          # AgaPedia logo
│   │   └── camp-background.jpg    # Background image
│   ├── extensions/                # MediaWiki extensions
│   ├── images/                    # Uploaded files directory
│   └── ...
├── deployment/                    # GCP deployment files
│   ├── deploy.sh                  # Automated deployment script
│   ├── startup-script.sh          # VM initialization script
│   ├── apache-wiki.conf           # Apache configuration
│   ├── LocalSettings.template.php # Configuration template
│   └── README.md                  # Deployment documentation
├── DEPLOYMENT.md                  # Detailed deployment guide
├── QUICKSTART.md                  # Quick start guide
└── README.md                      # This file
```

## Features

### Pre-configured Extensions
- **VisualEditor** - Visual editing interface
- **Cite** - Citation support
- **ParserFunctions** - Advanced template functions
- **ImageMap** - Clickable image maps
- **And many more...**

### Custom Configuration
- Custom AgaPedia logo
- 100MB file upload limit
- PostgreSQL database support
- Security hardening
- Performance optimizations

### Production-Ready
- Automated backups (Cloud SQL)
- HTTPS support (Let's Encrypt)
- Scalable infrastructure
- Monitoring and logging

## Getting Started

### For Production Deployment

1. **Choose your deployment method**
   - Quick deploy: [QUICKSTART.md](QUICKSTART.md)
   - Manual deploy: [DEPLOYMENT.md](DEPLOYMENT.md)

2. **Prepare your environment**
   - Create GCP project
   - Enable billing
   - Install gcloud CLI

3. **Deploy**
   ```bash
   cd /Users/williamnash/Desktop/Coding/repos/agapedia
   ./deployment/deploy.sh
   ```

4. **Configure**
   - Complete installation wizard
   - Add custom configurations
   - Set up HTTPS

5. **Go live!**
   - Point your domain to the server
   - Start creating content

### For Local Development

1. **Set up local server**
   - Install MAMP, XAMPP, or equivalent
   - Start Apache and PostgreSQL/MySQL

2. **Access installation**
   - Navigate to `http://localhost:8080/mediawiki-1.44.2/mw-config/`

3. **Complete wizard**
   - Configure database connection
   - Set admin credentials
   - Download LocalSettings.php

4. **Start developing**
   - Test features locally
   - Develop custom extensions
   - Create content

## Post-Installation

After deploying AgaPedia:

### Essential Tasks
- [ ] Create main page content
- [ ] Set up user accounts
- [ ] Configure user permissions
- [ ] Upload initial content
- [ ] Test file uploads
- [ ] Test VisualEditor

### Recommended Tasks
- [ ] Set up automated backups
- [ ] Configure HTTPS with domain
- [ ] Install additional extensions as needed
- [ ] Set up monitoring and alerts
- [ ] Create style guide and documentation
- [ ] Train content editors

### Security Checklist
- [ ] Use strong passwords
- [ ] Enable HTTPS
- [ ] Configure fail2ban
- [ ] Set up automated updates
- [ ] Review user permissions
- [ ] Enable email notifications
- [ ] Configure database SSL

## Customization

### Changing the Logo

1. Replace files in `mediawiki-1.44.2/resources/assets/`:
   - `camp-logo.png` - Main logo
   - `camp-background.jpg` - Background image

2. Update `LocalSettings.php`:
   ```php
   $wgLogos = [
       '1x' => "$wgResourceBasePath/resources/assets/your-logo.png",
       'icon' => "$wgResourceBasePath/resources/assets/your-icon.png",
   ];
   ```

### Adding Extensions

1. Download extension from [MediaWiki.org](https://www.mediawiki.org/wiki/Special:ExtensionDistributor)
2. Extract to `mediawiki-1.44.2/extensions/`
3. Add to `LocalSettings.php`:
   ```php
   wfLoadExtension( 'ExtensionName' );
   ```

### Modifying Appearance

Edit `LocalSettings.php` to change:
- Default skin
- Custom CSS
- Site name and description
- Copyright information

## Troubleshooting

### Common Issues

**Database connection failed**
- Verify database credentials in LocalSettings.php
- Check database server is running
- Ensure database user has proper permissions

**File uploads not working**
- Check `images/` directory permissions
- Verify PHP upload limits
- Check Apache configuration

**VisualEditor not loading**
- Verify Parsoid is enabled
- Check JavaScript console for errors
- Clear browser cache

**Wiki not accessible**
- Verify Apache is running
- Check firewall rules
- Verify domain DNS settings

### Getting Help

- Check error logs: `/var/log/apache2/wiki_error.log`
- MediaWiki documentation: https://www.mediawiki.org/wiki/Documentation
- GCP support: https://cloud.google.com/support
- Review deployment guides in this repository

## Maintenance

### Regular Tasks

**Weekly:**
- Review error logs
- Check disk space
- Monitor traffic and performance

**Monthly:**
- Update MediaWiki core
- Update extensions
- Review backups
- Check security updates

**Quarterly:**
- Audit user accounts
- Review permissions
- Test restore from backup
- Update documentation

### Backup and Restore

**Backup:**
```bash
# Database (automated with Cloud SQL)
gcloud sql backups create --instance=agapedia-db

# Files
gcloud compute disks snapshot agapedia-vm --zone=us-central1-a
```

**Restore:**
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed restore procedures.

## Contributing

To contribute to AgaPedia:

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MediaWiki is free software licensed under GPL-2.0-or-later.
See the MediaWiki documentation for license details.

## Support

For questions or issues:
- Review documentation in this repository
- Check MediaWiki.org for general MediaWiki questions
- Consult GCP documentation for infrastructure questions

---

**Version:** 1.0.0  
**MediaWiki Version:** 1.44.2  
**Last Updated:** December 2024


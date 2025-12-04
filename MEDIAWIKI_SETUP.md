# MediaWiki Local Setup Guide

## Prerequisites
- ✅ PHP 8.5.0 installed (with pgsql extension)
- ✅ PostgreSQL running (database `agapedia_wiki` created)

## Step 1: Start MediaWiki Server

Run the MediaWiki PHP server:

```bash
./start-mediawiki.sh
```

This will start MediaWiki on `http://localhost:8080`

## Step 2: Access MediaWiki Installer

Open your browser and go to:
```
http://localhost:8080/mw-config/
```

## Step 3: Complete MediaWiki Installation Wizard

### Database Configuration
1. **Database type**: Select `PostgreSQL`
2. **Database host**: `localhost`
3. **Database port**: `5432`
4. **Database name**: `agapedia_wiki`
5. **Database username**: `williamnash` (or your PostgreSQL username)
6. **Database password**: (leave blank if no password, or enter your PostgreSQL password)

### Site Configuration
1. **Name of wiki**: `Agapedia`
2. **Contact e-mail**: (your email)
3. **Language**: English
4. **Copyright/license**: Choose appropriate license
5. **Admin username**: Create your admin account
6. **Admin password**: Set a secure password
7. **Admin email**: Your email

### Complete Installation
- Click "Install MediaWiki"
- Wait for installation to complete
- **IMPORTANT**: Copy the `LocalSettings.php` file content shown at the end
- Save it to: `mediawiki-1.44.2/LocalSettings.php`

## Step 4: Configure MediaWiki for API Access

After installation, edit `mediawiki-1.44.2/LocalSettings.php` and add these configurations:

```php
// Enable API
$wgEnableAPI = true;
$wgEnableWriteAPI = true;

// Configure CORS for Express app (adjust origin as needed)
$wgCrossSiteAJAXdomains = ['http://localhost:3000'];

// Allow API access from Express app
$wgAPIFormatModules['json'] = 'ApiFormatJson';

// Site configuration
$wgSitename = "Agapedia";
$wgMetaNamespace = "Agapedia";

// User rights configuration
// Admins (sysop group) can block users and delete pages
$wgGroupPermissions['sysop']['block'] = true;
$wgGroupPermissions['sysop']['delete'] = true;
$wgGroupPermissions['sysop']['userrights'] = true;

// Regular users can create and edit pages (default)
$wgGroupPermissions['user']['edit'] = true;
$wgGroupPermissions['user']['createpage'] = true;
```

## Step 5: Set Environment Variable for Express App

Add to your `.env` file (or set environment variable):

```bash
MEDIAWIKI_BASE_URL=http://localhost:8080
```

## Step 6: Test the Setup

1. **Test MediaWiki**: Visit `http://localhost:8080` - you should see the MediaWiki homepage
2. **Test API**: Visit `http://localhost:8080/api.php?action=query&meta=siteinfo&format=json` - should return JSON
3. **Test Express Connection**: Start your Express server and try logging in

## Troubleshooting

### MediaWiki won't start
- Check PHP version: `php -v` (should be 8.1+)
- Check PostgreSQL extension: `php -m | grep pgsql`
- Check PostgreSQL is running: `lsof -i :5432`

### Database connection errors
- Verify database exists: `/opt/homebrew/Cellar/libpq/18.1/bin/psql -U williamnash -d agapedia_wiki -c "SELECT 1;"`
- Check PostgreSQL is running on port 5432
- Verify username and password in LocalSettings.php

### API not working
- Check `$wgEnableAPI = true;` in LocalSettings.php
- Check CORS settings if getting CORS errors
- Verify MediaWiki is accessible at the base URL

## Next Steps

Once MediaWiki is running:
1. Start your Express server: `npm run server:dev`
2. Start your React app: `npm run start:dev`
3. Test login through your Express app
4. Create your first article!


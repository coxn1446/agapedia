#!/bin/bash
#
# GCP VM Startup Script for MediaWiki
# This script runs when the VM first boots and installs all required software
#

set -e

echo "Starting MediaWiki server setup..."

# Update system packages
apt-get update
apt-get upgrade -y

# Install Apache web server
echo "Installing Apache..."
apt-get install -y apache2

# Install PHP 8.1 and required extensions
echo "Installing PHP and extensions..."
apt-get install -y \
  php8.1 \
  php8.1-cli \
  php8.1-fpm \
  php8.1-json \
  php8.1-common \
  php8.1-mysql \
  php8.1-zip \
  php8.1-gd \
  php8.1-mbstring \
  php8.1-curl \
  php8.1-xml \
  php8.1-pear \
  php8.1-bcmath \
  php8.1-intl \
  php8.1-pgsql \
  php8.1-apcu \
  php8.1-imagick

# Install PostgreSQL client for Cloud SQL
echo "Installing PostgreSQL client..."
apt-get install -y postgresql-client

# Install Cloud SQL Proxy
echo "Installing Cloud SQL Proxy..."
wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O /usr/local/bin/cloud_sql_proxy
chmod +x /usr/local/bin/cloud_sql_proxy

# Enable required Apache modules
echo "Enabling Apache modules..."
a2enmod rewrite
a2enmod ssl
a2enmod headers

# Configure PHP settings for MediaWiki
echo "Configuring PHP..."
sed -i 's/upload_max_filesize = .*/upload_max_filesize = 100M/' /etc/php/8.1/apache2/php.ini
sed -i 's/post_max_size = .*/post_max_size = 100M/' /etc/php/8.1/apache2/php.ini
sed -i 's/memory_limit = .*/memory_limit = 256M/' /etc/php/8.1/apache2/php.ini
sed -i 's/max_execution_time = .*/max_execution_time = 300/' /etc/php/8.1/apache2/php.ini

# Create web directory
mkdir -p /var/www/html/wiki

# Set proper permissions
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html

# Restart Apache to apply changes
systemctl restart apache2
systemctl enable apache2

# Install unzip and other useful tools
apt-get install -y unzip wget curl vim

# Install Composer (for managing PHP dependencies if needed)
echo "Installing Composer..."
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# Setup log rotation for Apache
cat > /etc/logrotate.d/apache2-wiki << 'EOF'
/var/log/apache2/wiki_*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root adm
    sharedscripts
    postrotate
        if /etc/init.d/apache2 status > /dev/null ; then \
            /etc/init.d/apache2 reload > /dev/null; \
        fi;
    endscript
}
EOF

echo "Server setup complete!"
echo "Next steps:"
echo "1. Upload MediaWiki files to /var/www/html/wiki"
echo "2. Configure Apache with wiki.conf"
echo "3. Run MediaWiki installation wizard"


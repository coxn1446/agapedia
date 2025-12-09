#!/bin/bash
#
# Install Apache and PHP on the VM
# Run this script ON THE VM (after SSH'ing in)
#

set -e

echo "=========================================="
echo "Installing Apache, PHP, and dependencies"
echo "=========================================="
echo ""

# Update system
echo "[1/7] Updating system packages..."
sudo apt update -qq

# Install Apache
echo "[2/7] Installing Apache web server..."
sudo apt install -y apache2

# Install PHP and extensions
echo "[3/7] Installing PHP and extensions (this may take a few minutes)..."
sudo apt install -y php php-cli php-json php-common php-mysql \
  php-zip php-gd php-mbstring php-curl php-xml php-bcmath \
  php-intl php-pgsql php-apcu php-imagick

# Install PostgreSQL client
echo "[4/7] Installing PostgreSQL client..."
sudo apt install -y postgresql-client

# Enable Apache modules
echo "[5/7] Enabling Apache modules..."
sudo a2enmod rewrite
sudo a2enmod ssl
sudo a2enmod headers

# Configure PHP
echo "[6/7] Configuring PHP settings..."
sudo sed -i 's/upload_max_filesize = .*/upload_max_filesize = 100M/' /etc/php/*/apache2/php.ini
sudo sed -i 's/post_max_size = .*/post_max_size = 100M/' /etc/php/*/apache2/php.ini
sudo sed -i 's/memory_limit = .*/memory_limit = 256M/' /etc/php/*/apache2/php.ini
sudo sed -i 's/max_execution_time = .*/max_execution_time = 300/' /etc/php/*/apache2/php.ini

# Start Apache
echo "[7/7] Starting Apache..."
sudo systemctl restart apache2
sudo systemctl enable apache2

echo ""
echo "=========================================="
echo "Installation Complete!"
echo "=========================================="
echo ""
echo "Apache version:"
apache2 -v
echo ""
echo "PHP version:"
php -v
echo ""
echo "Apache status:"
sudo systemctl status apache2 --no-pager | head -10
echo ""
echo "You can now exit and run the deployment script:"
echo "  exit"
echo "  cd /Users/williamnash/Desktop/Coding/repos/agapedia"
echo "  ./deployment/complete-deployment.sh"
echo ""


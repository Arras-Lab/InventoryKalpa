#!/bin/bash

# Wood Processing Inventory System - Production Deployment Script
# Usage: ./deploy-production.sh

set -e  # Exit on any error

echo "🚀 Starting Wood Processing Inventory System Deployment..."

# Configuration
PROJECT_DIR="/var/www/wood-inventory"
BACKUP_DIR="/var/backups/wood-inventory"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking system requirements..."
    
    # Check PHP version
    if ! command -v php &> /dev/null; then
        log_error "PHP is not installed"
        exit 1
    fi
    
    PHP_VERSION=$(php -r "echo PHP_VERSION;")
    if [[ $(echo "$PHP_VERSION 8.2" | awk '{print ($1 >= $2)}') == 0 ]]; then
        log_error "PHP 8.2 or higher is required. Current version: $PHP_VERSION"
        exit 1
    fi
    
    # Check Composer
    if ! command -v composer &> /dev/null; then
        log_error "Composer is not installed"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    # Check MySQL
    if ! command -v mysql &> /dev/null; then
        log_error "MySQL client is not installed"
        exit 1
    fi
    
    log_info "✅ All requirements met"
}

backup_current() {
    if [ -d "$PROJECT_DIR" ]; then
        log_info "Creating backup of current deployment..."
        mkdir -p "$BACKUP_DIR"
        tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "$PROJECT_DIR" .
        log_info "✅ Backup created: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
    fi
}

setup_environment() {
    log_info "Setting up environment..."
    
    # Create project directory
    mkdir -p "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    
    # Copy environment file if it doesn't exist
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            log_warn "Please configure .env file with your settings"
        else
            log_error ".env.example not found"
            exit 1
        fi
    fi
}

install_dependencies() {
    log_info "Installing PHP dependencies..."
    composer install --optimize-autoloader --no-dev --no-interaction
    
    log_info "Installing Node.js dependencies..."
    npm ci --only=production
    
    log_info "✅ Dependencies installed"
}

setup_application() {
    log_info "Setting up Laravel application..."
    
    # Generate application key if not set
    if grep -q "APP_KEY=$" .env; then
        php artisan key:generate --force
    fi
    
    # Create storage symlink
    php artisan storage:link
    
    # Run database migrations
    log_info "Running database migrations..."
    php artisan migrate --force
    
    # Seed database if needed
    read -p "Do you want to seed the database with initial data? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        php artisan db:seed --force
    fi
    
    log_info "✅ Application setup complete"
}

build_frontend() {
    log_info "Building frontend assets..."
    npm run build
    log_info "✅ Frontend build complete"
}

optimize_application() {
    log_info "Optimizing application..."
    
    # Clear all caches
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    php artisan cache:clear
    
    # Cache configurations
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    
    log_info "✅ Application optimized"
}

set_permissions() {
    log_info "Setting file permissions..."
    
    # Set ownership
    chown -R www-data:www-data "$PROJECT_DIR"
    
    # Set file permissions
    find "$PROJECT_DIR" -type f -exec chmod 644 {} \;
    find "$PROJECT_DIR" -type d -exec chmod 755 {} \;
    
    # Set special permissions for storage and cache
    chmod -R 775 "$PROJECT_DIR/storage"
    chmod -R 775 "$PROJECT_DIR/bootstrap/cache"
    
    log_info "✅ Permissions set"
}

setup_services() {
    log_info "Setting up system services..."
    
    # Restart web server
    if systemctl is-active --quiet apache2; then
        systemctl reload apache2
        log_info "✅ Apache reloaded"
    elif systemctl is-active --quiet nginx; then
        systemctl reload nginx
        log_info "✅ Nginx reloaded"
    fi
    
    # Restart PHP-FPM
    if systemctl is-active --quiet php8.2-fpm; then
        systemctl restart php8.2-fpm
        log_info "✅ PHP-FPM restarted"
    fi
    
    # Restart supervisor (for queues)
    if systemctl is-active --quiet supervisor; then
        supervisorctl reread
        supervisorctl update
        supervisorctl restart all
        log_info "✅ Supervisor updated"
    fi
}

setup_cron() {
    log_info "Setting up cron jobs..."
    
    # Add Laravel scheduler to crontab
    CRON_JOB="* * * * * cd $PROJECT_DIR && php artisan schedule:run >> /dev/null 2>&1"
    
    # Check if cron job already exists
    if ! crontab -l 2>/dev/null | grep -q "artisan schedule:run"; then
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        log_info "✅ Cron job added"
    else
        log_info "✅ Cron job already exists"
    fi
}

run_tests() {
    log_info "Running application tests..."
    
    # Basic connectivity test
    if php artisan tinker --execute="echo 'Database connection: ' . (DB::connection()->getPdo() ? 'OK' : 'FAILED');" 2>/dev/null; then
        log_info "✅ Database connection test passed"
    else
        log_error "Database connection test failed"
        exit 1
    fi
    
    # Test web server response
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200\|302"; then
        log_info "✅ Web server response test passed"
    else
        log_warn "Web server response test failed - please check manually"
    fi
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove old backups (keep last 5)
    if [ -d "$BACKUP_DIR" ]; then
        cd "$BACKUP_DIR"
        ls -t backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm --
    fi
    
    log_info "✅ Cleanup complete"
}

# Main deployment process
main() {
    echo "========================================="
    echo "Wood Processing Inventory System"
    echo "Production Deployment Script"
    echo "========================================="
    
    # Confirm deployment
    read -p "Are you sure you want to deploy to production? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled"
        exit 0
    fi
    
    # Run deployment steps
    check_requirements
    backup_current
    setup_environment
    install_dependencies
    build_frontend
    setup_application
    optimize_application
    set_permissions
    setup_services
    setup_cron
    run_tests
    cleanup
    
    echo "========================================="
    log_info "🎉 Deployment completed successfully!"
    echo "========================================="
    
    echo ""
    echo "Next steps:"
    echo "1. Configure your .env file with production settings"
    echo "2. Set up SSL certificates"
    echo "3. Configure monitoring and logging"
    echo "4. Test all functionality"
    echo "5. Set up regular backups"
    echo ""
    echo "Application URL: $(grep APP_URL .env | cut -d '=' -f2)"
    echo "Backup location: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
}

# Run main function
main "$@"

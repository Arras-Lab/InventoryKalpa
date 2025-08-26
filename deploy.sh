#!/bin/bash

# Wood Processing Inventory System Deployment Script
# This script automates the deployment process for both development and production environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="Wood Processing Inventory System"
BACKUP_DIR="storage/app/backups"
LOG_FILE="deployment.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}✓${NC} $1" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}✗${NC} $1" | tee -a $LOG_FILE
    exit 1
}

# Check if running as root (not recommended for production)
check_user() {
    if [[ $EUID -eq 0 ]]; then
        warning "Running as root. This is not recommended for production deployments."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Check system requirements
check_requirements() {
    log "Checking system requirements..."
    
    # Check PHP version
    if ! command -v php &> /dev/null; then
        error "PHP is not installed"
    fi
    
    PHP_VERSION=$(php -r "echo PHP_VERSION;")
    if [[ $(echo "$PHP_VERSION 8.2" | awk '{print ($1 < $2)}') == 1 ]]; then
        error "PHP 8.2 or higher is required. Current version: $PHP_VERSION"
    fi
    success "PHP version check passed ($PHP_VERSION)"
    
    # Check Composer
    if ! command -v composer &> /dev/null; then
        error "Composer is not installed"
    fi
    success "Composer is available"
    
    # Check Node.js and npm
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
    fi
    success "Node.js and npm are available"
    
    # Check MySQL/MariaDB
    if ! command -v mysql &> /dev/null; then
        warning "MySQL client not found. Make sure MySQL/MariaDB server is accessible."
    fi
}

# Install PHP dependencies
install_php_dependencies() {
    log "Installing PHP dependencies..."
    
    if [[ "$1" == "production" ]]; then
        composer install --no-dev --optimize-autoloader --no-interaction
    else
        composer install --optimize-autoloader --no-interaction
    fi
    
    success "PHP dependencies installed"
}

# Install Node.js dependencies and build assets
build_frontend() {
    log "Installing Node.js dependencies and building frontend..."
    
    npm install
    success "Node.js dependencies installed"
    
    if [[ "$1" == "production" ]]; then
        npm run build
        success "Frontend assets built for production"
    else
        npm run dev
        success "Frontend assets built for development"
    fi
}

# Setup Laravel application
setup_laravel() {
    log "Setting up Laravel application..."
    
    # Copy environment file if it doesn't exist
    if [[ ! -f .env ]]; then
        if [[ -f .env.example ]]; then
            cp .env.example .env
            success "Environment file created from example"
        else
            error ".env.example file not found"
        fi
    fi
    
    # Generate application key
    php artisan key:generate --force
    success "Application key generated"
    
    # Create storage directories
    mkdir -p storage/logs
    mkdir -p storage/framework/cache
    mkdir -p storage/framework/sessions
    mkdir -p storage/framework/views
    mkdir -p storage/app/backups
    mkdir -p bootstrap/cache
    
    # Set permissions
    chmod -R 775 storage
    chmod -R 775 bootstrap/cache
    success "Storage directories and permissions set"
}

# Database operations
setup_database() {
    log "Setting up database..."
    
    # Create backup before migration (if database exists)
    if php artisan migrate:status &> /dev/null; then
        log "Creating database backup before migration..."
        php artisan db:backup --compress || warning "Backup failed, continuing with migration"
    fi
    
    # Run migrations
    if [[ "$1" == "production" ]]; then
        php artisan migrate --force
    else
        php artisan migrate
    fi
    success "Database migrations completed"
    
    # Seed database (only in development or if explicitly requested)
    if [[ "$1" != "production" ]] || [[ "$2" == "--seed" ]]; then
        php artisan db:seed
        success "Database seeded with sample data"
    fi
}

# Clear and cache configuration
optimize_application() {
    log "Optimizing application..."
    
    # Clear all caches
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    php artisan cache:clear
    
    if [[ "$1" == "production" ]]; then
        # Cache configuration for production
        php artisan config:cache
        php artisan route:cache
        php artisan view:cache
        success "Application optimized for production"
    else
        success "Application caches cleared for development"
    fi
}

# Setup cron jobs for production
setup_cron() {
    if [[ "$1" == "production" ]]; then
        log "Setting up cron jobs..."
        
        # Add Laravel scheduler to crontab
        CRON_JOB="* * * * * cd $(pwd) && php artisan schedule:run >> /dev/null 2>&1"
        
        # Check if cron job already exists
        if ! crontab -l 2>/dev/null | grep -q "artisan schedule:run"; then
            (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
            success "Cron job added for Laravel scheduler"
        else
            success "Cron job already exists"
        fi
    fi
}

# Main deployment function
deploy() {
    local environment=${1:-development}
    
    log "Starting deployment of $APP_NAME"
    log "Environment: $environment"
    
    check_user
    check_requirements
    install_php_dependencies $environment
    build_frontend $environment
    setup_laravel
    setup_database $environment $2
    optimize_application $environment
    setup_cron $environment
    
    success "Deployment completed successfully!"
    
    if [[ "$environment" == "development" ]]; then
        echo
        log "Development server can be started with:"
        echo "  Backend:  php artisan serve"
        echo "  Frontend: npm run dev"
        echo
        log "Demo credentials:"
        echo "  Admin:    admin@woodinventory.com / password123"
        echo "  Manager:  manajer@woodinventory.com / password123"
        echo "  Operator: operator@woodinventory.com / password123"
    else
        echo
        log "Production deployment notes:"
        echo "  - Configure your web server (Apache/Nginx) to point to the public directory"
        echo "  - Set up SSL certificate for HTTPS"
        echo "  - Configure proper file permissions for web server user"
        echo "  - Set up monitoring and log rotation"
        echo "  - Regular database backups are scheduled via cron"
    fi
}

# Help function
show_help() {
    echo "Usage: $0 [ENVIRONMENT] [OPTIONS]"
    echo
    echo "ENVIRONMENT:"
    echo "  development  Deploy for development (default)"
    echo "  production   Deploy for production"
    echo
    echo "OPTIONS:"
    echo "  --seed       Seed database with sample data (development default, production optional)"
    echo "  --help       Show this help message"
    echo
    echo "Examples:"
    echo "  $0                          # Development deployment"
    echo "  $0 development              # Development deployment"
    echo "  $0 production               # Production deployment"
    echo "  $0 production --seed        # Production deployment with sample data"
}

# Parse command line arguments
case "${1:-}" in
    "help"|"--help"|"-h")
        show_help
        exit 0
        ;;
    "production")
        deploy production $2
        ;;
    "development"|"dev"|"")
        deploy development $2
        ;;
    *)
        error "Invalid environment: $1. Use 'development' or 'production'"
        ;;
esac

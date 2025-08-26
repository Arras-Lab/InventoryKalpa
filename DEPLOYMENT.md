# Wood Processing Inventory System - Deployment Guide

## System Requirements

### Server Requirements
- **PHP**: 8.2 or higher
- **Node.js**: 18.x or higher
- **MySQL**: 8.0 or higher
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 10GB free space

### PHP Extensions
- BCMath
- Ctype
- cURL
- DOM
- Fileinfo
- JSON
- Mbstring
- OpenSSL
- PDO
- PDO_MySQL
- Tokenizer
- XML
- GD or Imagick (for image processing)

## Installation Steps

### 1. Clone Repository
```bash
git clone <repository-url> wood-inventory
cd wood-inventory
```

### 2. Backend Setup (Laravel)

#### Install PHP Dependencies
```bash
composer install --optimize-autoloader --no-dev
```

#### Environment Configuration
```bash
cp .env.example .env
php artisan key:generate
```

#### Configure Environment Variables
Edit `.env` file with your settings:

```env
# Application
APP_NAME="Wood Processing Inventory System"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=wood_inventory
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password

# Mail Configuration (for notifications)
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email@domain.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com

# Sanctum (API Authentication)
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,www.yourdomain.com

# Backup Configuration
BACKUP_SCHEDULE=daily
BACKUP_RETENTION_DAYS=30
```

#### Database Setup
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE wood_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Run migrations
php artisan migrate

# Seed initial data
php artisan db:seed
```

#### Storage and Cache Setup
```bash
# Create storage symlink
php artisan storage:link

# Clear and cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create backup directory
mkdir -p storage/app/backups
chmod 755 storage/app/backups
```

### 3. Frontend Setup (React)

#### Install Node Dependencies
```bash
npm install
```

#### Build for Production
```bash
npm run build
```

### 4. Web Server Configuration

#### Apache Configuration
Create virtual host file `/etc/apache2/sites-available/wood-inventory.conf`:

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/wood-inventory/public

    <Directory /var/www/wood-inventory/public>
        AllowOverride All
        Require all granted
    </Directory>

    # Redirect to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    DocumentRoot /var/www/wood-inventory/public

    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key

    <Directory /var/www/wood-inventory/public>
        AllowOverride All
        Require all granted
    </Directory>

    # Security headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>
```

#### Nginx Configuration
Create `/etc/nginx/sites-available/wood-inventory`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/wood-inventory/public;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 5. File Permissions
```bash
# Set proper ownership
chown -R www-data:www-data /var/www/wood-inventory

# Set proper permissions
find /var/www/wood-inventory -type f -exec chmod 644 {} \;
find /var/www/wood-inventory -type d -exec chmod 755 {} \;

# Storage and cache directories need write permissions
chmod -R 775 /var/www/wood-inventory/storage
chmod -R 775 /var/www/wood-inventory/bootstrap/cache
```

### 6. Process Manager (Supervisor)
Create `/etc/supervisor/conf.d/wood-inventory-worker.conf`:

```ini
[program:wood-inventory-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/wood-inventory/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/wood-inventory/storage/logs/worker.log
stopwaitsecs=3600
```

### 7. Cron Jobs
Add to crontab (`crontab -e`):

```cron
# Laravel Scheduler
* * * * * cd /var/www/wood-inventory && php artisan schedule:run >> /dev/null 2>&1

# Daily backup (optional - scheduler handles this)
0 2 * * * cd /var/www/wood-inventory && php artisan db:backup --compress >> /var/log/backup.log 2>&1
```

## Security Configuration

### 1. Environment Security
- Set `APP_DEBUG=false` in production
- Use strong, unique `APP_KEY`
- Use secure database passwords
- Configure proper CORS settings
- Enable HTTPS only

### 2. Database Security
- Create dedicated database user with minimal privileges
- Use strong passwords
- Enable SSL connections if possible
- Regular security updates

### 3. File Security
- Proper file permissions (644 for files, 755 for directories)
- Secure storage directory outside web root
- Regular security patches

## Monitoring and Maintenance

### 1. Log Monitoring
Monitor these log files:
- `/var/www/wood-inventory/storage/logs/laravel.log`
- Web server error logs
- Database logs

### 2. Performance Monitoring
- Database query performance
- Server resource usage
- Application response times
- Storage space usage

### 3. Backup Strategy
- Automated daily database backups
- File system backups
- Test restore procedures regularly
- Off-site backup storage

### 4. Updates
- Regular security updates for OS and packages
- Laravel framework updates
- Dependency updates
- Database maintenance

## Troubleshooting

### Common Issues

#### 1. Permission Errors
```bash
# Fix storage permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

#### 2. Database Connection Issues
- Verify database credentials in `.env`
- Check database server status
- Verify network connectivity
- Check firewall settings

#### 3. 500 Internal Server Error
- Check Laravel logs in `storage/logs/`
- Verify web server configuration
- Check PHP error logs
- Ensure all dependencies are installed

#### 4. Frontend Build Issues
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Performance Optimization

### 1. PHP Optimization
- Enable OPcache
- Tune PHP-FPM settings
- Use appropriate memory limits

### 2. Database Optimization
- Regular ANALYZE TABLE
- Proper indexing
- Query optimization
- Connection pooling

### 3. Caching
- Redis for session and cache storage
- Database query caching
- HTTP caching headers

### 4. CDN and Assets
- Use CDN for static assets
- Enable gzip compression
- Optimize images

## Support and Maintenance

### Regular Tasks
- [ ] Monitor system resources
- [ ] Check application logs
- [ ] Verify backup integrity
- [ ] Update dependencies
- [ ] Security patches
- [ ] Performance monitoring
- [ ] Database maintenance

### Emergency Contacts
- System Administrator: [contact-info]
- Database Administrator: [contact-info]
- Development Team: [contact-info]

---

For additional support or questions, please refer to the project documentation or contact the development team.

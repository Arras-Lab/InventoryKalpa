# Wood Processing Inventory Management System

A comprehensive web-based inventory management system specifically designed for wood processing businesses. Built with modern technologies including Laravel 11, ReactJS, TailwindCSS, and MySQL 8.

## 🌟 Features

### Core Functionality
- **Comprehensive Inventory Management**: Track 26+ data fields including measurements, quality, status, and financial information
- **Anti-Duplication System**: Composite primary key prevents duplicate entries (NO KONTRAK + NO KAPLING + SKSHH + URUTAN PENGIRIMAN)
- **Process Tracking**: Monitor wood processing stages from raw material to finished product
- **Multi-Location Management**: Track wood inventory across different storage locations
- **Status Management**: Ready, In-Process, Rusak (Damaged), Reject statuses

### Advanced Features
- **Multi-User Access Control**: Admin, Manager, and Operator roles with granular permissions
- **Comprehensive Reporting**: Export data to PDF and Excel formats
- **Advanced Search & Filtering**: Multi-criteria search across all data fields
- **Activity Logging**: Track all data changes with detailed audit trails
- **Automated Backups**: Scheduled database backups with retention management
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Security & Performance
- **JWT Authentication**: Secure API authentication with Laravel Sanctum
- **Input Validation**: Client-side and server-side validation
- **SQL Injection Protection**: Parameterized queries and ORM protection
- **Performance Optimization**: Database indexing and query optimization
- **CORS Configuration**: Secure cross-origin resource sharing

## 🛠️ Technology Stack

### Backend
- **Framework**: Laravel 11 (PHP 8.2+)
- **Database**: MySQL 8.0+
- **Authentication**: Laravel Sanctum (JWT)
- **File Processing**: Maatwebsite Excel, DomPDF
- **Activity Logging**: Spatie Activity Log

### Frontend
- **Framework**: ReactJS 18
- **Styling**: TailwindCSS 3
- **State Management**: React Query
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Build Tool**: Vite

### Development Tools
- **Package Manager**: Composer (PHP), NPM (Node.js)
- **Code Quality**: Laravel Pint, ESLint
- **Version Control**: Git

## 📋 System Requirements

### Minimum Requirements
- **PHP**: 8.2 or higher
- **Node.js**: 18.0 or higher
- **MySQL**: 8.0 or higher (or MariaDB 10.4+)
- **Composer**: 2.0 or higher
- **Web Server**: Apache 2.4+ or Nginx 1.18+

### Recommended Requirements
- **RAM**: 4GB or higher
- **Storage**: 10GB available space
- **CPU**: 2 cores or higher

### PHP Extensions Required
```
- BCMath
- Ctype
- Fileinfo
- JSON
- Mbstring
- OpenSSL
- PDO
- PDO_MySQL
- Tokenizer
- XML
- GD or Imagick (for PDF generation)
```

## 🚀 Quick Installation

### Automated Installation (Recommended)

1. **Clone the repository**
```bash
git clone <repository-url> wood-inventory
cd wood-inventory
```

2. **Make deployment script executable**
```bash
chmod +x deploy.sh
```

3. **Run automated deployment**
```bash
# For development
./deploy.sh development

# For production
./deploy.sh production
```

The script will automatically:
- Check system requirements
- Install dependencies
- Configure environment
- Set up database
- Build frontend assets
- Optimize application

### Manual Installation

If you prefer manual installation or need custom configuration:

#### 1. Backend Setup

```bash
# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=wood_inventory
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Run migrations and seed database
php artisan migrate
php artisan db:seed

# Set up storage permissions
chmod -R 775 storage bootstrap/cache
```

#### 2. Frontend Setup

```bash
# Install Node.js dependencies
npm install

# Build for development
npm run dev

# Or build for production
npm run build
```

#### 3. Web Server Configuration

**Apache Configuration** (public/.htaccess included)
```apache
<VirtualHost *:80>
    DocumentRoot /path/to/wood-inventory/public
    ServerName your-domain.com
    
    <Directory /path/to/wood-inventory/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

**Nginx Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/wood-inventory/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## 🗄️ Database Schema

### Primary Table: wood_inventories

The system uses a composite primary key consisting of:
- `no_kontrak` (Contract Number)
- `no_kapling` (Plot Number)  
- `skshh` (Forest Product Transport Document)
- `urutan_pengiriman` (Delivery Order)

### Complete Field List

| Field | Type | Description |
|-------|------|-------------|
| no_kontrak | VARCHAR(50) | Contract number |
| kontrak | VARCHAR(200) | Contract description |
| no_kapling | VARCHAR(50) | Plot number |
| jenis_kayu | VARCHAR(100) | Wood type |
| sort | VARCHAR(50) | Wood sort/grade |
| panjang | DECIMAL(10,2) | Length in meters |
| diameter | DECIMAL(10,2) | Diameter in centimeters |
| qty | INTEGER | Quantity |
| volume | DECIMAL(12,4) | Volume in cubic meters |
| mutu | VARCHAR(50) | Quality grade |
| status | ENUM | ready, in-process, rusak, reject |
| trs | VARCHAR(100) | Unique transaction code |
| tgl_pembelian | DATE | Purchase date |
| harga | DECIMAL(15,2) | Price in Rupiah |
| asal_tpk | VARCHAR(200) | Source TPK |
| skshh | VARCHAR(100) | SKSHH document number |
| delivery_dari_perhutani | BOOLEAN | Delivered from Perhutani |
| tanggal_sampai_bali | DATE | Arrival date in Bali |
| urutan_pengiriman | INTEGER | Delivery order |
| lokasi_saat_ini | VARCHAR(200) | Current location |
| proses | VARCHAR(100) | Current process |
| tgl_dibelah | DATE | Split date |
| tgl_diambil_dari_tempat_belah | DATE | Pickup date from split location |
| rencana_alokasi | VARCHAR(200) | Allocation plan |
| kubik_price | DECIMAL(15,2) | Price per cubic meter |
| tahun_pembelian | YEAR | Purchase year |

## 👥 User Management

### User Roles

1. **Administrator**
   - Full system access
   - User management
   - System configuration
   - All inventory operations
   - Advanced reporting

2. **Manager**
   - View all inventory data
   - Generate reports
   - Monitor operations
   - Limited user management

3. **Operator**
   - Add/edit inventory data
   - Basic reporting
   - Process tracking

### Default Demo Users

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@woodinventory.com | password123 |
| Manager | manajer@woodinventory.com | password123 |
| Operator | operator@woodinventory.com | password123 |

## 📊 API Documentation

### Authentication Endpoints

```
POST /api/login
POST /api/register
POST /api/logout
GET  /api/me
POST /api/change-password
```

### Inventory Endpoints

```
GET    /api/wood-inventory              # List with filters
POST   /api/wood-inventory              # Create new
GET    /api/wood-inventory/{composite}  # Get specific item
PUT    /api/wood-inventory/{composite}  # Update item
DELETE /api/wood-inventory/{composite}  # Delete item
GET    /api/wood-inventory/dashboard    # Dashboard stats
GET    /api/wood-inventory/export/excel # Export Excel
GET    /api/wood-inventory/export/pdf   # Export PDF
```

### User Management Endpoints (Admin only)

```
GET    /api/users           # List users
POST   /api/users           # Create user
GET    /api/users/{id}      # Get user
PUT    /api/users/{id}      # Update user
DELETE /api/users/{id}      # Delete user
POST   /api/users/{id}/toggle-status  # Toggle user status
```

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```env
# Application
APP_NAME="Wood Processing Inventory System"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=wood_inventory
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Sanctum
SANCTUM_STATEFUL_DOMAINS=your-domain.com

# Backup
BACKUP_SCHEDULE=daily
BACKUP_RETENTION_DAYS=30
```

### Scheduled Tasks

Add to crontab for automated tasks:
```bash
* * * * * cd /path/to/wood-inventory && php artisan schedule:run >> /dev/null 2>&1
```

Scheduled tasks include:
- Daily database backups
- Log cleanup
- Cache optimization

## 🛡️ Security Best Practices

### Production Security Checklist

- [ ] Set `APP_DEBUG=false` in production
- [ ] Use HTTPS with valid SSL certificate
- [ ] Configure proper file permissions (755 for directories, 644 for files)
- [ ] Set up firewall rules
- [ ] Regular security updates
- [ ] Database user with minimal required privileges
- [ ] Enable Laravel's built-in CSRF protection
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerting

### File Permissions

```bash
# Set correct ownership (replace www-data with your web server user)
sudo chown -R www-data:www-data /path/to/wood-inventory

# Set directory permissions
find /path/to/wood-inventory -type d -exec chmod 755 {} \;

# Set file permissions
find /path/to/wood-inventory -type f -exec chmod 644 {} \;

# Set executable permissions for specific files
chmod +x deploy.sh
chmod +x artisan

# Ensure storage and cache directories are writable
chmod -R 775 storage bootstrap/cache
```

## 📈 Performance Optimization

### Database Optimization

1. **Indexing**: Key fields are automatically indexed
2. **Query Optimization**: Use Laravel's query builder efficiently
3. **Connection Pooling**: Configure MySQL connection pooling
4. **Regular Maintenance**: Run `OPTIMIZE TABLE` periodically

### Application Optimization

```bash
# Production optimization
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# Clear caches when needed
php artisan optimize:clear
```

### Frontend Optimization

```bash
# Production build with optimization
npm run build

# Analyze bundle size
npm run build -- --analyze
```

## 🔄 Backup & Recovery

### Automated Backups

The system includes automated backup functionality:

```bash
# Manual backup
php artisan db:backup

# Compressed backup
php artisan db:backup --compress

# Custom path backup
php artisan db:backup --path=/custom/backup/path
```

### Backup Schedule

- **Frequency**: Daily (configurable)
- **Retention**: 30 days (configurable)
- **Format**: SQL dump with compression
- **Location**: `storage/app/backups/`

### Recovery Process

1. Stop the application
2. Restore database from backup
3. Clear application caches
4. Restart application

```bash
# Example recovery
mysql -u username -p wood_inventory < backup_file.sql
php artisan optimize:clear
```

## 🚀 Deployment

### Development Deployment

```bash
./deploy.sh development
```

This will:
- Install all dependencies
- Set up development environment
- Seed database with sample data
- Enable debug mode

### Production Deployment

```bash
./deploy.sh production
```

This will:
- Install production dependencies only
- Optimize for performance
- Set up cron jobs
- Configure security settings

### Docker Deployment (Optional)

A Docker configuration can be created for containerized deployment:

```dockerfile
# Example Dockerfile structure
FROM php:8.2-fpm
# Install dependencies and configure application
```

## 🐛 Troubleshooting

### Common Issues

**1. Permission Denied Errors**
```bash
sudo chmod -R 775 storage bootstrap/cache
sudo chown -R www-data:www-data storage bootstrap/cache
```

**2. Database Connection Issues**
- Verify database credentials in `.env`
- Check MySQL service status
- Ensure database exists

**3. Frontend Build Issues**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**4. 500 Internal Server Error**
- Check Laravel logs: `storage/logs/laravel.log`
- Verify file permissions
- Check web server error logs

### Log Files

- **Laravel Logs**: `storage/logs/laravel.log`
- **Web Server Logs**: `/var/log/apache2/` or `/var/log/nginx/`
- **MySQL Logs**: `/var/log/mysql/`

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

### Code Standards

- Follow PSR-12 for PHP code
- Use ESLint configuration for JavaScript
- Write meaningful commit messages
- Add tests for new features

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🆘 Support

### Documentation
- API documentation available at `/api/documentation`
- User manual included in `docs/` directory

### Getting Help
- Check troubleshooting section
- Review log files
- Create an issue on the repository

### Professional Support
For professional support, customization, or enterprise features, please contact the development team.

---

**Wood Processing Inventory Management System** - Built with ❤️ for the wood processing industry.

# Bare Linux Deployment Spec - Magnetiq v2

## Overview
Native Linux deployment for Magnetiq v2 without containerization, suitable for dedicated servers, VPS instances, or environments where direct system installation is preferred.

## Architecture
- **Frontend**: React build served via Nginx
- **Backend**: FastAPI with Gunicorn/Uvicorn workers
- **Database**: SQLite file with WAL mode
- **Web Server**: Nginx as reverse proxy and static file server
- **Process Management**: systemd for service management

## Requirements

### System Requirements
- **OS**: Ubuntu 20.04+ / RHEL 8+ / CentOS 8+ / Debian 11+
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 20GB minimum, SSD recommended
- **CPU**: 2 cores minimum
- **Network**: Public IP with domain name

### Software Dependencies
- Python 3.11+
- Node.js 18+ (for frontend build)
- Nginx 1.18+
- SQLite 3.35+
- systemd
- UFW or iptables for firewall

## System Preparation

### Ubuntu/Debian Installation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y python3.11 python3.11-venv python3-pip
sudo apt install -y nodejs npm
sudo apt install -y nginx
sudo apt install -y sqlite3
sudo apt install -y git curl wget
sudo apt install -y ufw
sudo apt install -y certbot python3-certbot-nginx

# Create application user
sudo useradd -m -s /bin/bash magnetiq
sudo usermod -aG www-data magnetiq
```

### RHEL/CentOS Installation
```bash
# Enable EPEL repository
sudo dnf install -y epel-release

# Install required packages
sudo dnf install -y python3.11 python3-pip
sudo dnf install -y nodejs npm
sudo dnf install -y nginx
sudo dnf install -y sqlite
sudo dnf install -y git curl wget
sudo dnf install -y firewalld
sudo dnf install -y certbot python3-certbot-nginx

# Create application user
sudo useradd -m -s /bin/bash magnetiq
sudo usermod -aG nginx magnetiq
```

## Application Setup

### Directory Structure
```bash
# Create application directories
sudo mkdir -p /opt/magnetiq
sudo mkdir -p /opt/magnetiq/backend
sudo mkdir -p /opt/magnetiq/frontend
sudo mkdir -p /opt/magnetiq/data
sudo mkdir -p /opt/magnetiq/media
sudo mkdir -p /opt/magnetiq/logs
sudo mkdir -p /opt/magnetiq/backups

# Set permissions
sudo chown -R magnetiq:www-data /opt/magnetiq
sudo chmod -R 755 /opt/magnetiq
sudo chmod -R 775 /opt/magnetiq/data
sudo chmod -R 775 /opt/magnetiq/media
sudo chmod -R 775 /opt/magnetiq/logs
```

### Backend Installation
```bash
# Clone repository
sudo -u magnetiq git clone <repository-url> /tmp/magnetiq2
sudo cp -r /tmp/magnetiq2/backend/* /opt/magnetiq/backend/

# Create Python virtual environment
sudo -u magnetiq python3.11 -m venv /opt/magnetiq/venv

# Install Python dependencies
sudo -u magnetiq /opt/magnetiq/venv/bin/pip install -r /opt/magnetiq/backend/requirements.txt
sudo -u magnetiq /opt/magnetiq/venv/bin/pip install gunicorn uvicorn

# Create environment file
sudo -u magnetiq tee /opt/magnetiq/.env << 'EOF'
DEBUG=false
DATABASE_URL=sqlite:////opt/magnetiq/data/magnetiq.db
JWT_SECRET=your-secure-jwt-secret-here
CORS_ORIGINS=https://yourdomain.com
SMTP_SERVER=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USERNAME=sysadmin@euroblaze.de
SMTP_PASSWORD=your-smtp-password
FRONTEND_URL=https://yourdomain.com
MEDIA_ROOT=/opt/magnetiq/media
LOG_LEVEL=INFO
EOF

# Set secure permissions on environment file
sudo chmod 600 /opt/magnetiq/.env
```

### Frontend Installation
```bash
# Copy frontend source
sudo cp -r /tmp/magnetiq2/frontend/* /opt/magnetiq/frontend/

# Install Node.js dependencies and build
cd /opt/magnetiq/frontend
sudo -u magnetiq npm install
sudo -u magnetiq npm run build

# Copy build to web directory
sudo mkdir -p /var/www/magnetiq
sudo cp -r /opt/magnetiq/frontend/dist/* /var/www/magnetiq/
sudo chown -R www-data:www-data /var/www/magnetiq
```

## Service Configuration

### Backend Service (systemd)
```ini
# /etc/systemd/system/magnetiq-backend.service
[Unit]
Description=Magnetiq v2 Backend
After=network.target

[Service]
Type=exec
User=magnetiq
Group=www-data
WorkingDirectory=/opt/magnetiq/backend
Environment=PATH=/opt/magnetiq/venv/bin
EnvironmentFile=/opt/magnetiq/.env
ExecStart=/opt/magnetiq/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 127.0.0.1:3036
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/magnetiq
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL Configuration (will be managed by certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Logging
    access_log /opt/magnetiq/logs/nginx-access.log;
    error_log /opt/magnetiq/logs/nginx-error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # API routes
    location /api/ {
        proxy_pass http://127.0.0.1:3036;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # API documentation
    location ~ ^/(docs|redoc) {
        proxy_pass http://127.0.0.1:3036;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Media files
    location /media/ {
        alias /opt/magnetiq/media/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Static files (frontend)
    location /static/ {
        alias /var/www/magnetiq/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Frontend application
    location / {
        root /var/www/magnetiq;
        index index.html;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, must-revalidate, proxy-revalidate";
    }
}
```

## Deployment Process

### Initial Deployment
```bash
# Enable and start services
sudo systemctl daemon-reload
sudo systemctl enable magnetiq-backend
sudo systemctl start magnetiq-backend

# Configure nginx
sudo ln -s /etc/nginx/sites-available/magnetiq /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

# Configure firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com --non-interactive --agree-tos -m admin@yourdomain.com

# Initialize database
cd /opt/magnetiq/backend
sudo -u magnetiq /opt/magnetiq/venv/bin/python -m app.database.init_db

# Create admin user
sudo -u magnetiq /opt/magnetiq/venv/bin/python -m scripts.create_admin
```

### Service Management
```bash
# Check service status
sudo systemctl status magnetiq-backend
sudo systemctl status nginx

# View logs
sudo journalctl -u magnetiq-backend -f
sudo tail -f /opt/magnetiq/logs/nginx-access.log
sudo tail -f /opt/magnetiq/logs/nginx-error.log

# Restart services
sudo systemctl restart magnetiq-backend
sudo systemctl reload nginx
```

## Database Management

### SQLite Configuration
```python
# Optimal SQLite settings in backend configuration
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA foreign_keys = ON;
PRAGMA temp_store = memory;
PRAGMA mmap_size = 134217728;  # 128MB
```

### Backup Scripts
```bash
# /opt/magnetiq/scripts/backup.sh
#!/bin/bash
set -e

BACKUP_DIR="/opt/magnetiq/backups"
DATE=$(date +%Y%m%d-%H%M%S)
DB_FILE="/opt/magnetiq/data/magnetiq.db"
BACKUP_FILE="$BACKUP_DIR/magnetiq-backup-$DATE.db"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# Create backup
sqlite3 "$DB_FILE" ".backup $BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

# Clean old backups (keep 7 days)
find "$BACKUP_DIR" -name "magnetiq-backup-*.db.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_FILE.gz"
```

### Automated Backups (crontab)
```bash
# Setup automated backups
sudo chmod +x /opt/magnetiq/scripts/backup.sh
sudo chown magnetiq:magnetiq /opt/magnetiq/scripts/backup.sh

# Add to crontab for magnetiq user
sudo -u magnetiq crontab -e
# Add this line:
0 2 * * * /opt/magnetiq/scripts/backup.sh >> /opt/magnetiq/logs/backup.log 2>&1
```

## Monitoring & Health Checks

### Health Check Script
```bash
# /opt/magnetiq/scripts/health_check.sh
#!/bin/bash

# Check backend service
if ! systemctl is-active --quiet magnetiq-backend; then
    echo "ERROR: Backend service is not running"
    exit 1
fi

# Check backend health endpoint
if ! curl -f -s http://127.0.0.1:3036/health > /dev/null; then
    echo "ERROR: Backend health check failed"
    exit 1
fi

# Check nginx service
if ! systemctl is-active --quiet nginx; then
    echo "ERROR: Nginx service is not running"
    exit 1
fi

# Check disk space
DISK_USAGE=$(df /opt/magnetiq | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    echo "WARNING: Disk usage is ${DISK_USAGE}%"
fi

# Check database file
if [ ! -f /opt/magnetiq/data/magnetiq.db ]; then
    echo "ERROR: Database file not found"
    exit 1
fi

echo "All health checks passed"
```

### Log Rotation Configuration
```bash
# /etc/logrotate.d/magnetiq
/opt/magnetiq/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    create 0644 magnetiq magnetiq
    postrotate
        systemctl reload magnetiq-backend
        systemctl reload nginx
    endscript
}
```

## Performance Optimization

### System Tuning
```bash
# /etc/sysctl.d/magnetiq.conf
# Network optimizations
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 12582912 16777216
net.ipv4.tcp_wmem = 4096 12582912 16777216

# File descriptor limits
fs.file-max = 65536

# Apply settings
sudo sysctl -p /etc/sysctl.d/magnetiq.conf
```

### Application Performance
```bash
# Update Gunicorn configuration for production
ExecStart=/opt/magnetiq/venv/bin/gunicorn app.main:app \
  -w $(nproc) \
  -k uvicorn.workers.UvicornWorker \
  -b 127.0.0.1:3036 \
  --timeout 60 \
  --keep-alive 5 \
  --max-requests 1000 \
  --max-requests-jitter 100
```

## Security Hardening

### File Permissions
```bash
# Secure configuration files
sudo chmod 600 /opt/magnetiq/.env
sudo chmod 755 /opt/magnetiq/scripts/*
sudo chmod 644 /etc/systemd/system/magnetiq-backend.service

# Secure data directory
sudo find /opt/magnetiq/data -type f -exec chmod 644 {} \;
sudo find /opt/magnetiq/data -type d -exec chmod 755 {} \;
```

### Firewall Configuration (Advanced)
```bash
# More restrictive firewall rules
sudo ufw delete allow 22/tcp
sudo ufw allow from YOUR_IP_ADDRESS to any port 22 proto tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw deny out 25/tcp  # Block outgoing SMTP unless needed
```

### Fail2ban Integration
```bash
# Install fail2ban
sudo apt install fail2ban

# Configure for nginx
sudo tee /etc/fail2ban/jail.d/nginx.conf << 'EOF'
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /opt/magnetiq/logs/nginx-error.log
maxretry = 3
bantime = 3600

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /opt/magnetiq/logs/nginx-error.log
maxretry = 10
bantime = 600
EOF

sudo systemctl restart fail2ban
```

## Maintenance Tasks

### Update Procedures
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Python dependencies
cd /opt/magnetiq/backend
sudo -u magnetiq /opt/magnetiq/venv/bin/pip install --upgrade -r requirements.txt

# Update frontend (when needed)
cd /opt/magnetiq/frontend
sudo -u magnetiq npm update
sudo -u magnetiq npm run build
sudo cp -r /opt/magnetiq/frontend/dist/* /var/www/magnetiq/

# Restart services
sudo systemctl restart magnetiq-backend
sudo systemctl reload nginx
```

### SSL Certificate Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Setup automatic renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Troubleshooting

### Common Issues

1. **Backend service fails to start**
   ```bash
   sudo journalctl -u magnetiq-backend -n 50
   # Check environment file and permissions
   ```

2. **Database connection errors**
   ```bash
   # Check database file permissions and SQLite installation
   ls -la /opt/magnetiq/data/
   sqlite3 /opt/magnetiq/data/magnetiq.db ".schema"
   ```

3. **Nginx configuration errors**
   ```bash
   sudo nginx -t
   sudo journalctl -u nginx -n 50
   ```

4. **SSL certificate issues**
   ```bash
   sudo certbot certificates
   sudo certbot renew --force-renewal
   ```

### Performance Issues
- Monitor with `htop`, `iotop`, and `netstat`
- Check database size and query performance
- Analyze nginx access logs for bottlenecks
- Consider upgrading to PostgreSQL for high load

## Migration Paths

### From Docker
1. Export database from Docker container
2. Set up bare Linux environment following this guide
3. Import database and media files
4. Update DNS to point to new server

### To Kubernetes
1. Create database backup using backup scripts
2. Set up Kubernetes environment using k8s_deployment.md
3. Import data to new environment
4. Update DNS to point to Kubernetes ingress

This specification provides a complete bare Linux deployment for Magnetiq v2 with production-grade configuration, monitoring, and maintenance procedures.
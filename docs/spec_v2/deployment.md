# Magnetiq v2 - Deployment Specification

## Overview

Magnetiq v2 deployment focuses on simplicity and rapid deployment using SQLite database and minimal infrastructure requirements. This specification covers Docker-based deployment for both development and production environments.

## Architecture Overview

### Simple Stack Architecture
- **Frontend**: React SPA served via Nginx (Port 8036)
- **Backend**: FastAPI application (Port 3036)
- **Database**: SQLite file-based database
- **Web Server**: Nginx for static files and reverse proxy
- **No External Dependencies**: No Redis, Celery, or message queuing

## Environment Requirements

### Development Environment
- **Docker & Docker Compose**
- **Node.js 18+** (for frontend development)
- **Python 3.11+** (for backend development)
- **4GB RAM minimum**
- **10GB free disk space**

### Production Environment
- **Linux server** (Ubuntu 20.04+ recommended)
- **Docker & Docker Compose**
- **2GB RAM minimum**
- **20GB free disk space**
- **SSL certificate** (Let's Encrypt recommended)
- **Domain name** configured with DNS

## Docker Configuration

### Development Docker Compose
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "8036:8036"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_BASE_URL=http://localhost:3036
      - NODE_ENV=development
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3036:3036"
    volumes:
      - ./backend:/app
      - ./data:/app/data  # SQLite database storage
    environment:
      - DATABASE_URL=sqlite+aiosqlite:///./data/magnetiq_dev.db
      - SECRET_KEY=dev-secret-key-change-in-production
      - DEBUG=true
      - ENVIRONMENT=development
    depends_on:
      - nginx

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/dev.conf:/etc/nginx/nginx.conf
      - ./frontend/dist:/usr/share/nginx/html
    depends_on:
      - frontend
      - backend

volumes:
  data:
    driver: local
```

### Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    image: magnetiq-frontend:latest
    restart: unless-stopped
    networks:
      - magnetiq-network

  backend:
    image: magnetiq-backend:latest
    restart: unless-stopped
    volumes:
      - ./data:/app/data  # SQLite database storage
      - ./media:/app/media  # Media files storage
    environment:
      - DATABASE_URL=sqlite+aiosqlite:///./data/magnetiq_prod.db
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=false
      - ENVIRONMENT=production
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
    networks:
      - magnetiq-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3036/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/prod.conf:/etc/nginx/nginx.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
      - ./frontend/dist:/usr/share/nginx/html
    networks:
      - magnetiq-network
    depends_on:
      - frontend
      - backend

volumes:
  data:
    driver: local
  media:
    driver: local

networks:
  magnetiq-network:
    driver: bridge
```

## Nginx Configuration

### Development Nginx Configuration
```nginx
# nginx/dev.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3036;
    }

    server {
        listen 80;
        server_name localhost;

        # Frontend routes
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }

        # API proxy to backend
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### Production Nginx Configuration
```nginx
# nginx/prod.conf
events {
    worker_connections 2048;
}

http {
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        application/json
        application/javascript
        text/xml
        application/xml
        application/xml+rss
        text/javascript;

    upstream backend {
        server backend:3036;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name voltaic.systems www.voltaic.systems;
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name voltaic.systems www.voltaic.systems;

        # SSL configuration
        ssl_certificate /etc/letsencrypt/live/voltaic.systems/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/voltaic.systems/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;

        # Security headers
        add_header Strict-Transport-Security "max-age=63072000" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;

        # Static files caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            root /usr/share/nginx/html;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API proxy to backend
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Media files
        location /media/ {
            alias /app/media/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Frontend SPA
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
            
            # Cache HTML files for short time
            location ~* \.html$ {
                expires 1h;
                add_header Cache-Control "public, must-revalidate";
            }
        }
    }
}
```

## Environment Configuration

### Development Environment Variables
```bash
# .env.dev
ENVIRONMENT=development
DEBUG=true
SECRET_KEY=dev-secret-key-change-in-production

# Database
DATABASE_URL=sqlite+aiosqlite:///./data/magnetiq_dev.db

# CORS
ALLOWED_ORIGINS=http://localhost:8036,http://localhost:3000

# Email (development - using Mailtrap)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your-mailtrap-user
SMTP_PASSWORD=your-mailtrap-password
SMTP_FROM_EMAIL=noreply@magnetiq.local

# File uploads
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=./media
```

### Production Environment Variables
```bash
# .env.prod
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=your-super-secure-production-secret-key

# Database
DATABASE_URL=sqlite+aiosqlite:///./data/magnetiq_prod.db

# CORS
ALLOWED_ORIGINS=https://voltaic.systems,https://www.voltaic.systems

# Email (production - using Brevo)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-user
SMTP_PASSWORD=your-brevo-password
SMTP_FROM_EMAIL=noreply@voltaic.systems

# File uploads
MAX_FILE_SIZE=52428800  # 50MB
UPLOAD_DIR=./data/media
```

## Deployment Process

### Development Deployment
```bash
# Clone repository
git clone https://github.com/yourusername/magnetiq2.git
cd magnetiq2

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Initialize database
docker-compose -f docker-compose.dev.yml exec backend python scripts/init_db.py

# Create admin user
docker-compose -f docker-compose.dev.yml exec backend python scripts/create_admin.py

# Access application
echo "Frontend: http://localhost:8036"
echo "Backend API: http://localhost:3036/docs"
```

### Production Deployment
```bash
# 1. Server preparation
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose nginx certbot python3-certbot-nginx

# 2. Clone and setup
git clone https://github.com/yourusername/magnetiq2.git
cd magnetiq2

# 3. Build production images
docker build -t magnetiq-frontend:latest -f frontend/Dockerfile.prod frontend/
docker build -t magnetiq-backend:latest -f backend/Dockerfile.prod backend/

# 4. Setup SSL certificate
sudo certbot certonly --nginx -d voltaic.systems -d www.voltaic.systems

# 5. Create data directories
mkdir -p data media
chmod 755 data media

# 6. Configure environment
cp .env.prod.example .env
# Edit .env with production values

# 7. Deploy application
docker-compose -f docker-compose.prod.yml up -d

# 8. Initialize production database
docker-compose -f docker-compose.prod.yml exec backend python scripts/init_db.py

# 9. Create admin user
docker-compose -f docker-compose.prod.yml exec backend python scripts/create_admin.py \
  --email admin@voltaic.systems \
  --password secure-password-here
```

## Database Management

### SQLite Database Operations
```bash
# Backup database
cp data/magnetiq_prod.db backups/magnetiq_backup_$(date +%Y%m%d_%H%M%S).db

# Database maintenance (run weekly)
docker-compose -f docker-compose.prod.yml exec backend python -c "
import sqlite3
conn = sqlite3.connect('./data/magnetiq_prod.db')
conn.execute('VACUUM;')
conn.execute('ANALYZE;')
conn.close()
"

# Check database size
ls -lh data/magnetiq_prod.db

# Database integrity check
sqlite3 data/magnetiq_prod.db "PRAGMA integrity_check;"
```

### Migration Scripts
```python
# scripts/migrate_v2.py
import sqlite3
import shutil
from datetime import datetime

def backup_database(db_path):
    """Create backup before migration"""
    backup_path = f"{db_path}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    shutil.copy2(db_path, backup_path)
    print(f"Database backed up to: {backup_path}")
    return backup_path

def run_migration(db_path):
    """Run database migration"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Example migration
    try:
        cursor.execute("ALTER TABLE pages ADD COLUMN sort_order INTEGER DEFAULT 0;")
        conn.commit()
        print("Migration completed successfully")
    except sqlite3.Error as e:
        print(f"Migration failed: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    db_path = "./data/magnetiq_prod.db"
    backup_database(db_path)
    run_migration(db_path)
```

## Monitoring & Health Checks

### Health Check Endpoints
```bash
# Application health
curl https://voltaic.systems/api/v1/health

# Detailed health check
curl https://voltaic.systems/api/v1/health/detailed

# Database size monitoring
curl https://voltaic.systems/api/v1/admin/system-health
```

### Log Management
```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f backend

# View nginx logs
docker-compose -f docker-compose.prod.yml logs -f nginx

# Rotate logs (add to crontab)
docker-compose -f docker-compose.prod.yml logs --no-color backend > logs/backend_$(date +%Y%m%d).log
```

## Backup & Recovery

### Automated Backup Script
```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
cp ./data/magnetiq_prod.db $BACKUP_DIR/magnetiq_db_$DATE.db

# Backup media files
tar -czf $BACKUP_DIR/magnetiq_media_$DATE.tar.gz ./data/media/

# Backup configuration
tar -czf $BACKUP_DIR/magnetiq_config_$DATE.tar.gz .env docker-compose.prod.yml nginx/

# Cleanup old backups (keep 7 days)
find $BACKUP_DIR -name "magnetiq_*" -mtime +7 -delete

echo "Backup completed: $DATE"
```

### Recovery Procedures
```bash
#!/bin/bash
# scripts/restore.sh

BACKUP_DATE=$1

if [ -z "$BACKUP_DATE" ]; then
    echo "Usage: $0 <backup_date>"
    exit 1
fi

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore database
cp /opt/backups/magnetiq_db_$BACKUP_DATE.db ./data/magnetiq_prod.db

# Restore media files
tar -xzf /opt/backups/magnetiq_media_$BACKUP_DATE.tar.gz

# Start services
docker-compose -f docker-compose.prod.yml up -d

echo "Restore completed from backup: $BACKUP_DATE"
```

## SSL Certificate Management

### Let's Encrypt Setup
```bash
# Initial certificate
sudo certbot certonly --webroot -w /var/www/certbot -d voltaic.systems -d www.voltaic.systems

# Auto-renewal (add to crontab)
0 12 * * * /usr/bin/certbot renew --quiet --hook-pre-stop "docker-compose -f /opt/magnetiq2/docker-compose.prod.yml stop nginx" --hook-post-start "docker-compose -f /opt/magnetiq2/docker-compose.prod.yml start nginx"
```

## Performance Optimization

### Server-Level Optimizations
```bash
# System limits
echo "fs.file-max = 2097152" >> /etc/sysctl.conf
echo "net.core.somaxconn = 65535" >> /etc/sysctl.conf
sysctl -p

# Docker resource limits
echo '{
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}' > /etc/docker/daemon.json

systemctl restart docker
```

### Application-Level Optimizations
- **SQLite WAL Mode**: Enabled by default for better concurrent reads
- **Nginx Caching**: Static assets cached for 1 year
- **Gzip Compression**: Enabled for text-based content
- **Health Checks**: Regular monitoring of application and database

## Troubleshooting

### Common Issues

#### Database Locked Error
```bash
# Check for long-running transactions
sqlite3 data/magnetiq_prod.db ".timeout 30000"

# Force unlock (use carefully)
docker-compose -f docker-compose.prod.yml restart backend
```

#### High Memory Usage
```bash
# Check container memory usage
docker stats

# Optimize SQLite cache size
# Add to environment: SQLITE_CACHE_SIZE=10000
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

## Migration to v3

When ready to upgrade to Magnetiq v3 with lightweight ESB capabilities:

### Data Export
```bash
# Export v2 data for v3
docker-compose -f docker-compose.prod.yml exec backend python scripts/export_for_v3.py

# This creates:
# - users_export.json
# - pages_export.json  
# - webinars_export.json
# - media_files_export.json
```

### Architecture Changes
- **Database**: SQLite → PostgreSQL + Redis
- **Message Queue**: None → Celery with Redis
- **Integration**: HTTP clients → ESB patterns
- **Deployment**: Single container → Multi-service architecture

See [Magnetiq v3 Integration Specification](../spec_v3/integration.md) for detailed upgrade procedures.

## Conclusion

Magnetiq v2 deployment emphasizes simplicity and reliability through SQLite-based architecture. This approach enables rapid deployment with minimal infrastructure while providing solid performance for small to medium-scale applications. The architecture provides a clear upgrade path to v3 when advanced integration capabilities are needed.

## Support & Maintenance

### Regular Maintenance Tasks
- **Weekly**: Database VACUUM and ANALYZE
- **Daily**: Backup database and media files  
- **Monthly**: Log rotation and cleanup
- **Quarterly**: Security updates and dependency upgrades

### Monitoring Checklist
- [ ] Application health check responding
- [ ] Database file size within limits
- [ ] Disk space availability
- [ ] SSL certificate expiry
- [ ] Backup completion status
- [ ] Log file rotation
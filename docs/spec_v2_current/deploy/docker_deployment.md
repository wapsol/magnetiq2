# Docker Deployment Spec - Magnetiq v2

## Overview
Docker-based deployment for Magnetiq v2 using Docker Compose with simple architecture suitable for development and small-to-medium production deployments.

## Architecture
- **Frontend**: React SPA served via Nginx (Port 8036)
- **Backend**: FastAPI application (Port 3036)
- **Database**: SQLite file-based database with WAL mode
- **Web Server**: Nginx for static files and reverse proxy
- **No External Dependencies**: No Redis, Celery, or message queuing systems

## Requirements

### Development Environment
- Docker & Docker Compose
- Node.js 18+ (for development tooling)
- Python 3.11+ (for development)
- 4GB RAM minimum
- 10GB free disk space

### Production Environment
- Linux server (Ubuntu 20.04+ recommended)
- Docker & Docker Compose
- 2GB RAM minimum
- 20GB free disk space
- SSL certificate (Let's Encrypt)
- Domain name with DNS records

## Container Configuration

### Development Setup
```yaml
# docker-compose.dev.yml
services:
  backend:
    build: ./backend
    ports:
      - "3036:3036"
    volumes:
      - ./backend:/app
      - magnetiq_data:/app/data
    environment:
      - DEBUG=true
      - DATABASE_URL=sqlite:///app/data/magnetiq.db

  frontend:
    build: ./frontend
    ports:
      - "8036:8036"
    volumes:
      - ./frontend:/app
    environment:
      - NODE_ENV=development
```

### Production Setup
```yaml
# docker-compose.yml
services:
  backend:
    image: magnetiq/backend:latest
    restart: unless-stopped
    volumes:
      - magnetiq_data:/app/data
      - magnetiq_media:/app/media
    environment:
      - DEBUG=false
      - DATABASE_URL=sqlite:///app/data/magnetiq.db

  frontend:
    image: magnetiq/frontend:latest
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - magnetiq_ssl:/etc/ssl/certs
    restart: unless-stopped
    depends_on:
      - backend
      - frontend

volumes:
  magnetiq_data:
  magnetiq_media:
  magnetiq_ssl:
```

## Nginx Configuration
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3036;
    }
    
    upstream frontend {
        server frontend:8036;
    }

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name yourdomain.com;
        
        ssl_certificate /etc/ssl/certs/cert.pem;
        ssl_certificate_key /etc/ssl/certs/key.pem;

        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

## Deployment Process

### Development Deployment
```bash
# Clone repository
git clone <repository-url>
cd magnetiq2

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Check health
curl http://localhost:3036/health
curl http://localhost:8036
```

### Production Deployment
```bash
# Build images
docker build -t magnetiq/backend:latest ./backend
docker build -t magnetiq/frontend:latest ./frontend

# Deploy with SSL
docker-compose up -d

# Initialize database
docker-compose exec backend python -m app.database.init_db

# Create admin user
docker-compose exec backend python -m scripts.create_admin
```

## SSL Certificate Setup

### Let's Encrypt Integration
```bash
# Install certbot
apt-get install certbot

# Get certificate
certbot certonly --standalone -d yourdomain.com

# Copy to docker volume
docker cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem magnetiq_ssl:/etc/ssl/certs/cert.pem
docker cp /etc/letsencrypt/live/yourdomain.com/privkey.pem magnetiq_ssl:/etc/ssl/certs/key.pem

# Restart nginx
docker-compose restart nginx
```

## Database Management

### Backup Operations
```bash
# Create backup
docker-compose exec backend sqlite3 /app/data/magnetiq.db ".backup /app/data/backup-$(date +%Y%m%d).db"

# Copy backup locally
docker cp magnetiq_backend_1:/app/data/backup-$(date +%Y%m%d).db ./backups/
```

### Restore Operations
```bash
# Copy backup to container
docker cp ./backup.db magnetiq_backend_1:/app/data/restore.db

# Restore database
docker-compose exec backend sqlite3 /app/data/magnetiq.db ".restore /app/data/restore.db"
```

## Monitoring & Health Checks

### Health Endpoints
- Backend: `http://localhost:3036/health`
- Frontend: `http://localhost:8036`
- Database connectivity via backend health endpoint

### Log Management
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Log rotation
docker system prune -f
```

## Performance Tuning

### Resource Limits
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
```

### SQLite Optimizations
```python
# In backend configuration
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = memory;
```

## Troubleshooting

### Common Issues
1. **Port conflicts**: Check if ports 8036/3036 are available
2. **SSL certificate errors**: Verify certificate paths and permissions
3. **Database locks**: Check SQLite WAL mode configuration
4. **Container networking**: Verify docker network connectivity

### Debug Commands
```bash
# Check container status
docker-compose ps

# Inspect networks
docker network ls
docker network inspect magnetiq_default

# Resource usage
docker stats

# Container shell access
docker-compose exec backend /bin/bash
docker-compose exec frontend /bin/sh
```

## Scaling Considerations

### Vertical Scaling
- Increase container resource limits
- Optimize SQLite configuration for larger datasets
- Implement caching strategies

## Migration Path to Kubernetes
When ready to scale beyond Docker Compose:
1. Export data using backup procedures
2. Build production container images
3. Create Kubernetes manifests
4. Deploy using k8s_deployment.md specification
5. Import data to new environment

## Security Considerations
- Use non-root users in containers
- Implement proper file permissions
- Regular security updates for base images
- Network segmentation with Docker networks
- Secrets management for sensitive data

## Maintenance Schedule
- **Daily**: Log review and cleanup
- **Weekly**: Database optimization (VACUUM)
- **Monthly**: Container image updates
- **Quarterly**: SSL certificate renewal check

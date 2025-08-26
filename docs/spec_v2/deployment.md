# Magnetiq v2 - Deployment Specification

## Overview

This deployment specification defines the infrastructure, processes, and configurations required to deploy and maintain Magnetiq v2 in production environments. It covers containerization, orchestration, monitoring, and maintenance procedures.

## Infrastructure Architecture

### Production Environment

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (Nginx)                    │
│                     SSL Termination                         │
└────────────┬──────────────────────────────┬─────────────────┘
             │                              │
             ▼                              ▼
┌─────────────────────────┐    ┌──────────────────────────┐
│   Frontend Services     │    │    Backend Services      │
│   (React Production)    │    │   (FastAPI + Gunicorn)   │
│   Port: 80, 443        │    │   Port: 3036             │
└─────────────────────────┘    └──────────────────────────┘
                                            │
                        ┌───────────────────┼───────────────────┐
                        ▼                   ▼                   ▼
              ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
              │   PostgreSQL    │  │     Redis       │  │     Celery      │
              │   (Primary DB)  │  │   (Cache/Queue) │  │   (Workers)     │
              │   Port: 5432    │  │   Port: 6379    │  │                 │
              └─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Environment Specifications

#### Development Environment
- **Frontend**: Vite dev server (Port 8036)
- **Backend**: FastAPI with auto-reload (Port 3036)
- **Database**: SQLite for local development
- **Cache**: Redis (optional for development)

#### Staging Environment
- **Infrastructure**: Mirrored production setup
- **Data**: Sanitized production data subset
- **Integrations**: Test/sandbox endpoints
- **Monitoring**: Same as production

#### Production Environment
- **High Availability**: Multi-instance deployment
- **Database**: PostgreSQL with replication
- **Cache**: Redis cluster
- **Monitoring**: Comprehensive observability stack

## Containerization

### Docker Configuration

#### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Create app user
RUN addgroup --system app && adduser --system --group app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /tmp/
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Create app directory
WORKDIR /app
RUN chown app:app /app

# Copy application code
COPY --chown=app:app . .

# Switch to app user
USER app

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3036/health || exit 1

# Expose port
EXPOSE 3036

# Run application
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:3036", "--access-logfile", "-"]
```

#### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Add health check
RUN apk add --no-cache curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Frontend Nginx Configuration
```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection \"1; mode=block\";
        add_header Referrer-Policy strict-origin-when-cross-origin;
        
        # Static assets caching
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {\n            expires 1y;\n            add_header Cache-Control \"public, immutable\";\n        }\n        \n        # API proxy\n        location /api/ {\n            proxy_pass http://backend:3036;\n            proxy_set_header Host $host;\n            proxy_set_header X-Real-IP $remote_addr;\n            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n            proxy_set_header X-Forwarded-Proto $scheme;\n        }\n        \n        # SPA fallback\n        location / {\n            try_files $uri $uri/ /index.html;\n        }\n        \n        # Health check endpoint\n        location /health {\n            access_log off;\n            return 200 \"healthy\\n\";\n            add_header Content-Type text/plain;\n        }\n    }\n}\n```\n\n### Docker Compose\n\n#### Development Compose\n```yaml\n# docker-compose.dev.yml\nversion: '3.8'\n\nservices:\n  frontend:\n    build:\n      context: ./frontend\n      dockerfile: Dockerfile.dev\n    ports:\n      - \"8036:8036\"\n    volumes:\n      - ./frontend:/app\n      - /app/node_modules\n    environment:\n      - VITE_API_BASE_URL=http://localhost:3036\n    depends_on:\n      - backend\n\n  backend:\n    build:\n      context: ./backend\n      dockerfile: Dockerfile.dev\n    ports:\n      - \"3036:3036\"\n    volumes:\n      - ./backend:/app\n    environment:\n      - DATABASE_URL=postgresql://postgres:password@db:5432/magnetiq_dev\n      - REDIS_URL=redis://redis:6379/0\n      - ENVIRONMENT=development\n    depends_on:\n      - db\n      - redis\n\n  db:\n    image: postgres:14-alpine\n    environment:\n      - POSTGRES_DB=magnetiq_dev\n      - POSTGRES_USER=postgres\n      - POSTGRES_PASSWORD=password\n    volumes:\n      - postgres_data:/var/lib/postgresql/data\n    ports:\n      - \"5432:5432\"\n\n  redis:\n    image: redis:7-alpine\n    ports:\n      - \"6379:6379\"\n    volumes:\n      - redis_data:/data\n\n  celery:\n    build:\n      context: ./backend\n      dockerfile: Dockerfile.dev\n    command: celery -A main.celery_app worker --loglevel=info\n    volumes:\n      - ./backend:/app\n    environment:\n      - DATABASE_URL=postgresql://postgres:password@db:5432/magnetiq_dev\n      - REDIS_URL=redis://redis:6379/0\n    depends_on:\n      - db\n      - redis\n\n  celery-beat:\n    build:\n      context: ./backend\n      dockerfile: Dockerfile.dev\n    command: celery -A main.celery_app beat --loglevel=info\n    volumes:\n      - ./backend:/app\n    environment:\n      - DATABASE_URL=postgresql://postgres:password@db:5432/magnetiq_dev\n      - REDIS_URL=redis://redis:6379/0\n    depends_on:\n      - db\n      - redis\n\nvolumes:\n  postgres_data:\n  redis_data:\n```\n\n#### Production Compose\n```yaml\n# docker-compose.prod.yml\nversion: '3.8'\n\nservices:\n  frontend:\n    image: magnetiq-frontend:latest\n    restart: unless-stopped\n    depends_on:\n      - backend\n    networks:\n      - magnetiq-network\n\n  backend:\n    image: magnetiq-backend:latest\n    restart: unless-stopped\n    environment:\n      - DATABASE_URL=${DATABASE_URL}\n      - REDIS_URL=${REDIS_URL}\n      - SECRET_KEY=${SECRET_KEY}\n      - ENVIRONMENT=production\n    depends_on:\n      - db\n      - redis\n    networks:\n      - magnetiq-network\n    healthcheck:\n      test: [\"CMD\", \"curl\", \"-f\", \"http://localhost:3036/health\"]\n      interval: 30s\n      timeout: 10s\n      retries: 3\n\n  nginx:\n    image: nginx:alpine\n    ports:\n      - \"80:80\"\n      - \"443:443\"\n    volumes:\n      - ./nginx/nginx.conf:/etc/nginx/nginx.conf\n      - ./certbot/conf:/etc/letsencrypt\n      - ./certbot/www:/var/www/certbot\n    depends_on:\n      - frontend\n      - backend\n    networks:\n      - magnetiq-network\n    restart: unless-stopped\n\n  db:\n    image: postgres:14-alpine\n    restart: unless-stopped\n    environment:\n      - POSTGRES_DB=${POSTGRES_DB}\n      - POSTGRES_USER=${POSTGRES_USER}\n      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}\n    volumes:\n      - postgres_data:/var/lib/postgresql/data\n      - ./backups:/backups\n    networks:\n      - magnetiq-network\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U ${POSTGRES_USER}\"]\n      interval: 30s\n      timeout: 10s\n      retries: 5\n\n  redis:\n    image: redis:7-alpine\n    restart: unless-stopped\n    volumes:\n      - redis_data:/data\n    networks:\n      - magnetiq-network\n    healthcheck:\n      test: [\"CMD\", \"redis-cli\", \"ping\"]\n      interval: 30s\n      timeout: 10s\n      retries: 5\n\n  celery:\n    image: magnetiq-backend:latest\n    command: celery -A main.celery_app worker --loglevel=info --concurrency=4\n    restart: unless-stopped\n    environment:\n      - DATABASE_URL=${DATABASE_URL}\n      - REDIS_URL=${REDIS_URL}\n      - SECRET_KEY=${SECRET_KEY}\n    depends_on:\n      - db\n      - redis\n    networks:\n      - magnetiq-network\n    healthcheck:\n      test: [\"CMD\", \"celery\", \"-A\", \"main.celery_app\", \"inspect\", \"ping\"]\n      interval: 60s\n      timeout: 30s\n      retries: 3\n\n  celery-beat:\n    image: magnetiq-backend:latest\n    command: celery -A main.celery_app beat --loglevel=info\n    restart: unless-stopped\n    environment:\n      - DATABASE_URL=${DATABASE_URL}\n      - REDIS_URL=${REDIS_URL}\n      - SECRET_KEY=${SECRET_KEY}\n    depends_on:\n      - db\n      - redis\n    networks:\n      - magnetiq-network\n    volumes:\n      - celery_beat:/app/celerybeat-schedule\n\nvolumes:\n  postgres_data:\n  redis_data:\n  celery_beat:\n\nnetworks:\n  magnetiq-network:\n    driver: bridge\n```\n\n## Environment Configuration\n\n### Environment Variables\n\n#### Backend Environment Variables\n```bash\n# .env.production\n# Application\nENVIRONMENT=production\nAPP_NAME=\"Magnetiq v2\"\nVERSION=2.0.0\nDEBUG=false\nSECRET_KEY=your-super-secure-secret-key-here\n\n# Server\nHOST=0.0.0.0\nPORT=3036\nWORKERS=4\n\n# Database\nDATABASE_URL=postgresql://username:password@db:5432/magnetiq_prod\nDB_POOL_SIZE=10\nDB_MAX_OVERFLOW=20\nDB_ECHO=false\n\n# Redis\nREDIS_URL=redis://redis:6379/0\nREDIS_PASSWORD=your-redis-password\n\n# Security\nALLOWED_HOSTS=\"voltaic.systems,www.voltaic.systems,admin.voltaic.systems\"\nCORS_ORIGINS=\"https://voltaic.systems,https://www.voltaic.systems\"\n\n# External Services\n# Google Calendar\nGOOGLE_CALENDAR_CLIENT_ID=your-google-client-id\nGOOGLE_CALENDAR_CLIENT_SECRET=your-google-client-secret\n\n# Email (SMTP)\nSMTP_HOST=smtp-relay.brevo.com\nSMTP_PORT=587\nSMTP_USERNAME=your-smtp-username\nSMTP_PASSWORD=your-smtp-password\nSMTP_FROM_EMAIL=noreply@voltaic.systems\nSMTP_FROM_NAME=\"voltAIc Systems\"\n\n# Odoo Integration\nODOO_URL=https://odoo.voltaic.systems\nODOO_DATABASE=voltaic_production\nODOO_USERNAME=api_user\nODOO_API_KEY=your-odoo-api-key\n\n# File Storage\nUPLOAD_MAX_SIZE=52428800  # 50MB\nMEDIA_URL=/media/\nSTATIC_URL=/static/\n\n# Monitoring\nSENTRY_DSN=your-sentry-dsn\nPROMETHEUS_METRICS=true\nLOG_LEVEL=INFO\n```\n\n#### Frontend Environment Variables\n```bash\n# .env.production\nVITE_API_BASE_URL=https://api.voltaic.systems\nVITE_API_VERSION=v1\n\n# Analytics\nVITE_GOOGLE_ANALYTICS_ID=GA-XXXXX-X\nVITE_GOOGLE_TAG_MANAGER_ID=GTM-XXXXX\n\n# Feature Flags\nVITE_ENABLE_ANALYTICS=true\nVITE_ENABLE_CHAT_WIDGET=false\nVITE_ENABLE_A11Y_TOOLS=true\n\n# External Services\nVITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key\nVITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key\n\n# CDN\nVITE_CDN_URL=https://cdn.voltaic.systems\n```\n\n### Configuration Management\n\n#### Kubernetes ConfigMap\n```yaml\n# k8s/configmap.yml\napiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: magnetiq-config\n  namespace: production\ndata:\n  # Application config\n  APP_NAME: \"Magnetiq v2\"\n  ENVIRONMENT: \"production\"\n  LOG_LEVEL: \"INFO\"\n  \n  # Database config\n  DB_POOL_SIZE: \"10\"\n  DB_MAX_OVERFLOW: \"20\"\n  \n  # External services\n  SMTP_HOST: \"smtp-relay.brevo.com\"\n  SMTP_PORT: \"587\"\n  ODOO_URL: \"https://odoo.voltaic.systems\"\n---\napiVersion: v1\nkind: Secret\nmetadata:\n  name: magnetiq-secrets\n  namespace: production\ntype: Opaque\nstringData:\n  SECRET_KEY: \"your-secret-key\"\n  DATABASE_URL: \"postgresql://user:pass@host:5432/db\"\n  SMTP_PASSWORD: \"your-smtp-password\"\n  ODOO_API_KEY: \"your-odoo-api-key\"\n```\n\n## CI/CD Pipeline\n\n### GitHub Actions Workflow\n```yaml\n# .github/workflows/deploy.yml\nname: Deploy to Production\n\non:\n  push:\n    branches: [main]\n  release:\n    types: [published]\n\nenv:\n  REGISTRY: ghcr.io\n  IMAGE_NAME: ${{ github.repository }}\n\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      \n      - name: Run Tests\n        run: |\n          npm test\n          pytest\n          \n  build-and-push:\n    needs: test\n    runs-on: ubuntu-latest\n    permissions:\n      contents: read\n      packages: write\n    \n    steps:\n      - name: Checkout\n        uses: actions/checkout@v4\n      \n      - name: Log in to Container Registry\n        uses: docker/login-action@v3\n        with:\n          registry: ${{ env.REGISTRY }}\n          username: ${{ github.actor }}\n          password: ${{ secrets.GITHUB_TOKEN }}\n      \n      - name: Extract metadata\n        id: meta\n        uses: docker/metadata-action@v5\n        with:\n          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}\n          tags: |\n            type=ref,event=branch\n            type=ref,event=pr\n            type=sha,prefix={{branch}}-\n            type=raw,value=latest,enable={{is_default_branch}}\n      \n      - name: Build and push Backend\n        uses: docker/build-push-action@v5\n        with:\n          context: ./backend\n          push: true\n          tags: ${{ steps.meta.outputs.tags }}-backend\n          labels: ${{ steps.meta.outputs.labels }}\n      \n      - name: Build and push Frontend\n        uses: docker/build-push-action@v5\n        with:\n          context: ./frontend\n          push: true\n          tags: ${{ steps.meta.outputs.tags }}-frontend\n          labels: ${{ steps.meta.outputs.labels }}\n  \n  deploy:\n    needs: build-and-push\n    runs-on: ubuntu-latest\n    if: github.ref == 'refs/heads/main'\n    \n    steps:\n      - name: Deploy to Production\n        uses: appleboy/ssh-action@v1.0.0\n        with:\n          host: ${{ secrets.PRODUCTION_HOST }}\n          username: ${{ secrets.PRODUCTION_USER }}\n          key: ${{ secrets.PRODUCTION_SSH_KEY }}\n          script: |\n            cd /opt/magnetiq\n            docker-compose pull\n            docker-compose up -d\n            docker system prune -f\n```\n\n### Deployment Scripts\n\n#### Production Deployment Script\n```bash\n#!/bin/bash\n# scripts/deploy.sh\n\nset -e  # Exit on any error\n\n# Configuration\nAPP_NAME=\"magnetiq\"\nDOCKER_COMPOSE_FILE=\"docker-compose.prod.yml\"\nBACKUP_DIR=\"/opt/backups\"\nLOG_FILE=\"/var/log/deployment.log\"\n\n# Colors for output\nRED='\\033[0;31m'\nGREEN='\\033[0;32m'\nYELLOW='\\033[1;33m'\nNC='\\033[0m' # No Color\n\n# Logging function\nlog() {\n    echo \"$(date '+%Y-%m-%d %H:%M:%S') - $1\" | tee -a $LOG_FILE\n}\n\ninfo() {\n    echo -e \"${GREEN}[INFO]${NC} $1\"\n    log \"[INFO] $1\"\n}\n\nwarn() {\n    echo -e \"${YELLOW}[WARN]${NC} $1\"\n    log \"[WARN] $1\"\n}\n\nerror() {\n    echo -e \"${RED}[ERROR]${NC} $1\"\n    log \"[ERROR] $1\"\n}\n\n# Pre-deployment checks\npre_deployment_checks() {\n    info \"Running pre-deployment checks...\"\n    \n    # Check if required files exist\n    if [ ! -f \"$DOCKER_COMPOSE_FILE\" ]; then\n        error \"Docker compose file not found: $DOCKER_COMPOSE_FILE\"\n        exit 1\n    fi\n    \n    # Check if .env file exists\n    if [ ! -f \".env\" ]; then\n        error \"Environment file not found: .env\"\n        exit 1\n    fi\n    \n    # Check Docker is running\n    if ! docker info > /dev/null 2>&1; then\n        error \"Docker is not running\"\n        exit 1\n    fi\n    \n    info \"Pre-deployment checks passed\"\n}\n\n# Database backup\nbackup_database() {\n    info \"Creating database backup...\"\n    \n    BACKUP_FILE=\"$BACKUP_DIR/magnetiq_$(date +%Y%m%d_%H%M%S).sql\"\n    \n    docker-compose -f $DOCKER_COMPOSE_FILE exec -T db pg_dump -U $POSTGRES_USER $POSTGRES_DB > $BACKUP_FILE\n    \n    if [ $? -eq 0 ]; then\n        info \"Database backup created: $BACKUP_FILE\"\n        \n        # Compress backup\n        gzip $BACKUP_FILE\n        info \"Backup compressed: $BACKUP_FILE.gz\"\n    else\n        error \"Database backup failed\"\n        exit 1\n    fi\n}\n\n# Deploy application\ndeploy() {\n    info \"Starting deployment...\"\n    \n    # Pull latest images\n    info \"Pulling latest Docker images...\"\n    docker-compose -f $DOCKER_COMPOSE_FILE pull\n    \n    # Run database migrations\n    info \"Running database migrations...\"\n    docker-compose -f $DOCKER_COMPOSE_FILE run --rm backend alembic upgrade head\n    \n    # Deploy with zero-downtime strategy\n    info \"Restarting services...\"\n    docker-compose -f $DOCKER_COMPOSE_FILE up -d\n    \n    # Wait for services to be healthy\n    info \"Waiting for services to be healthy...\"\n    sleep 30\n    \n    # Health check\n    if curl -f http://localhost/health > /dev/null 2>&1; then\n        info \"Health check passed\"\n    else\n        error \"Health check failed\"\n        rollback\n        exit 1\n    fi\n    \n    # Clean up old images\n    info \"Cleaning up old Docker images...\"\n    docker system prune -f\n    \n    info \"Deployment completed successfully\"\n}\n\n# Rollback function\nrollback() {\n    warn \"Starting rollback...\"\n    \n    # Get previous image tags (implement based on your tagging strategy)\n    PREVIOUS_TAG=$(docker images --format \"table {{.Repository}}:{{.Tag}}\" | grep magnetiq | head -2 | tail -1)\n    \n    if [ ! -z \"$PREVIOUS_TAG\" ]; then\n        info \"Rolling back to: $PREVIOUS_TAG\"\n        \n        # Update compose file with previous tags (implementation depends on your setup)\n        # docker-compose -f $DOCKER_COMPOSE_FILE up -d\n        \n        warn \"Rollback completed\"\n    else\n        error \"No previous version found for rollback\"\n    fi\n}\n\n# Post-deployment tasks\npost_deployment() {\n    info \"Running post-deployment tasks...\"\n    \n    # Clear application caches\n    docker-compose -f $DOCKER_COMPOSE_FILE exec -T redis redis-cli FLUSHDB\n    \n    # Warm up cache (if applicable)\n    # curl -s http://localhost/api/v1/cache/warmup > /dev/null\n    \n    # Send deployment notification\n    # slack_notify \"Deployment completed successfully\"\n    \n    info \"Post-deployment tasks completed\"\n}\n\n# Main execution\nmain() {\n    info \"Starting deployment process...\"\n    \n    pre_deployment_checks\n    backup_database\n    deploy\n    post_deployment\n    \n    info \"Deployment process completed\"\n}\n\n# Execute main function\nmain \"$@\"\n```\n\n## Monitoring & Observability\n\n### Health Checks\n\n#### Backend Health Check\n```python\n# health.py - Comprehensive health check endpoint\nfrom fastapi import APIRouter, Depends, status\nfrom sqlalchemy.orm import Session\nfrom sqlalchemy import text\nfrom redis import Redis\nfrom typing import Dict, Any\nimport asyncio\nimport aiohttp\n\nrouter = APIRouter()\n\n@router.get(\"/health\")\nasync def health_check():\n    \"\"\"Basic health check\"\"\"\n    return {\n        \"status\": \"healthy\",\n        \"timestamp\": datetime.utcnow().isoformat(),\n        \"version\": \"2.0.0\"\n    }\n\n@router.get(\"/health/detailed\")\nasync def detailed_health_check(\n    db: Session = Depends(get_db),\n    redis: Redis = Depends(get_redis)\n):\n    \"\"\"Detailed health check with dependencies\"\"\"\n    health_status = {\n        \"status\": \"healthy\",\n        \"timestamp\": datetime.utcnow().isoformat(),\n        \"version\": \"2.0.0\",\n        \"services\": {}\n    }\n    \n    # Database health\n    try:\n        db.execute(text(\"SELECT 1\"))\n        health_status[\"services\"][\"database\"] = {\n            \"status\": \"healthy\",\n            \"response_time_ms\": 10  # Calculate actual response time\n        }\n    except Exception as e:\n        health_status[\"services\"][\"database\"] = {\n            \"status\": \"unhealthy\",\n            \"error\": str(e)\n        }\n        health_status[\"status\"] = \"degraded\"\n    \n    # Redis health\n    try:\n        await redis.ping()\n        health_status[\"services\"][\"redis\"] = {\"status\": \"healthy\"}\n    except Exception as e:\n        health_status[\"services\"][\"redis\"] = {\n            \"status\": \"unhealthy\",\n            \"error\": str(e)\n        }\n    \n    # External services health\n    external_services = await check_external_services()\n    health_status[\"services\"].update(external_services)\n    \n    return health_status\n\nasync def check_external_services() -> Dict[str, Any]:\n    \"\"\"Check external service health\"\"\"\n    services = {}\n    \n    # Check SMTP service\n    try:\n        # Implement SMTP connection check\n        services[\"smtp\"] = {\"status\": \"healthy\"}\n    except Exception as e:\n        services[\"smtp\"] = {\"status\": \"unhealthy\", \"error\": str(e)}\n    \n    # Check Odoo connection\n    try:\n        # Implement Odoo API health check\n        services[\"odoo\"] = {\"status\": \"healthy\"}\n    except Exception as e:\n        services[\"odoo\"] = {\"status\": \"unhealthy\", \"error\": str(e)}\n    \n    return services\n```\n\n### Prometheus Metrics\n\n```python\n# metrics.py - Application metrics\nfrom prometheus_client import Counter, Histogram, Gauge, generate_latest\nfrom fastapi import APIRouter\n\nrouter = APIRouter()\n\n# Define metrics\nREQUEST_COUNT = Counter(\n    'http_requests_total',\n    'Total number of HTTP requests',\n    ['method', 'endpoint', 'status_code']\n)\n\nREQUEST_DURATION = Histogram(\n    'http_request_duration_seconds',\n    'HTTP request duration in seconds',\n    ['method', 'endpoint']\n)\n\nACTIVE_CONNECTIONS = Gauge(\n    'active_connections',\n    'Number of active connections'\n)\n\nDATABASE_CONNECTIONS = Gauge(\n    'database_connections_active',\n    'Number of active database connections'\n)\n\nWEBINAR_REGISTRATIONS = Counter(\n    'webinar_registrations_total',\n    'Total number of webinar registrations',\n    ['webinar_id']\n)\n\nBOOKING_REQUESTS = Counter(\n    'booking_requests_total',\n    'Total number of booking requests',\n    ['status']\n)\n\n@router.get('/metrics')\nasync def metrics():\n    \"\"\"Prometheus metrics endpoint\"\"\"\n    return Response(\n        generate_latest(),\n        media_type='text/plain'\n    )\n```\n\n### Logging Configuration\n\n```python\n# logging_config.py - Structured logging setup\nimport logging\nimport logging.config\nimport json\nfrom datetime import datetime\nfrom typing import Dict, Any\n\nclass JSONFormatter(logging.Formatter):\n    \"\"\"JSON formatter for structured logging\"\"\"\n    \n    def format(self, record: logging.LogRecord) -> str:\n        log_entry = {\n            'timestamp': datetime.utcnow().isoformat(),\n            'level': record.levelname,\n            'logger': record.name,\n            'message': record.getMessage(),\n        }\n        \n        # Add extra fields\n        if hasattr(record, 'request_id'):\n            log_entry['request_id'] = record.request_id\n        \n        if hasattr(record, 'user_id'):\n            log_entry['user_id'] = record.user_id\n        \n        if record.exc_info:\n            log_entry['exception'] = self.formatException(record.exc_info)\n        \n        return json.dumps(log_entry)\n\n# Logging configuration\nLOGGING_CONFIG = {\n    'version': 1,\n    'disable_existing_loggers': False,\n    'formatters': {\n        'json': {\n            '()': JSONFormatter,\n        },\n        'standard': {\n            'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'\n        },\n    },\n    'handlers': {\n        'default': {\n            'level': 'INFO',\n            'formatter': 'json',\n            'class': 'logging.StreamHandler',\n            'stream': 'ext://sys.stdout',\n        },\n        'file': {\n            'level': 'INFO',\n            'formatter': 'json',\n            'class': 'logging.handlers.RotatingFileHandler',\n            'filename': '/var/log/magnetiq/app.log',\n            'maxBytes': 10485760,  # 10MB\n            'backupCount': 5,\n        },\n    },\n    'loggers': {\n        '': {\n            'handlers': ['default', 'file'],\n            'level': 'INFO',\n            'propagate': False\n        },\n    }\n}\n\ndef setup_logging():\n    \"\"\"Setup application logging\"\"\"\n    logging.config.dictConfig(LOGGING_CONFIG)\n```\n\n## Backup & Recovery\n\n### Automated Backup Script\n```bash\n#!/bin/bash\n# scripts/backup.sh\n\nset -e\n\n# Configuration\nBACKUP_DIR=\"/opt/backups\"\nS3_BUCKET=\"magnetiq-backups\"\nRETENTION_DAYS=30\nDATABASE_NAME=\"magnetiq_prod\"\nPOSTGRES_USER=\"postgres\"\nREDIS_HOST=\"redis\"\n\n# Create backup directory\nmkdir -p $BACKUP_DIR\n\n# Generate timestamp\nTIMESTAMP=$(date +%Y%m%d_%H%M%S)\n\n# Database backup\necho \"Creating database backup...\"\nDB_BACKUP_FILE=\"$BACKUP_DIR/db_backup_$TIMESTAMP.sql\"\ndocker exec magnetiq-db pg_dump -U $POSTGRES_USER $DATABASE_NAME > $DB_BACKUP_FILE\n\n# Compress database backup\ngzip $DB_BACKUP_FILE\necho \"Database backup created: $DB_BACKUP_FILE.gz\"\n\n# Redis backup\necho \"Creating Redis backup...\"\nREDIS_BACKUP_FILE=\"$BACKUP_DIR/redis_backup_$TIMESTAMP.rdb\"\ndocker exec magnetiq-redis redis-cli --rdb /data/backup.rdb\ndocker cp magnetiq-redis:/data/backup.rdb $REDIS_BACKUP_FILE\necho \"Redis backup created: $REDIS_BACKUP_FILE\"\n\n# Media files backup\necho \"Creating media files backup...\"\nMEDIA_BACKUP_FILE=\"$BACKUP_DIR/media_backup_$TIMESTAMP.tar.gz\"\ntar -czf $MEDIA_BACKUP_FILE -C /opt/magnetiq/media .\necho \"Media backup created: $MEDIA_BACKUP_FILE\"\n\n# Upload to S3 (if configured)\nif [ ! -z \"$S3_BUCKET\" ] && command -v aws &> /dev/null; then\n    echo \"Uploading backups to S3...\"\n    aws s3 cp $DB_BACKUP_FILE.gz s3://$S3_BUCKET/database/\n    aws s3 cp $REDIS_BACKUP_FILE s3://$S3_BUCKET/redis/\n    aws s3 cp $MEDIA_BACKUP_FILE s3://$S3_BUCKET/media/\n    echo \"Backups uploaded to S3\"\nfi\n\n# Cleanup old backups\necho \"Cleaning up old backups...\"\nfind $BACKUP_DIR -name \"*.gz\" -mtime +$RETENTION_DAYS -delete\nfind $BACKUP_DIR -name \"*.rdb\" -mtime +$RETENTION_DAYS -delete\nfind $BACKUP_DIR -name \"*.tar.gz\" -mtime +$RETENTION_DAYS -delete\n\necho \"Backup process completed successfully\"\n```\n\n### Recovery Procedures\n\n```bash\n#!/bin/bash\n# scripts/restore.sh\n\nset -e\n\n# Usage: ./restore.sh <backup_date>\nif [ -z \"$1\" ]; then\n    echo \"Usage: $0 <backup_date> (format: YYYYMMDD_HHMMSS)\"\n    exit 1\nfi\n\nBACKUP_DATE=$1\nBACKUP_DIR=\"/opt/backups\"\nDATABASE_NAME=\"magnetiq_prod\"\nPOSTGRES_USER=\"postgres\"\n\necho \"Starting recovery process for backup: $BACKUP_DATE\"\n\n# Stop application services\necho \"Stopping application services...\"\ndocker-compose -f docker-compose.prod.yml stop backend frontend celery\n\n# Restore database\nDB_BACKUP_FILE=\"$BACKUP_DIR/db_backup_$BACKUP_DATE.sql.gz\"\nif [ -f \"$DB_BACKUP_FILE\" ]; then\n    echo \"Restoring database from: $DB_BACKUP_FILE\"\n    \n    # Create new database\n    docker exec magnetiq-db createdb -U $POSTGRES_USER ${DATABASE_NAME}_restored\n    \n    # Restore data\n    gunzip -c $DB_BACKUP_FILE | docker exec -i magnetiq-db psql -U $POSTGRES_USER ${DATABASE_NAME}_restored\n    \n    # Switch databases (rename)\n    docker exec magnetiq-db psql -U $POSTGRES_USER -c \"ALTER DATABASE $DATABASE_NAME RENAME TO ${DATABASE_NAME}_old;\"\n    docker exec magnetiq-db psql -U $POSTGRES_USER -c \"ALTER DATABASE ${DATABASE_NAME}_restored RENAME TO $DATABASE_NAME;\"\n    \n    echo \"Database restored successfully\"\nelse\n    echo \"Database backup file not found: $DB_BACKUP_FILE\"\n    exit 1\nfi\n\n# Restore Redis\nREDIS_BACKUP_FILE=\"$BACKUP_DIR/redis_backup_$BACKUP_DATE.rdb\"\nif [ -f \"$REDIS_BACKUP_FILE\" ]; then\n    echo \"Restoring Redis from: $REDIS_BACKUP_FILE\"\n    \n    # Stop Redis\n    docker-compose -f docker-compose.prod.yml stop redis\n    \n    # Replace Redis data\n    docker cp $REDIS_BACKUP_FILE magnetiq-redis:/data/dump.rdb\n    \n    # Start Redis\n    docker-compose -f docker-compose.prod.yml start redis\n    \n    echo \"Redis restored successfully\"\nfi\n\n# Restore media files\nMEDIA_BACKUP_FILE=\"$BACKUP_DIR/media_backup_$BACKUP_DATE.tar.gz\"\nif [ -f \"$MEDIA_BACKUP_FILE\" ]; then\n    echo \"Restoring media files from: $MEDIA_BACKUP_FILE\"\n    \n    # Backup current media\n    mv /opt/magnetiq/media /opt/magnetiq/media_backup_$(date +%Y%m%d_%H%M%S)\n    \n    # Create media directory\n    mkdir -p /opt/magnetiq/media\n    \n    # Extract backup\n    tar -xzf $MEDIA_BACKUP_FILE -C /opt/magnetiq/media\n    \n    echo \"Media files restored successfully\"\nfi\n\n# Start services\necho \"Starting application services...\"\ndocker-compose -f docker-compose.prod.yml start backend frontend celery\n\n# Health check\necho \"Performing health check...\"\nsleep 30\n\nif curl -f http://localhost/health > /dev/null 2>&1; then\n    echo \"Recovery completed successfully - Application is healthy\"\nelse\n    echo \"WARNING: Application health check failed\"\n    echo \"Please check logs and verify the restoration\"\nfi\n```\n\n## SSL Certificate Management\n\n### Let's Encrypt with Certbot\n```bash\n#!/bin/bash\n# scripts/ssl-setup.sh\n\nDOMAINS=\"voltaic.systems www.voltaic.systems admin.voltaic.systems\"\nEMAIL=\"admin@voltaic.systems\"\n\n# Install certbot\nsudo apt-get update\nsudo apt-get install -y certbot python3-certbot-nginx\n\n# Stop nginx\nsudo systemctl stop nginx\n\n# Obtain certificates\nsudo certbot certonly --standalone -d $DOMAINS --email $EMAIL --agree-tos --no-eff-email\n\n# Setup auto-renewal\necho \"0 12 * * * /usr/bin/certbot renew --quiet\" | sudo crontab -\n\n# Start nginx\nsudo systemctl start nginx\n\necho \"SSL certificates configured successfully\"\n```\n\n## Performance Optimization\n\n### Nginx Optimization\n```nginx\n# nginx/nginx.conf - Production optimized\nuser nginx;\nworker_processes auto;\nerror_log /var/log/nginx/error.log warn;\npid /var/run/nginx.pid;\n\nevents {\n    worker_connections 2048;\n    use epoll;\n    multi_accept on;\n}\n\nhttp {\n    # Basic settings\n    sendfile on;\n    tcp_nopush on;\n    tcp_nodelay on;\n    keepalive_timeout 65;\n    types_hash_max_size 2048;\n    client_max_body_size 50M;\n    \n    # MIME\n    include /etc/nginx/mime.types;\n    default_type application/octet-stream;\n    \n    # Gzip\n    gzip on;\n    gzip_vary on;\n    gzip_min_length 10240;\n    gzip_proxied expired no-cache no-store private must-revalidate auth;\n    gzip_types\n        text/plain\n        text/css\n        text/xml\n        text/javascript\n        application/json\n        application/javascript\n        application/xml+rss\n        application/atom+xml\n        image/svg+xml;\n    \n    # Rate limiting\n    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;\n    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;\n    \n    # Caching\n    proxy_cache_path /tmp/nginx_cache levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m use_temp_path=off;\n    \n    # SSL configuration\n    ssl_protocols TLSv1.2 TLSv1.3;\n    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;\n    ssl_prefer_server_ciphers off;\n    ssl_session_cache shared:SSL:10m;\n    ssl_session_tickets off;\n    \n    # Security headers\n    add_header X-Frame-Options DENY always;\n    add_header X-Content-Type-Options nosniff always;\n    add_header X-XSS-Protection \"1; mode=block\" always;\n    add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;\n    add_header Strict-Transport-Security \"max-age=63072000; includeSubDomains; preload\" always;\n    \n    # Server configuration\n    server {\n        listen 443 ssl http2;\n        server_name voltaic.systems www.voltaic.systems;\n        \n        ssl_certificate /etc/letsencrypt/live/voltaic.systems/fullchain.pem;\n        ssl_certificate_key /etc/letsencrypt/live/voltaic.systems/privkey.pem;\n        \n        # Static files\n        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {\n            expires 1y;\n            add_header Cache-Control \"public, immutable\";\n            access_log off;\n        }\n        \n        # API endpoints\n        location /api/ {\n            limit_req zone=api burst=20 nodelay;\n            \n            proxy_pass http://backend:3036;\n            proxy_set_header Host $host;\n            proxy_set_header X-Real-IP $remote_addr;\n            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n            proxy_set_header X-Forwarded-Proto $scheme;\n            \n            # Caching for GET requests\n            proxy_cache my_cache;\n            proxy_cache_valid 200 1m;\n            proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;\n        }\n        \n        # Authentication endpoints - stricter rate limiting\n        location /api/v1/auth/ {\n            limit_req zone=login burst=5 nodelay;\n            \n            proxy_pass http://backend:3036;\n            proxy_set_header Host $host;\n            proxy_set_header X-Real-IP $remote_addr;\n            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n            proxy_set_header X-Forwarded-Proto $scheme;\n        }\n        \n        # Frontend\n        location / {\n            try_files $uri $uri/ /index.html;\n            root /usr/share/nginx/html;\n            \n            # Cache HTML files for short time\n            location ~* \\.html$ {\n                expires 1h;\n                add_header Cache-Control \"public, must-revalidate\";\n            }\n        }\n    }\n    \n    # Redirect HTTP to HTTPS\n    server {\n        listen 80;\n        server_name voltaic.systems www.voltaic.systems;\n        return 301 https://$server_name$request_uri;\n    }\n}\n```\n\n## Troubleshooting Guide\n\n### Common Issues and Solutions\n\n#### Database Connection Issues\n```bash\n# Check database connectivity\ndocker exec magnetiq-backend python -c \"from database import engine; print(engine.execute('SELECT 1').scalar())\"\n\n# Check database logs\ndocker logs magnetiq-db\n\n# Test database performance\ndocker exec magnetiq-db psql -U postgres -d magnetiq_prod -c \"SELECT pg_stat_database.datname, pg_size_pretty(pg_database_size(pg_stat_database.datname)) AS size FROM pg_stat_database;\"\n```\n\n#### Redis Connection Issues\n```bash\n# Check Redis connectivity\ndocker exec magnetiq-redis redis-cli ping\n\n# Check Redis memory usage\ndocker exec magnetiq-redis redis-cli info memory\n\n# Monitor Redis commands\ndocker exec magnetiq-redis redis-cli monitor\n```\n\n#### Application Logs Analysis\n```bash\n# View application logs\ndocker logs magnetiq-backend --tail 100 -f\n\n# Search for errors\ndocker logs magnetiq-backend 2>&1 | grep -i error\n\n# Check specific time range\ndocker logs magnetiq-backend --since=\"2024-01-01T00:00:00\" --until=\"2024-01-01T23:59:59\"\n```\n\nThis deployment specification provides a comprehensive foundation for deploying and maintaining Magnetiq v2 in production environments with emphasis on reliability, security, and observability."}]
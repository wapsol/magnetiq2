# Kubernetes Deployment Guide for Magnetiq v2

## Overview
This document provides a comprehensive guide for deploying Magnetiq v2 to a Kubernetes cluster using Longhorn for persistent storage. All Kubernetes manifests are organized in the `./k8s/` directory.

## Prerequisites

### Required Components
- **Kubernetes Cluster**: Version 1.24 or higher
- **kubectl**: Configured with cluster access
- **Longhorn**: Installed and configured for persistent storage
- **NGINX Ingress Controller**: For traffic routing
- **cert-manager**: For SSL certificate management
- **Container Registry Access**: Access to `crep.re-cloud.io/magnetiq/v2`

### Optional Components
- **Metrics Server**: For HPA functionality
- **Prometheus/Grafana**: For monitoring

## Repository Information

### Container Registry
- **Registry URL**: `https://crep.re-cloud.io`
- **Project**: `magnetiq`
- **Repository**: `magnetiq/v2`
- **Images**:
  - Backend: `crep.re-cloud.io/magnetiq/v2/backend:latest`
  - Frontend: `crep.re-cloud.io/magnetiq/v2/frontend:latest`

## Directory Structure

```
k8s/
├── namespace.yaml              # Namespace definition
├── configmap.yaml             # Application configuration
├── secrets.yaml               # Sensitive credentials
├── storage.yaml               # Longhorn StorageClass
├── backend/
│   ├── deployment.yaml        # Backend deployment
│   ├── service.yaml          # Backend service
│   └── pvc.yaml              # Persistent volume claims
├── frontend/
│   ├── deployment.yaml        # Frontend deployment
│   └── service.yaml          # Frontend service
├── ingress.yaml              # Ingress routing rules
├── hpa.yaml                  # Horizontal Pod Autoscaling
├── network-policy.yaml       # Network security policies
└── rbac.yaml                 # Role-based access control
```

## Configuration Files

### 1. Namespace (`k8s/namespace.yaml`)
Creates an isolated namespace for all Magnetiq v2 resources.

### 2. ConfigMap (`k8s/configmap.yaml`)
Contains non-sensitive application configuration:
- Application settings
- Database connection strings
- SMTP server configuration
- CORS origins

### 3. Secrets (`k8s/secrets.yaml`)
Stores sensitive data:
- JWT secret keys
- SMTP credentials
- Database passwords
- Registry credentials

**Important**: Edit this file before deployment to add your actual credentials.

### 4. Storage (`k8s/storage.yaml`)
Defines Longhorn StorageClass with:
- 3 replicas for data redundancy
- Retain reclaim policy
- Volume expansion support

### 5. Backend Resources
- **Deployment** (`k8s/backend/deployment.yaml`): 2 replicas with health checks
- **Service** (`k8s/backend/service.yaml`): ClusterIP service on port 4036
- **PVC** (`k8s/backend/pvc.yaml`): 5Gi for data, 10Gi for media

### 6. Frontend Resources
- **Deployment** (`k8s/frontend/deployment.yaml`): 3 replicas for high availability
- **Service** (`k8s/frontend/service.yaml`): ClusterIP service on port 9036

### 7. Ingress (`k8s/ingress.yaml`)
Configures routing for:
- `/api/*` → Backend service
- `/docs`, `/redoc` → API documentation
- `/` → Frontend application

### 8. HPA (`k8s/hpa.yaml`)
Auto-scaling configuration:
- Backend: 2-10 replicas (CPU 70%, Memory 80%)
- Frontend: 3-15 replicas (CPU 80%, Memory 85%)

### 9. Network Policies (`k8s/network-policy.yaml`)
Implements network segmentation:
- Frontend can only access backend
- Backend can access external services (SMTP, APIs)
- Both allow DNS resolution

### 10. RBAC (`k8s/rbac.yaml`)
Defines permissions for:
- Service account creation
- Pod and service monitoring
- Configuration access

## Deployment Process

### Step 1: Prepare Configuration

1. **Update Secrets**:
```bash
# Edit secrets file with your actual credentials
vi k8s/secrets.yaml
```

2. **Update ConfigMap** (if needed):
```bash
# Adjust configuration for your environment
vi k8s/configmap.yaml
```

3. **Update Ingress Host**:
```bash
# Set your domain name
vi k8s/ingress.yaml
```

### Step 2: Build and Push Images

```bash
# Build and push backend image
cd backend/
docker build -t crep.re-cloud.io/magnetiq/v2/backend:latest .
docker push crep.re-cloud.io/magnetiq/v2/backend:latest

# Build and push frontend image
cd ../frontend/
docker build -t crep.re-cloud.io/magnetiq/v2/frontend:latest .
docker push crep.re-cloud.io/magnetiq/v2/frontend:latest
```

### Step 3: Deploy to Kubernetes

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create storage class
kubectl apply -f k8s/storage.yaml

# Create configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Create persistent volumes
kubectl apply -f k8s/backend/pvc.yaml

# Deploy backend
kubectl apply -f k8s/backend/deployment.yaml
kubectl apply -f k8s/backend/service.yaml

# Deploy frontend
kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/frontend/service.yaml

# Create ingress
kubectl apply -f k8s/ingress.yaml

# Apply security policies
kubectl apply -f k8s/network-policy.yaml
kubectl apply -f k8s/rbac.yaml

# Enable auto-scaling (optional)
kubectl apply -f k8s/hpa.yaml
```

### Step 4: Verify Deployment

```bash
# Check all resources
kubectl get all -n magnetiq-v2

# Check pod status
kubectl get pods -n magnetiq-v2 -w

# Check persistent volumes
kubectl get pvc -n magnetiq-v2

# Check ingress
kubectl get ingress -n magnetiq-v2

# View logs
kubectl logs -n magnetiq-v2 -l app=magnetiq-backend --tail=50
kubectl logs -n magnetiq-v2 -l app=magnetiq-frontend --tail=50
```

### Step 5: Initialize Database

```bash
# Get backend pod name
BACKEND_POD=$(kubectl get pods -n magnetiq-v2 -l app=magnetiq-backend -o jsonpath='{.items[0].metadata.name}')

# Initialize database (first deployment only)
kubectl exec -n magnetiq-v2 $BACKEND_POD -- python -m app.database.init_db

# Load initial data (optional)
kubectl exec -n magnetiq-v2 $BACKEND_POD -- python -m scripts.load_initial_data
```

## Quick Deployment Script

Create a deployment script `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "Deploying Magnetiq v2 to Kubernetes..."

# Apply all manifests in order
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/storage.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/backend/pvc.yaml
kubectl apply -f k8s/backend/deployment.yaml
kubectl apply -f k8s/backend/service.yaml
kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/frontend/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/network-policy.yaml
kubectl apply -f k8s/rbac.yaml
kubectl apply -f k8s/hpa.yaml

echo "Deployment complete! Checking status..."
kubectl get pods -n magnetiq-v2
```

## Operations

### Scaling

```bash
# Manual scaling
kubectl scale deployment magnetiq-backend -n magnetiq-v2 --replicas=4
kubectl scale deployment magnetiq-frontend -n magnetiq-v2 --replicas=5

# Check HPA status
kubectl get hpa -n magnetiq-v2
```

### Rolling Update

```bash
# Update backend image
kubectl set image deployment/magnetiq-backend \
  backend=crep.re-cloud.io/magnetiq/v2/backend:v2.1.0 \
  -n magnetiq-v2

# Update frontend image
kubectl set image deployment/magnetiq-frontend \
  frontend=crep.re-cloud.io/magnetiq/v2/frontend:v2.1.0 \
  -n magnetiq-v2

# Monitor rollout
kubectl rollout status deployment/magnetiq-backend -n magnetiq-v2
kubectl rollout status deployment/magnetiq-frontend -n magnetiq-v2
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/magnetiq-backend -n magnetiq-v2
kubectl rollout undo deployment/magnetiq-frontend -n magnetiq-v2

# Rollback to specific revision
kubectl rollout undo deployment/magnetiq-backend -n magnetiq-v2 --to-revision=2
```

### Database Backup

```bash
# Create backup
BACKEND_POD=$(kubectl get pods -n magnetiq-v2 -l app=magnetiq-backend -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n magnetiq-v2 $BACKEND_POD -- \
  sqlite3 /app/data/magnetiq.db ".backup /app/data/backup-$(date +%Y%m%d-%H%M%S).db"

# Copy backup locally
kubectl cp magnetiq-v2/$BACKEND_POD:/app/data/backup-*.db ./backups/
```

### Database Restore

```bash
# Copy backup to pod
kubectl cp ./backup.db magnetiq-v2/$BACKEND_POD:/app/data/restore.db

# Restore database
kubectl exec -n magnetiq-v2 $BACKEND_POD -- \
  sqlite3 /app/data/magnetiq.db ".restore /app/data/restore.db"
```

## Monitoring

### Health Checks

```bash
# Check backend health
kubectl exec -n magnetiq-v2 -it deploy/magnetiq-backend -- \
  curl -s http://localhost:4036/health | jq .

# Check frontend health
kubectl exec -n magnetiq-v2 -it deploy/magnetiq-frontend -- \
  curl -s http://localhost:9036/
```

### Resource Usage

```bash
# View resource usage
kubectl top pods -n magnetiq-v2
kubectl top nodes

# Detailed pod metrics
kubectl describe pod -n magnetiq-v2 <pod-name>
```

### Logs

```bash
# Stream backend logs
kubectl logs -n magnetiq-v2 -l app=magnetiq-backend -f

# Stream frontend logs
kubectl logs -n magnetiq-v2 -l app=magnetiq-frontend -f

# Get logs from specific pod
kubectl logs -n magnetiq-v2 <pod-name> --tail=100
```

## Troubleshooting

### Common Issues

#### 1. Pods Not Starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n magnetiq-v2

# Check previous logs
kubectl logs <pod-name> -n magnetiq-v2 --previous
```

#### 2. Image Pull Errors

```bash
# Check if secret exists
kubectl get secrets -n magnetiq-v2

# Verify registry access
docker pull crep.re-cloud.io/magnetiq/v2/backend:latest
```

#### 3. PVC Issues

```bash
# Check PVC status
kubectl get pvc -n magnetiq-v2
kubectl describe pvc magnetiq-data-pvc -n magnetiq-v2

# Check Longhorn volumes
kubectl get volumes.longhorn.io -n longhorn-system
```

#### 4. Ingress Issues

```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress configuration
kubectl describe ingress magnetiq-ingress -n magnetiq-v2

# Test internal service
kubectl run test-pod --image=busybox -it --rm -n magnetiq-v2 -- \
  wget -O- http://magnetiq-backend:4036/health
```

#### 5. Database Connection Issues

```bash
# Check database file
kubectl exec -n magnetiq-v2 deploy/magnetiq-backend -- ls -la /app/data/

# Test database connection
kubectl exec -n magnetiq-v2 deploy/magnetiq-backend -- \
  python -c "from app.database.session import engine; print(engine.url)"
```

### Debug Access

```bash
# Get shell access to backend
kubectl exec -n magnetiq-v2 -it deploy/magnetiq-backend -- /bin/bash

# Get shell access to frontend
kubectl exec -n magnetiq-v2 -it deploy/magnetiq-frontend -- /bin/sh

# Port forwarding for local access
kubectl port-forward -n magnetiq-v2 svc/magnetiq-backend 4036:4036
kubectl port-forward -n magnetiq-v2 svc/magnetiq-frontend 9036:9036
```

## Security Best Practices

### 1. Secrets Management
- Use external secret management (Vault, Sealed Secrets)
- Rotate credentials regularly
- Never commit secrets to version control

### 2. Network Security
- Apply network policies to restrict traffic
- Use TLS for all external communication
- Implement pod security policies

### 3. Image Security
- Scan images for vulnerabilities
- Use specific image tags (not :latest in production)
- Sign images with cosign

### 4. RBAC
- Follow principle of least privilege
- Use service accounts for pods
- Audit RBAC permissions regularly

## Performance Optimization

### 1. Resource Tuning
```yaml
# Adjust in deployment files based on monitoring
resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### 2. Database Optimization
- Consider PostgreSQL for production
- Implement connection pooling
- Regular VACUUM for SQLite

### 3. Caching
- Add Redis for session storage
- Implement CDN for static assets
- Use browser caching headers

### 4. Scaling Strategy
- Use HPA for automatic scaling
- Implement pod disruption budgets
- Configure anti-affinity rules

## Migration from Docker Compose

### 1. Export Data
```bash
# From Docker Compose
docker-compose exec backend sqlite3 /app/data/magnetiq.db ".backup /tmp/backup.db"
docker cp magnetiq_backend_1:/tmp/backup.db ./backup.db
```

### 2. Import to Kubernetes
```bash
# Copy to Kubernetes pod
kubectl cp ./backup.db magnetiq-v2/$BACKEND_POD:/app/data/import.db

# Restore database
kubectl exec -n magnetiq-v2 $BACKEND_POD -- \
  sqlite3 /app/data/magnetiq.db ".restore /app/data/import.db"
```

## Cleanup

To remove all resources:

```bash
# Delete all resources
kubectl delete -f k8s/ -R

# Or delete namespace (removes everything)
kubectl delete namespace magnetiq-v2

# Clean up PVs (if using Retain policy)
kubectl delete pv -l app=magnetiq
```

## Support and Documentation

- **Kubernetes Documentation**: https://kubernetes.io/docs/
- **Longhorn Documentation**: https://longhorn.io/docs/
- **NGINX Ingress**: https://kubernetes.github.io/ingress-nginx/
- **cert-manager**: https://cert-manager.io/docs/

## Conclusion

This deployment guide provides a production-ready Kubernetes configuration for Magnetiq v2 with:
- High availability through multiple replicas
- Persistent storage with Longhorn
- Automatic SSL certificates via cert-manager
- Horizontal auto-scaling for load management
- Network policies for security
- RBAC for access control
- Comprehensive monitoring and troubleshooting procedures

For additional support or customization requirements, please consult with the DevOps team.
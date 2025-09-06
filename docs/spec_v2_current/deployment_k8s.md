# Kubernetes Deployment Specification for Magnetiq v2

## Overview
This document provides the complete Kubernetes deployment configuration for Magnetiq v2, designed for production deployment with Longhorn persistent storage using standard kubectl commands.

## Architecture Overview

### Deployment Strategy
- **Orchestration**: Kubernetes v1.24+
- **Storage**: Longhorn distributed storage for persistence
- **Networking**: Ingress controller with SSL termination
- **Scaling**: Horizontal Pod Autoscaling (HPA) enabled
- **Monitoring**: Prometheus metrics and health endpoints

### Component Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                        Ingress Controller                     │
│                     (SSL Termination/Routing)                 │
└─────────────┬──────────────────────────┬────────────────────┘
              │                          │
              v                          v
┌──────────────────────┐    ┌──────────────────────┐
│   Frontend Service   │    │   Backend Service    │
│    (Port: 9036)      │───>│    (Port: 4036)      │
│   React Application  │    │   FastAPI Server     │
└──────────────────────┘    └──────────────────────┘
                                        │
                                        v
                            ┌──────────────────────┐
                            │  Persistent Volume   │
                            │   (Longhorn PVC)     │
                            │  - SQLite Database   │
                            │  - Media Files       │
                            └──────────────────────┘
```

## Kubernetes Manifests

### Directory Structure
```
k8s/
├── namespace.yaml              # Dedicated namespace isolation
├── configmap.yaml             # Non-sensitive configuration
├── secrets.yaml               # Sensitive configuration
├── backend/
│   ├── deployment.yaml        # Backend FastAPI deployment
│   ├── service.yaml          # Backend service definition
│   └── pvc.yaml              # Persistent Volume Claims
├── frontend/
│   ├── deployment.yaml        # Frontend React deployment
│   └── service.yaml          # Frontend service definition
├── storage.yaml               # Longhorn StorageClass
└── ingress.yaml              # Traffic routing and SSL
```

### 1. Namespace Configuration

**File: `k8s/namespace.yaml`**
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: magnetiq-v2
  labels:
    app: magnetiq-v2
    environment: production
```

### 2. ConfigMap Configuration

**File: `k8s/configmap.yaml`**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: magnetiq-config
  namespace: magnetiq-v2
data:
  # Application Configuration
  APP_NAME: "Magnetiq v2"
  VERSION: "2.0.0"
  ENVIRONMENT: "production"
  DEBUG: "false"
  
  # Server Configuration
  HOST: "0.0.0.0"
  BACKEND_PORT: "4036"
  FRONTEND_PORT: "9036"
  
  # Database Configuration
  DATABASE_URL: "sqlite+aiosqlite:///app/data/magnetiq.db"
  
  # CORS Configuration
  ALLOWED_ORIGINS: '["https://magnetiq.voltaic.systems"]'
  
  # SMTP Configuration (non-sensitive)
  SMTP_HOST: "smtp-relay.brevo.com"
  SMTP_PORT: "587"
  SMTP_FROM_EMAIL: "noreply@voltaic.systems"
  SMTP_FROM_NAME: "voltAIc Systems"
  SMTP_USE_TLS: "false"
  SMTP_USE_STARTTLS: "true"
  
  # Business Email Configuration
  BUSINESS_EMAIL_CRM: "hello@voltaic.systems"
  BUSINESS_EMAIL_SUPPORT: "support@voltaic.systems"
```

### 3. Secrets Configuration

**File: `k8s/secrets.yaml`**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: magnetiq-secrets
  namespace: magnetiq-v2
type: Opaque
stringData:
  # Security Keys
  SECRET_KEY: "your-production-secret-key-change-this"
  ALGORITHM: "HS256"
  
  # Token Expiration
  ACCESS_TOKEN_EXPIRE_MINUTES: "15"
  REFRESH_TOKEN_EXPIRE_DAYS: "7"
  
  # SMTP Credentials
  SMTP_USERNAME: "sysadmin@euroblaze.de"
  SMTP_PASSWORD: "your-smtp-password"
  
  # Database Password (if using PostgreSQL in future)
  DATABASE_PASSWORD: ""
```

### 4. Longhorn StorageClass

**File: `k8s/storage.yaml`**
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: longhorn-retain
provisioner: driver.longhorn.io
allowVolumeExpansion: true
reclaimPolicy: Retain
volumeBindingMode: Immediate
parameters:
  numberOfReplicas: "3"
  staleReplicaTimeout: "2880"
  fromBackup: ""
  fsType: "ext4"
```

### 5. Backend Deployment

**File: `k8s/backend/deployment.yaml`**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: magnetiq-backend
  namespace: magnetiq-v2
  labels:
    app: magnetiq-backend
    component: backend
spec:
  replicas: 2
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: magnetiq-backend
  template:
    metadata:
      labels:
        app: magnetiq-backend
        component: backend
    spec:
      containers:
      - name: backend
        image: registry.voltaic.systems/magnetiq-backend:v2.0.0
        imagePullPolicy: Always
        ports:
        - containerPort: 4036
          name: http
        envFrom:
        - configMapRef:
            name: magnetiq-config
        - secretRef:
            name: magnetiq-secrets
        volumeMounts:
        - name: data-volume
          mountPath: /app/data
        - name: media-volume
          mountPath: /app/media
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4036
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 4036
          initialDelaySeconds: 10
          periodSeconds: 10
      volumes:
      - name: data-volume
        persistentVolumeClaim:
          claimName: magnetiq-data-pvc
      - name: media-volume
        persistentVolumeClaim:
          claimName: magnetiq-media-pvc
```

**File: `k8s/backend/service.yaml`**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: magnetiq-backend
  namespace: magnetiq-v2
  labels:
    app: magnetiq-backend
spec:
  type: ClusterIP
  ports:
  - port: 4036
    targetPort: 4036
    protocol: TCP
    name: http
  selector:
    app: magnetiq-backend
```

**File: `k8s/backend/pvc.yaml`**
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: magnetiq-data-pvc
  namespace: magnetiq-v2
spec:
  accessModes:
  - ReadWriteOnce
  storageClassName: longhorn-retain
  resources:
    requests:
      storage: 5Gi
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: magnetiq-media-pvc
  namespace: magnetiq-v2
spec:
  accessModes:
  - ReadWriteMany
  storageClassName: longhorn-retain
  resources:
    requests:
      storage: 10Gi
```

### 6. Frontend Deployment

**File: `k8s/frontend/deployment.yaml`**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: magnetiq-frontend
  namespace: magnetiq-v2
  labels:
    app: magnetiq-frontend
    component: frontend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: magnetiq-frontend
  template:
    metadata:
      labels:
        app: magnetiq-frontend
        component: frontend
    spec:
      containers:
      - name: frontend
        image: registry.voltaic.systems/magnetiq-frontend:v2.0.0
        imagePullPolicy: Always
        ports:
        - containerPort: 9036
          name: http
        env:
        - name: VITE_API_URL
          value: "https://magnetiq.voltaic.systems/api"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 9036
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /
            port: 9036
          initialDelaySeconds: 10
          periodSeconds: 10
```

**File: `k8s/frontend/service.yaml`**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: magnetiq-frontend
  namespace: magnetiq-v2
  labels:
    app: magnetiq-frontend
spec:
  type: ClusterIP
  ports:
  - port: 9036
    targetPort: 9036
    protocol: TCP
    name: http
  selector:
    app: magnetiq-frontend
```

### 7. Ingress Configuration

**File: `k8s/ingress.yaml`**
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: magnetiq-ingress
  namespace: magnetiq-v2
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - magnetiq.voltaic.systems
    secretName: magnetiq-tls
  rules:
  - host: magnetiq.voltaic.systems
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: magnetiq-backend
            port:
              number: 4036
      - path: /docs
        pathType: Prefix
        backend:
          service:
            name: magnetiq-backend
            port:
              number: 4036
      - path: /redoc
        pathType: Prefix
        backend:
          service:
            name: magnetiq-backend
            port:
              number: 4036
      - path: /openapi.json
        pathType: Exact
        backend:
          service:
            name: magnetiq-backend
            port:
              number: 4036
      - path: /
        pathType: Prefix
        backend:
          service:
            name: magnetiq-frontend
            port:
              number: 9036
```

### 8. Horizontal Pod Autoscaling (Optional)

**File: `k8s/hpa.yaml`**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: magnetiq-backend-hpa
  namespace: magnetiq-v2
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: magnetiq-backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: magnetiq-frontend-hpa
  namespace: magnetiq-v2
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: magnetiq-frontend
  minReplicas: 3
  maxReplicas: 15
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 80
```

## Deployment Process

### Prerequisites
1. **Kubernetes Cluster**: Ensure you have access to a Kubernetes cluster (v1.24+)
2. **kubectl**: Install and configure kubectl CLI tool
3. **Longhorn**: Ensure Longhorn is installed and configured in your cluster
4. **Container Registry**: Access to registry.voltaic.systems or your container registry
5. **SSL Certificate**: cert-manager installed for automatic SSL certificates

### Step 1: Build and Push Docker Images

```bash
# Build Backend Image
cd backend/
docker build -t registry.voltaic.systems/magnetiq-backend:v2.0.0 .
docker push registry.voltaic.systems/magnetiq-backend:v2.0.0

# Build Frontend Image
cd ../frontend/
docker build -t registry.voltaic.systems/magnetiq-frontend:v2.0.0 .
docker push registry.voltaic.systems/magnetiq-frontend:v2.0.0
```

### Step 2: Create Kubernetes Resources

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create storage class (if not exists)
kubectl apply -f k8s/storage.yaml

# Create ConfigMap and Secrets
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Create Persistent Volume Claims
kubectl apply -f k8s/backend/pvc.yaml

# Deploy Backend
kubectl apply -f k8s/backend/deployment.yaml
kubectl apply -f k8s/backend/service.yaml

# Deploy Frontend
kubectl apply -f k8s/frontend/deployment.yaml
kubectl apply -f k8s/frontend/service.yaml

# Create Ingress
kubectl apply -f k8s/ingress.yaml

# Optional: Create HPA
kubectl apply -f k8s/hpa.yaml
```

### Step 3: Verify Deployment

```bash
# Check namespace resources
kubectl get all -n magnetiq-v2

# Check pod status
kubectl get pods -n magnetiq-v2

# Check services
kubectl get svc -n magnetiq-v2

# Check ingress
kubectl get ingress -n magnetiq-v2

# Check PVCs
kubectl get pvc -n magnetiq-v2

# View logs
kubectl logs -n magnetiq-v2 -l app=magnetiq-backend
kubectl logs -n magnetiq-v2 -l app=magnetiq-frontend
```

### Step 4: Database Migration (First Deployment)

```bash
# Get backend pod name
BACKEND_POD=$(kubectl get pods -n magnetiq-v2 -l app=magnetiq-backend -o jsonpath='{.items[0].metadata.name}')

# Initialize database
kubectl exec -n magnetiq-v2 $BACKEND_POD -- python -m app.database.init_db

# Load initial data (if needed)
kubectl exec -n magnetiq-v2 $BACKEND_POD -- python -m scripts.load_initial_data
```

## Monitoring and Maintenance

### Health Checks
```bash
# Check backend health
kubectl exec -n magnetiq-v2 -it deploy/magnetiq-backend -- curl http://localhost:4036/health

# Check frontend health
kubectl exec -n magnetiq-v2 -it deploy/magnetiq-frontend -- curl http://localhost:9036/
```

### Scaling Applications
```bash
# Manual scaling
kubectl scale deployment magnetiq-backend -n magnetiq-v2 --replicas=4
kubectl scale deployment magnetiq-frontend -n magnetiq-v2 --replicas=5

# Check HPA status
kubectl get hpa -n magnetiq-v2
```

### Update Deployment
```bash
# Update backend image
kubectl set image deployment/magnetiq-backend backend=registry.voltaic.systems/magnetiq-backend:v2.1.0 -n magnetiq-v2

# Update frontend image
kubectl set image deployment/magnetiq-frontend frontend=registry.voltaic.systems/magnetiq-frontend:v2.1.0 -n magnetiq-v2

# Watch rollout status
kubectl rollout status deployment/magnetiq-backend -n magnetiq-v2
kubectl rollout status deployment/magnetiq-frontend -n magnetiq-v2
```

### Backup and Restore

#### Backup Database
```bash
# Create backup
BACKEND_POD=$(kubectl get pods -n magnetiq-v2 -l app=magnetiq-backend -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n magnetiq-v2 $BACKEND_POD -- sqlite3 /app/data/magnetiq.db ".backup /app/data/backup-$(date +%Y%m%d).db"

# Copy backup locally
kubectl cp magnetiq-v2/$BACKEND_POD:/app/data/backup-$(date +%Y%m%d).db ./backup-$(date +%Y%m%d).db
```

#### Restore Database
```bash
# Copy backup to pod
kubectl cp ./backup.db magnetiq-v2/$BACKEND_POD:/app/data/restore.db

# Restore database
kubectl exec -n magnetiq-v2 $BACKEND_POD -- sqlite3 /app/data/magnetiq.db ".restore /app/data/restore.db"
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Pods Not Starting
```bash
# Check pod events
kubectl describe pod <pod-name> -n magnetiq-v2

# Check logs
kubectl logs <pod-name> -n magnetiq-v2 --previous
```

#### 2. Database Connection Issues
```bash
# Check PVC status
kubectl get pvc -n magnetiq-v2

# Check mount points
kubectl exec -n magnetiq-v2 <pod-name> -- ls -la /app/data
```

#### 3. Ingress Not Working
```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress rules
kubectl describe ingress magnetiq-ingress -n magnetiq-v2
```

#### 4. Service Discovery Issues
```bash
# Test service connectivity
kubectl run test-pod --image=busybox -it --rm -n magnetiq-v2 -- /bin/sh
# Inside pod:
wget -O- http://magnetiq-backend:4036/health
wget -O- http://magnetiq-frontend:9036/
```

### Debug Commands
```bash
# Get shell access to backend
kubectl exec -n magnetiq-v2 -it deploy/magnetiq-backend -- /bin/bash

# Get shell access to frontend
kubectl exec -n magnetiq-v2 -it deploy/magnetiq-frontend -- /bin/sh

# Port forward for local debugging
kubectl port-forward -n magnetiq-v2 svc/magnetiq-backend 4036:4036
kubectl port-forward -n magnetiq-v2 svc/magnetiq-frontend 9036:9036
```

## Security Considerations

### Network Policies
```yaml
# File: k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: magnetiq-network-policy
  namespace: magnetiq-v2
spec:
  podSelector:
    matchLabels:
      app: magnetiq-backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: magnetiq-frontend
    - podSelector:
        matchLabels:
          app: magnetiq-ingress
    ports:
    - protocol: TCP
      port: 4036
```

### RBAC Configuration
```yaml
# File: k8s/rbac.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: magnetiq-v2
  name: magnetiq-role
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: magnetiq-rolebinding
  namespace: magnetiq-v2
subjects:
- kind: ServiceAccount
  name: magnetiq-sa
  namespace: magnetiq-v2
roleRef:
  kind: Role
  name: magnetiq-role
  apiGroup: rbac.authorization.k8s.io
```

## Performance Optimization

### Resource Optimization
- Monitor resource usage with `kubectl top pods -n magnetiq-v2`
- Adjust resource requests/limits based on actual usage
- Use HPA for automatic scaling during peak loads

### Database Optimization
- Consider migrating to PostgreSQL for better performance
- Implement database connection pooling
- Regular VACUUM operations for SQLite

### Caching Strategy
- Implement Redis for session storage
- Use CDN for static assets
- Enable browser caching headers

## Migration from Docker Compose

### Data Migration Steps
1. Export data from Docker volumes
2. Create PVCs in Kubernetes
3. Import data to Longhorn volumes
4. Verify data integrity

### Configuration Migration
1. Convert environment variables to ConfigMaps/Secrets
2. Update connection strings and URLs
3. Test connectivity between services

## Rollback Procedures

### Quick Rollback
```bash
# Rollback to previous version
kubectl rollout undo deployment/magnetiq-backend -n magnetiq-v2
kubectl rollout undo deployment/magnetiq-frontend -n magnetiq-v2

# Check rollback status
kubectl rollout status deployment/magnetiq-backend -n magnetiq-v2
kubectl rollout status deployment/magnetiq-frontend -n magnetiq-v2
```

### Full Rollback
```bash
# Apply previous configuration
kubectl apply -f k8s-backup/

# Restore database from backup
kubectl cp ./backup.db magnetiq-v2/$BACKEND_POD:/app/data/restore.db
kubectl exec -n magnetiq-v2 $BACKEND_POD -- sqlite3 /app/data/magnetiq.db ".restore /app/data/restore.db"
```

## Conclusion

This Kubernetes deployment configuration provides a production-ready setup for Magnetiq v2 with:
- High availability through multiple replicas
- Persistent storage with Longhorn
- Automatic SSL certificates
- Horizontal auto-scaling
- Health monitoring and probes
- Rolling updates with zero downtime

For additional support or customization, refer to the Kubernetes documentation or contact the DevOps team.
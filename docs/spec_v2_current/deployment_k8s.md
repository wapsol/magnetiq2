# Kubernetes Deployment Specification for Magnetiq v2

## Overview
This document provides the complete Kubernetes deployment configuration for Magnetiq v2, designed for production deployment using ArgoCD GitOps workflows with Longhorn persistent storage.

## Architecture Overview

### Deployment Strategy
- **Orchestration**: Kubernetes v1.24+ with ArgoCD GitOps
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
├── ingress.yaml              # Traffic routing and SSL
└── argocd-application.yaml    # ArgoCD Application definition
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
    managed-by: argocd
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
  
  # Business Configuration
  BUSINESS_EMAIL_CRM: "hello@voltaic.systems"
  BUSINESS_EMAIL_SUPPORT: "support@voltaic.systems"
  
  # Frontend Configuration
  VITE_API_URL: "https://magnetiq.voltaic.systems/api"
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
  # Security
  SECRET_KEY: "production-secret-key-change-this-to-secure-value"
  ALGORITHM: "HS256"
  ACCESS_TOKEN_EXPIRE_MINUTES: "15"
  REFRESH_TOKEN_EXPIRE_DAYS: "7"
  
  # SMTP Credentials
  SMTP_USERNAME: "your-smtp-username"
  SMTP_PASSWORD: "your-smtp-password"
  
  # OAuth (if needed)
  LINKEDIN_CLIENT_ID: ""
  LINKEDIN_CLIENT_SECRET: ""
  
  # API Keys
  OPENAI_API_KEY: ""
  SCOOPP_API_KEY: ""
```

### 4. Longhorn Storage Configuration

**File: `k8s/storage.yaml`**
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: longhorn-ssd
  namespace: magnetiq-v2
provisioner: driver.longhorn.io
allowVolumeExpansion: true
reclaimPolicy: Retain
volumeBindingMode: Immediate
parameters:
  numberOfReplicas: "3"
  staleReplicaTimeout: "2880" # 48 hours in minutes
  fromBackup: ""
  diskSelector: "ssd"
  nodeSelector: ""
  recurringJobSelector: '[{"name":"backup-daily","isGroup":true}]'
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
        env:
        - name: PORT
          value: "4036"
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
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 4036
          initialDelaySeconds: 30
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /health
            port: 4036
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
      volumes:
      - name: data-volume
        persistentVolumeClaim:
          claimName: magnetiq-data-pvc
      - name: media-volume
        persistentVolumeClaim:
          claimName: magnetiq-media-pvc
      imagePullSecrets:
      - name: registry-credentials
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
  storageClassName: longhorn-ssd
  resources:
    requests:
      storage: 10Gi
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: magnetiq-media-pvc
  namespace: magnetiq-v2
spec:
  accessModes:
    - ReadWriteMany
  storageClassName: longhorn-ssd
  resources:
    requests:
      storage: 20Gi
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
        - name: PORT
          value: "9036"
        - name: VITE_API_URL
          valueFrom:
            configMapKeyRef:
              name: magnetiq-config
              key: VITE_API_URL
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 9036
          initialDelaySeconds: 15
          periodSeconds: 20
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /
            port: 9036
          initialDelaySeconds: 5
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3
      imagePullSecrets:
      - name: registry-credentials
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
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/proxy-connect-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "600"
spec:
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
      - path: /health
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

### 8. ArgoCD Application

**File: `k8s/argocd-application.yaml`**
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: magnetiq-v2
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/voltaic-systems/magnetiq2
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: magnetiq-v2
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
    - CreateNamespace=true
    - PrunePropagationPolicy=foreground
    - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
  revisionHistoryLimit: 10
```

## Deployment Process

### Prerequisites
1. **Kubernetes Cluster**: v1.24+ with minimum 3 nodes
2. **Longhorn**: Installed and configured with SSD storage class
3. **ArgoCD**: Installed in `argocd` namespace
4. **cert-manager**: Configured with Let's Encrypt issuer
5. **Container Registry**: Access to `registry.voltaic.systems`

### Step 1: Build and Push Docker Images
```bash
# Build production images
docker build --target production -t registry.voltaic.systems/magnetiq-backend:v2.0.0 ./backend
docker build --target production -t registry.voltaic.systems/magnetiq-frontend:v2.0.0 ./frontend

# Push to registry
docker push registry.voltaic.systems/magnetiq-backend:v2.0.0
docker push registry.voltaic.systems/magnetiq-frontend:v2.0.0
```

### Step 2: Create Registry Secret
```bash
kubectl create secret docker-registry registry-credentials \
  --docker-server=registry.voltaic.systems \
  --docker-username=<username> \
  --docker-password=<password> \
  --docker-email=<email> \
  -n magnetiq-v2
```

### Step 3: Apply Kubernetes Manifests
```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Apply storage configuration
kubectl apply -f k8s/storage.yaml

# Apply configurations
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Deploy backend
kubectl apply -f k8s/backend/

# Deploy frontend
kubectl apply -f k8s/frontend/

# Configure ingress
kubectl apply -f k8s/ingress.yaml
```

### Step 4: Deploy with ArgoCD
```bash
# Apply ArgoCD application
kubectl apply -f k8s/argocd-application.yaml

# Sync application
argocd app sync magnetiq-v2

# Check application status
argocd app get magnetiq-v2
```

### Step 5: Database Migration
```bash
# Export local database
sqlite3 /path/to/local/magnetiq.db .dump > magnetiq_dump.sql

# Copy to Kubernetes pod
kubectl cp magnetiq_dump.sql magnetiq-v2/magnetiq-backend-xxxxx:/tmp/

# Import into production database
kubectl exec -it magnetiq-backend-xxxxx -n magnetiq-v2 -- \
  sqlite3 /app/data/magnetiq.db < /tmp/magnetiq_dump.sql
```

## Monitoring and Operations

### Health Checks
```bash
# Check backend health
curl https://magnetiq.voltaic.systems/health

# Check frontend status
curl https://magnetiq.voltaic.systems/

# Check pod status
kubectl get pods -n magnetiq-v2

# View logs
kubectl logs -f deployment/magnetiq-backend -n magnetiq-v2
kubectl logs -f deployment/magnetiq-frontend -n magnetiq-v2
```

### Scaling Operations
```bash
# Manual scaling
kubectl scale deployment magnetiq-backend --replicas=3 -n magnetiq-v2
kubectl scale deployment magnetiq-frontend --replicas=5 -n magnetiq-v2

# Horizontal Pod Autoscaler
kubectl autoscale deployment magnetiq-backend \
  --min=2 --max=10 --cpu-percent=80 -n magnetiq-v2
```

### Backup Operations
```bash
# Create Longhorn backup
kubectl annotate pvc magnetiq-data-pvc \
  longhorn.io/requested-backup-target=s3://backup-bucket/magnetiq -n magnetiq-v2

# Manual database backup
kubectl exec magnetiq-backend-xxxxx -n magnetiq-v2 -- \
  sqlite3 /app/data/magnetiq.db ".backup /tmp/backup.db"
kubectl cp magnetiq-v2/magnetiq-backend-xxxxx:/tmp/backup.db ./backup.db
```

## Security Considerations

### Network Policies
```yaml
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
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: magnetiq-frontend
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 4036
  egress:
  - to:
    - podSelector: {}
    ports:
    - protocol: TCP
      port: 53 # DNS
    - protocol: UDP
      port: 53 # DNS
  - to:
    - namespaceSelector: {}
    ports:
    - protocol: TCP
      port: 443 # HTTPS
    - protocol: TCP
      port: 587 # SMTP
```

### RBAC Configuration
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: magnetiq-v2
  name: magnetiq-operator
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps", "secrets"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "watch", "create", "update", "patch", "delete"]
```

## Troubleshooting

### Common Issues

#### 1. Database Lock Issues
```bash
# Check for lock files
kubectl exec magnetiq-backend-xxxxx -n magnetiq-v2 -- ls -la /app/data/

# Remove stale locks if needed
kubectl exec magnetiq-backend-xxxxx -n magnetiq-v2 -- rm /app/data/magnetiq.db-wal
kubectl exec magnetiq-backend-xxxxx -n magnetiq-v2 -- rm /app/data/magnetiq.db-shm
```

#### 2. Pod Crash Loop
```bash
# Check events
kubectl describe pod magnetiq-backend-xxxxx -n magnetiq-v2

# Check logs
kubectl logs magnetiq-backend-xxxxx -n magnetiq-v2 --previous

# Check resource limits
kubectl top pod -n magnetiq-v2
```

#### 3. Ingress Issues
```bash
# Check ingress status
kubectl describe ingress magnetiq-ingress -n magnetiq-v2

# Check certificate status
kubectl get certificate -n magnetiq-v2

# Test internal connectivity
kubectl run test-pod --image=busybox -it --rm -- wget -O- http://magnetiq-backend:4036/health
```

## Performance Optimization

### Resource Tuning
- **Backend**: Minimum 2 replicas with 512Mi memory
- **Frontend**: Minimum 3 replicas with 256Mi memory
- **Database**: Use WAL mode for better concurrency
- **Longhorn**: 3 replicas for data durability

### Caching Strategy
- **Frontend**: Browser caching for static assets
- **Backend**: Redis integration for session management (optional)
- **CDN**: CloudFlare or similar for global distribution

### Database Optimization
```sql
-- Enable WAL mode
PRAGMA journal_mode=WAL;

-- Optimize for concurrent reads
PRAGMA read_uncommitted=1;

-- Regular maintenance
PRAGMA optimize;
PRAGMA vacuum;
```

## Migration from Docker Compose

### Data Migration Checklist
- [ ] Export SQLite database
- [ ] Backup media files
- [ ] Document environment variables
- [ ] Update DNS records
- [ ] Configure SSL certificates
- [ ] Test application endpoints
- [ ] Verify data integrity
- [ ] Update monitoring alerts

### Rollback Plan
1. Keep Docker Compose configuration intact
2. Maintain database backups before migration
3. Document all configuration changes
4. Test rollback procedure in staging
5. Have emergency contacts ready

## Maintenance

### Regular Tasks
- **Daily**: Check health endpoints and logs
- **Weekly**: Review resource utilization
- **Monthly**: Update container images
- **Quarterly**: Security audit and updates

### Upgrade Process
1. Build new container images
2. Update image tags in deployments
3. Apply changes via ArgoCD
4. Monitor rollout status
5. Run smoke tests
6. Rollback if issues detected

## Conclusion

This Kubernetes deployment configuration provides:
- **High Availability**: Multiple replicas with health checks
- **Persistent Storage**: Longhorn-backed SQLite database
- **Security**: Network policies, RBAC, and secrets management
- **Observability**: Health endpoints and monitoring integration
- **Scalability**: HPA and resource optimization
- **GitOps**: ArgoCD-managed deployments

The configuration maintains compatibility with your existing Docker setup while providing enterprise-grade deployment capabilities suitable for production use with Kubernetes and ArgoCD.
# Kubernetes (k0s) Deployment Spec - Magnetiq v2

## Overview
Production-grade Kubernetes deployment for Magnetiq v2 using k0s distribution with Longhorn persistent storage and kubectl-based deployment management.

## Prerequisites

### Required Components
- **k0s Cluster**: Version 1.24+ or standard Kubernetes
- **kubectl**: Configured with cluster access
- **Longhorn**: Installed for persistent storage
- **NGINX Ingress Controller**: For traffic routing
- **cert-manager**: For SSL certificate management
- **Container Registry**: Access to `crepo.re-cloud.io/magnetiq/v2`

### Container Registry
- **Registry URL**: `https://crepo.re-cloud.io`
- **Project**: `magnetiq`
- **Repository**: `magnetiq/v2`
- **Images**:
  - Backend: `crepo.re-cloud.io/magnetiq/v2/backend:latest`
  - Frontend: `crepo.re-cloud.io/magnetiq/v2/frontend:latest`

## Architecture

### k0s Cluster Setup
```bash
# Install k0s controller
curl -sSLf https://get.k0s.sh | sudo sh
sudo k0s install controller --single

# Start k0s
sudo k0s start

# Generate kubeconfig
sudo k0s kubeconfig admin > ~/.kube/config
```

### Directory Structure
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
├── network_policy.yaml       # Network security policies
└── rbac.yaml                 # Role-based access control
```

## Kubernetes Manifests

### 1. Namespace (`k8s/namespace.yaml`)
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: magnetiq-v2
  labels:
    app: magnetiq
    version: v2
```

### 2. ConfigMap (`k8s/configmap.yaml`)
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: magnetiq-config
  namespace: magnetiq-v2
data:
  DATABASE_URL: "sqlite:///app/data/magnetiq.db"
  CORS_ORIGINS: "https://yourdomain.com"
  SMTP_SERVER: "smtp-relay.brevo.com"
  FRONTEND_URL: "https://yourdomain.com"
```

### 3. Secrets (`k8s/secrets.yaml`)
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: magnetiq-secrets
  namespace: magnetiq-v2
type: Opaque
data:
  JWT_SECRET: <base64-encoded-secret>
  SMTP_USERNAME: <base64-encoded-sysadmin@euroblaze.de>
  SMTP_PASSWORD: <base64-encoded-password>
  ADMIN_PASSWORD: <base64-encoded-password>
```

### 4. Storage (`k8s/storage.yaml`)
```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: longhorn-magnetiq
provisioner: driver.longhorn.io
allowVolumeExpansion: true
parameters:
  numberOfReplicas: "3"
  staleReplicaTimeout: "2880"
  fromBackup: ""
  diskSelector: ""
  nodeSelector: ""
reclaimPolicy: Retain
```

### 5. Backend Deployment (`k8s/backend/deployment.yaml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: magnetiq-backend
  namespace: magnetiq-v2
spec:
  replicas: 2
  selector:
    matchLabels:
      app: magnetiq-backend
  template:
    metadata:
      labels:
        app: magnetiq-backend
    spec:
      containers:
      - name: backend
        image: crepo.re-cloud.io/magnetiq/v2/backend:latest
        ports:
        - containerPort: 4036
        env:
        - name: DATABASE_URL
          valueFrom:
            configMapKeyRef:
              name: magnetiq-config
              key: DATABASE_URL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: magnetiq-secrets
              key: JWT_SECRET
        volumeMounts:
        - name: data-volume
          mountPath: /app/data
        - name: media-volume
          mountPath: /app/media
        livenessProbe:
          httpGet:
            path: /health
            port: 4036
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 4036
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: data-volume
        persistentVolumeClaim:
          claimName: magnetiq-data-pvc
      - name: media-volume
        persistentVolumeClaim:
          claimName: magnetiq-media-pvc
```

### 6. Frontend Deployment (`k8s/frontend/deployment.yaml`)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: magnetiq-frontend
  namespace: magnetiq-v2
spec:
  replicas: 3
  selector:
    matchLabels:
      app: magnetiq-frontend
  template:
    metadata:
      labels:
        app: magnetiq-frontend
    spec:
      containers:
      - name: frontend
        image: crepo.re-cloud.io/magnetiq/v2/frontend:latest
        ports:
        - containerPort: 9036
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
```

### 7. Ingress (`k8s/ingress.yaml`)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: magnetiq-ingress
  namespace: magnetiq-v2
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - yourdomain.com
    secretName: magnetiq-tls
  rules:
  - host: yourdomain.com
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
      - path: /
        pathType: Prefix
        backend:
          service:
            name: magnetiq-frontend
            port:
              number: 9036
```

## Deployment Process

### Step 1: Install k0s and Dependencies
```bash
# Install k0s
curl -sSLf https://get.k0s.sh | sudo sh
sudo k0s install controller --single
sudo k0s start

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Set up kubeconfig
mkdir -p ~/.kube
sudo k0s kubeconfig admin > ~/.kube/config

# Install Longhorn
kubectl apply -f https://raw.githubusercontent.com/longhorn/longhorn/v1.5.1/deploy/longhorn.yaml

# Install NGINX Ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml

# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml
```

### Step 2: Configure Cluster Issuer
```yaml
# cluster-issuer.yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@yourdomain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

### Step 3: Deploy Application
```bash
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
kubectl apply -f cluster-issuer.yaml

# Optional: Enable autoscaling and security policies
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/network_policy.yaml
kubectl apply -f k8s/rbac.yaml

# Verify deployment
kubectl get all -n magnetiq-v2
```

### Step 4: Initialize Database
```bash
# Get backend pod
BACKEND_POD=$(kubectl get pods -n magnetiq-v2 -l app=magnetiq-backend -o jsonpath='{.items[0].metadata.name}')

# Initialize database
kubectl exec -n magnetiq-v2 $BACKEND_POD -- python -m app.database.init_db

# Create admin user
kubectl exec -n magnetiq-v2 $BACKEND_POD -- python -m scripts.create_admin
```

## Deployment Updates

### Updating Application Version
```bash
# Update backend image
kubectl set image deployment/magnetiq-backend backend=crepo.re-cloud.io/magnetiq/v2/backend:v2.1.0 -n magnetiq-v2

# Update frontend image  
kubectl set image deployment/magnetiq-frontend frontend=crepo.re-cloud.io/magnetiq/v2/frontend:v2.1.0 -n magnetiq-v2

# Wait for rollout to complete
kubectl rollout status deployment/magnetiq-backend -n magnetiq-v2
kubectl rollout status deployment/magnetiq-frontend -n magnetiq-v2

# Verify new version is running
kubectl get pods -n magnetiq-v2 -o jsonpath='{.items[*].spec.containers[*].image}'
```

### Rollback if Needed
```bash
# Rollback to previous version
kubectl rollout undo deployment/magnetiq-backend -n magnetiq-v2
kubectl rollout undo deployment/magnetiq-frontend -n magnetiq-v2

# Check rollback status
kubectl rollout status deployment/magnetiq-backend -n magnetiq-v2
kubectl rollout status deployment/magnetiq-frontend -n magnetiq-v2
```

## Operations

### Scaling
```bash
# Manual scaling
kubectl scale deployment magnetiq-backend -n magnetiq-v2 --replicas=4
kubectl scale deployment magnetiq-frontend -n magnetiq-v2 --replicas=6

# Check HPA status
kubectl get hpa -n magnetiq-v2
```

### Rolling Updates
```bash
# Update images
kubectl set image deployment/magnetiq-backend backend=crepo.re-cloud.io/magnetiq/v2/backend:v2.1.0 -n magnetiq-v2
kubectl set image deployment/magnetiq-frontend frontend=crepo.re-cloud.io/magnetiq/v2/frontend:v2.1.0 -n magnetiq-v2

# Monitor rollout
kubectl rollout status deployment/magnetiq-backend -n magnetiq-v2
```

### Database Operations
```bash
# Backup database
BACKEND_POD=$(kubectl get pods -n magnetiq-v2 -l app=magnetiq-backend -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n magnetiq-v2 $BACKEND_POD -- sqlite3 /app/data/magnetiq.db ".backup /app/data/backup-$(date +%Y%m%d).db"

# Copy backup locally
kubectl cp magnetiq-v2/$BACKEND_POD:/app/data/backup-$(date +%Y%m%d).db ./backups/

# Restore database
kubectl cp ./backup.db magnetiq-v2/$BACKEND_POD:/app/data/restore.db
kubectl exec -n magnetiq-v2 $BACKEND_POD -- sqlite3 /app/data/magnetiq.db ".restore /app/data/restore.db"
```

## Monitoring & Troubleshooting

### Health Checks
```bash
# Check pod status
kubectl get pods -n magnetiq-v2

# View logs
kubectl logs -n magnetiq-v2 -l app=magnetiq-backend -f
kubectl logs -n magnetiq-v2 -l app=magnetiq-frontend -f

# Check ingress
kubectl describe ingress magnetiq-ingress -n magnetiq-v2

# Test health endpoints
kubectl exec -n magnetiq-v2 -it deploy/magnetiq-backend -- curl -s http://localhost:4036/health
```

### Common Issues
1. **PVC binding issues**: Check Longhorn installation and storage class
2. **Image pull errors**: Verify registry credentials and image availability
3. **Ingress not working**: Check NGINX controller and DNS configuration
4. **SSL certificate issues**: Verify cert-manager and domain validation

### Resource Monitoring
```bash
# Resource usage
kubectl top pods -n magnetiq-v2
kubectl top nodes

# Detailed metrics
kubectl describe pod <pod-name> -n magnetiq-v2
```

## Performance Tuning

### Resource Optimization
```yaml
# Adjust based on monitoring
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

### HPA Configuration
```yaml
# k8s/hpa.yaml
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
```

## Security Configuration

### Network Policies
```yaml
# k8s/network_policy.yaml
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
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
```

### RBAC Configuration
```yaml
# k8s/rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: magnetiq-sa
  namespace: magnetiq-v2
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: magnetiq-v2
  name: magnetiq-role
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps", "secrets"]
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

## Cleanup
```bash
# Delete all resources
kubectl delete -f k8s/ -R

# Or delete namespace
kubectl delete namespace magnetiq-v2

# Clean up persistent volumes (if using Retain policy)
kubectl delete pv -l app=magnetiq
```

## Migration from Docker
1. Export SQLite database from Docker container
2. Build and push container images to registry
3. Deploy to Kubernetes following this specification
4. Import database to new environment
5. Update DNS to point to Kubernetes ingress

## k0s Specific Notes
- k0s provides embedded components for easier management
- Default storage class can be configured during installation
- Built-in containerd runtime requires no additional configuration
- Automatic updates can be configured through k0s configuration

This specification provides production-ready Kubernetes deployment for Magnetiq v2 with high availability, persistent storage, automatic scaling, and comprehensive security policies.
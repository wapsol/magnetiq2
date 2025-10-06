# Magnetiq2 Installation Guide for k0s Cluster

## Overview
This guide provides step-by-step instructions to install **Magnetiq2** (Autonomous Agentic Top of the Funnel Lead Generation) application on the k0s cluster.

### Application Details
- **Project**: Magnetiq v2 by Voltaic Systems
- **Repository**: https://github.com/wapsol/magnetiq2/
- **Architecture**: Microservices (Frontend + Backend + Database)
- **Storage**: SQLite database with persistent volumes
- **Domain**: magnetiq.voltaic.systems

## Prerequisites

### 1. Verify Cluster Resources
```bash
# Check cluster status
kubectl get nodes
kubectl get namespaces

# Verify Longhorn storage is available (required for persistent volumes)
kubectl get storageclass | grep longhorn

# Check available resources
kubectl top nodes
```

### 2. Verify Required Components
```bash
# Ensure ingress-nginx is running
kubectl get pods -n ingress-nginx

# Verify cert-manager for SSL certificates
kubectl get pods -n cert-manager

# Check if domain is configured in ingress controller
kubectl get svc -n ingress-nginx ingress-nginx-controller
```

## Installation Steps

### Step 1: Clone the Repository
```bash
# Navigate to working directory
cd /home/ashant

# Clone the magnetiq2 repository
git clone https://github.com/wapsol/magnetiq2.git
cd magnetiq2
```

### Step 2: Create Namespace
```bash
# Create the magnetiq-v2 namespace
kubectl apply -f k8s/namespace.yaml

# Verify namespace creation
kubectl get namespace magnetiq-v2
```

### Step 3: Configure Storage
```bash
# Apply the Longhorn storage class configuration
kubectl apply -f k8s/storage.yaml

# Verify storage class is available
kubectl get storageclass longhorn-retain
```

### Step 4: Create ConfigMap and Secrets
```bash
# Apply configuration
kubectl apply -f k8s/configmap.yaml

# Create secrets (you may need to customize this)
kubectl apply -f k8s/secrets.yaml

# Verify configurations
kubectl get configmap -n magnetiq-v2
kubectl get secrets -n magnetiq-v2
```

### Step 5: Set Up RBAC (If Required)
```bash
# Apply RBAC configuration
kubectl apply -f k8s/rbac.yaml

# Verify RBAC resources
kubectl get serviceaccount -n magnetiq-v2
kubectl get role,rolebinding -n magnetiq-v2
```

### Step 6: Deploy Backend Service
```bash
# Apply backend deployment and service
kubectl apply -f k8s/backend/

# Check deployment status
kubectl get pods -n magnetiq-v2 -l app=magnetiq-backend
kubectl get svc -n magnetiq-v2 -l app=magnetiq-backend

# Check logs if needed
kubectl logs -n magnetiq-v2 -l app=magnetiq-backend --tail=50
```

### Step 7: Deploy Frontend Service
```bash
# Apply frontend deployment and service
kubectl apply -f k8s/frontend/

# Check deployment status
kubectl get pods -n magnetiq-v2 -l app=magnetiq-frontend
kubectl get svc -n magnetiq-v2 -l app=magnetiq-frontend

# Check logs if needed
kubectl logs -n magnetiq-v2 -l app=magnetiq-frontend --tail=50
```

### Step 8: Configure Ingress
```bash
# Apply ingress configuration
kubectl apply -f k8s/ingress.yaml

# Verify ingress is created
kubectl get ingress -n magnetiq-v2
kubectl describe ingress -n magnetiq-v2 magnetiq-ingress
```

### Step 9: Set Up Network Policies (Optional)
```bash
# Apply network security policies
kubectl apply -f k8s/network-policy.yaml

# Verify network policies
kubectl get networkpolicy -n magnetiq-v2
```

### Step 10: Configure Horizontal Pod Autoscaler
```bash
# Apply HPA configuration
kubectl apply -f k8s/hpa.yaml

# Check HPA status
kubectl get hpa -n magnetiq-v2
```

## Verification and Testing

### Check All Resources
```bash
# Get all resources in the namespace
kubectl get all -n magnetiq-v2

# Check persistent volumes
kubectl get pv | grep magnetiq
kubectl get pvc -n magnetiq-v2
```

### Test Application Access
```bash
# Check if ingress has external IP
kubectl get ingress -n magnetiq-v2

# Test backend health endpoint
curl -k https://magnetiq.voltaic.systems/health

# Test frontend accessibility
curl -k https://magnetiq.voltaic.systems/
```

### Monitor Deployment Status
```bash
# Watch pod status
kubectl get pods -n magnetiq-v2 -w

# Check resource usage
kubectl top pods -n magnetiq-v2

# View application logs
kubectl logs -n magnetiq-v2 deployment/magnetiq-backend
kubectl logs -n magnetiq-v2 deployment/magnetiq-frontend
```

## Configuration Notes

### Resource Requirements
- **Backend**: 256Mi-512Mi RAM, 250m-500m CPU
- **Frontend**: 128Mi-256Mi RAM, 100m-200m CPU
- **Storage**: Persistent volumes for data and media
- **Total Estimated**: ~1GB RAM, ~1 CPU core

### Custom Configuration

1. **Environment Variables** (in ConfigMap):
   - Backend port: 4036
   - Frontend port: 9036
   - Database: SQLite at `/app/data/magnetiq.db`
   - CORS origins: `https://magnetiq.voltaic.systems`

2. **SMTP Settings** (may need secrets):
   - Host: smtp-relay.brevo.com
   - Port: 587
   - From: noreply@voltaic.systems

3. **Domain Configuration**:
   - Main domain: magnetiq.voltaic.systems
   - SSL: Let's Encrypt via cert-manager

### Persistent Volumes
The application requires two persistent volumes:
- **Data volume**: For SQLite database
- **Media volume**: For uploaded files and media

## Troubleshooting

### Common Issues and Solutions

1. **Image Pull Errors**:
```bash
# Check if images are accessible
docker pull crepo.re-cloud.io/magnetiq/v2/backend:latest
docker pull crepo.re-cloud.io/magnetiq/v2/frontend:latest
```

2. **SSL Certificate Issues**:
```bash
# Check cert-manager status
kubectl get certificaterequests -n magnetiq-v2
kubectl get certificates -n magnetiq-v2
```

3. **Storage Issues**:
```bash
# Check Longhorn status
kubectl get pods -n longhorn-system
kubectl get pv | grep longhorn
```

4. **Resource Constraints**:
```bash
# Check node resources
kubectl describe nodes
kubectl top nodes
```

### Health Checks
- **Backend Health**: `GET /health` endpoint
- **Frontend Health**: Root path accessibility
- **Database**: SQLite file in persistent volume

## Scaling and Updates

### Scale Application
```bash
# Scale backend replicas
kubectl scale deployment magnetiq-backend -n magnetiq-v2 --replicas=3

# Scale frontend replicas  
kubectl scale deployment magnetiq-frontend -n magnetiq-v2 --replicas=5

# Check HPA status
kubectl get hpa -n magnetiq-v2
```

### Update Application
```bash
# Update backend image
kubectl set image deployment/magnetiq-backend -n magnetiq-v2 \
  magnetiq-backend=crepo.re-cloud.io/magnetiq/v2/backend:v2.1.0

# Update frontend image
kubectl set image deployment/magnetiq-frontend -n magnetiq-v2 \
  magnetiq-frontend=crepo.re-cloud.io/magnetiq/v2/frontend:v2.1.0

# Monitor rollout
kubectl rollout status deployment/magnetiq-backend -n magnetiq-v2
kubectl rollout status deployment/magnetiq-frontend -n magnetiq-v2
```

## Cleanup (If Needed)
```bash
# Remove all resources
kubectl delete namespace magnetiq-v2

# Remove storage class if no longer needed
kubectl delete storageclass longhorn-retain

# Clean up persistent volumes if needed
kubectl get pv | grep magnetiq | awk '{print $1}' | xargs kubectl delete pv
```

## Expected Outcome
After successful installation:
- ✅ Magnetiq2 application accessible at https://magnetiq.voltaic.systems
- ✅ Backend API available at https://magnetiq.voltaic.systems/api
- ✅ SSL certificate automatically provisioned
- ✅ High availability with multiple replicas
- ✅ Persistent data storage via Longhorn
- ✅ Automatic scaling based on load

## Support
For issues specific to the application, refer to:
- **Repository**: https://github.com/wapsol/magnetiq2/
- **Documentation**: Check repository README and issues
- **Contact**: Voltaic Systems (voltaic.systems)
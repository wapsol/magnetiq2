# Kustomize

## Purpose

• Template-free Kubernetes configuration management using declarative overlays and patches
• Environment-specific customizations without duplicating YAML manifests or complex templating
• Native kubectl integration for streamlined deployment workflows and GitOps practices

## Key Features

- **Template-free approach**: Works with standard Kubernetes YAML manifests without templating syntax
- **Declarative overlays**: Layer environment-specific configurations on top of base resources
- **Strategic merge patches**: Precise modifications to existing resources using patch-based transformations
- **Resource generators**: Built-in ConfigMap and Secret generation from literals, files, or env files
- **Cross-cutting fields**: Apply labels, annotations, name prefixes/suffixes across all resources
- **Native kubectl integration**: Built into kubectl since v1.14 with `kubectl apply -k` command
- **Multi-base composition**: Combine multiple bases into complex application deployments

## Common Commands

```bash
# Apply kustomization from current directory
kubectl apply -k .

# Apply from specific overlay directory
kubectl apply -k overlays/production/

# Generate manifests without applying (dry run)
kubectl kustomize overlays/staging/

# Preview changes before applying
kubectl apply -k overlays/production/ --dry-run=client -o yaml

# Edit image tags in kustomization
kustomize edit set image myapp=myregistry/myapp:v1.2.3

# Add resources to kustomization
kustomize edit add resource deployment.yaml

# Set namespace for all resources
kustomize edit set namespace production
```

## Quick Start

### 1. Create Base Configuration
```bash
mkdir -p base
cd base
```

Create `kustomization.yaml`:
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
- deployment.yaml
- service.yaml

commonLabels:
  app: myapp
```

### 2. Create Base Resources
Create `deployment.yaml` and `service.yaml` with standard Kubernetes manifests.

### 3. Create Environment Overlay
```bash
mkdir -p overlays/production
cd overlays/production
```

Create overlay `kustomization.yaml`:
```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

bases:
- ../../base

namePrefix: prod-
namespace: production

replicas:
- name: myapp-deployment
  count: 3

images:
- name: myapp
  newTag: v1.0.0
```

### 4. Deploy
```bash
kubectl apply -k overlays/production/
```

## Configuration

### Directory Structure
```
k8s/
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   └── service.yaml
└── overlays/
    ├── development/
    │   └── kustomization.yaml
    ├── staging/
    │   └── kustomization.yaml
    └── production/
        ├── kustomization.yaml
        └── patches/
```

### Strategic Merge Patch Example
```yaml
# overlays/production/patches/deployment-patch.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-deployment
spec:
  replicas: 5
  template:
    spec:
      containers:
      - name: myapp
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### ConfigMap Generator
```yaml
# kustomization.yaml
configMapGenerator:
- name: app-config
  literals:
  - LOG_LEVEL=info
  - DATABASE_URL=postgresql://prod-db:5432/myapp
  files:
  - app.properties
```

### JSON Patch Example
```yaml
patchesJson6902:
- target:
    group: apps
    version: v1
    kind: Deployment
    name: myapp
  path: patch.yaml
```

## Best Practices

- **Keep bases environment-agnostic**: Base configurations should work in any environment without modifications
- **Use descriptive overlay names**: Match your actual deployment environments (dev, staging, prod)
- **Prefer strategic merge patches**: More readable and maintainable than JSON patches for most use cases
- **Generate ConfigMaps and Secrets**: Don't commit sensitive data; use generators with external sources
- **Version control everything**: Include kustomization files alongside source code for GitOps workflows
- **Pin image versions in production**: Use specific tags or digests instead of 'latest'
- **Validate before applying**: Use `kubectl kustomize` to preview generated manifests

## Common Issues

**Issue**: Kustomization not found
```bash
Error: unable to find one of 'kustomization.yaml', 'kustomization.yml' or 'Kustomization'
```
**Solution**: Ensure kustomization.yaml exists in the target directory and is properly formatted

**Issue**: Resource conflicts during strategic merge
```bash
Error: merging from generator &{0xc000...} into base &{0xc000...}
```
**Solution**: Check for conflicting resource names or use JSON patches for complex merges

**Issue**: Invalid patch format
```bash
Error: strategic merge patch contains invalid merge key
```
**Solution**: Ensure patch structure matches target resource schema exactly

**Issue**: Image not found in kustomization
```bash
Error: image specified in kustomization file was not found
```
**Solution**: Verify image name matches exactly what's in the deployment manifest

## Integration

### GitOps with ArgoCD
```yaml
# Application manifest
spec:
  source:
    path: k8s/overlays/production
    kustomize:
      images:
      - myapp=registry.io/myapp:v1.2.3
```

### CI/CD Pipeline Integration
```yaml
# GitHub Actions
- name: Update image tag
  run: |
    cd k8s/overlays/production
    kustomize edit set image myapp=${{ env.IMAGE_TAG }}
    
- name: Deploy
  run: kubectl apply -k k8s/overlays/production/
```

### Helm Integration (Kustomize as post-renderer)
```bash
helm template myapp ./chart | kubectl apply -f -
# Or use kustomize as helm post-renderer
helm install myapp ./chart --post-renderer kustomize
```

## Related Technologies

- **Helm**: Kubernetes package manager with templating (alternative approach)
- **Jsonnet**: Data templating language for generating Kubernetes manifests
- **Kapitan**: Git-based configuration management with multiple templating engines
- **ArgoCD**: GitOps operator with native Kustomize support
- **FluxCD**: GitOps toolkit with Kustomize controller
- **Skaffold**: Development workflow tool with Kustomize integration
- **Tilt**: Local development environment with Kustomize support

## Resources

### Official Documentation
- [Kustomize Official Documentation](https://kustomize.io/)
- [Kubernetes Kustomize Tutorial](https://kubernetes.io/docs/tutorials/configuration/kustomize/)
- [kubectl Kustomize Reference](https://kubernetes.io/docs/reference/kubectl/kustomize/)

### Tutorials and Guides
- [Kustomize GitHub Repository](https://github.com/kubernetes-sigs/kustomize)
- [Kustomize Examples](https://github.com/kubernetes-sigs/kustomize/tree/master/examples)
- [GitOps Guide with Kustomize](https://argoproj.github.io/argo-cd/user-guide/kustomize/)
- [Advanced Kustomize Patterns](https://kubectl.docs.kubernetes.io/guides/config_management/)
- [Kustomize Best Practices](https://cloud.google.com/anthos-config-management/docs/how-to/kustomize-best-practices)

---

*Last updated: September 10, 2025 by ashant@magnetiq*
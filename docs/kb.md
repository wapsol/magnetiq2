# Magnetiq v2 Knowledge Base

This file captures all learnings, decisions, gotchas, and insights discovered during the development of Magnetiq v2. It serves as the institutional memory of the project.

---

## Docker Build Environment Management

**Date**: 2025-10-06
**Context**: Setting up proper DEV and PROD Docker build workflows
**Category**: Development / DevOps

### Finding: Docker-Native Multi-Stage Builds
The project uses Docker's multi-stage build feature to handle DEV and PROD environments natively without additional tooling.

**Architecture**:
```dockerfile
# Both backend and frontend Dockerfiles follow this pattern:
FROM base as development    # DEV stage
FROM base as production     # PROD stage
```

### Key Differences Between Environments

| Aspect | DEV (Docker Compose) | PROD (K8s on k0s) |
|--------|---------------------|-------------------|
| **Build Target** | `development` | `production` |
| **Frontend Server** | Vite dev server (port 9036) | nginx:alpine serving static files |
| **Backend Server** | Uvicorn with `--reload` (port 4036) | Gunicorn with Uvicorn workers |
| **Code Location** | Volume-mounted for hot reload | Baked into image |
| **Hot Reload** | ✅ Enabled | ❌ Disabled |
| **nginx Usage** | Not used | Embedded in frontend container |
| **Image Size** | Larger (includes dev dependencies) | Smaller (production deps only) |

### nginx:alpine Role
**Important**: nginx:alpine is NOT used in development, only in production.

- **Development**: Frontend runs Vite dev server directly, no nginx
- **Production**: Frontend Dockerfile's production stage uses `FROM nginx:alpine` to serve pre-built static files
- **K8s Ingress**: Separate nginx-ingress-controller handles routing at cluster level

### Build Commands

**Development**:
```bash
# Uses docker-compose.yml which specifies target: development
docker-compose up --build -d

# Or use the build script
./scripts/build.sh dev
```

**Production**:
```bash
# Build with explicit production target
docker build --target production \
  -t crepo.re-cloud.io/magnetiq/v2/backend:latest \
  ./backend

docker build --target production \
  -t crepo.re-cloud.io/magnetiq/v2/frontend:latest \
  ./frontend

# Or use the build script
./scripts/build.sh prod
```

### Build Script: scripts/build.sh
Created a unified build script that handles both environments:

**Features**:
- Automatic path resolution (works from any directory)
- Color-coded output for better UX
- Interactive push confirmation for production
- Automatic timestamp tagging for production images
- Shows helpful post-build instructions

**Usage**:
```bash
./scripts/build.sh dev   # Build and start DEV containers
./scripts/build.sh prod  # Build PROD images, optionally push
```

### Port Configuration

**Development (Docker Compose)**:
- Backend: 4036
- Frontend: 9036
- No nginx container (has `profiles: - production`)

**Production (K8s)**:
- Backend: 4036 (internal to pod)
- Frontend: 80 inside container, mapped to 9036 via K8s service
- K8s Ingress: Routes all traffic through port 443 (HTTPS)

### Container Registry
- Registry: `crepo.re-cloud.io`
- Project: `magnetiq/v2`
- Repositories: `backend` and `frontend`
- Tagging strategy: Both `latest` and timestamp tags

### Impact
This Docker-native approach:
- ✅ Eliminates need for complex build tooling
- ✅ Keeps configuration in Dockerfiles where it belongs
- ✅ Provides clear separation between environments
- ✅ Leverages Docker's built-in multi-stage build caching
- ✅ Enables different server configurations per environment

### Action Items
- ✅ Created `scripts/build.sh` for simplified builds
- ⚠️ **Still Missing**: `docker/nginx-frontend.conf` (referenced in frontend Dockerfile:50)
  - Required for production frontend builds to work properly
  - Frontend will fail to start without this config file

### Lesson Learned
**Don't overcomplicate build systems.** Docker multi-stage builds are powerful enough to handle environment separation natively. Keep it simple and Docker-native unless there's a compelling reason to add more tooling.

---

## Future Entries
New learnings will be appended below...

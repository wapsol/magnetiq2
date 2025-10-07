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

## Conversation Summary: Docker Build Workflow & Knowledge Base Setup

**Date**: 2025-10-06
**Context**: Initial project onboarding and build system configuration
**Category**: Development / Documentation

### Session Overview
Comprehensive session covering Docker build environments, nginx architecture, and knowledge base setup for the Magnetiq v2 project.

### Key Activities

#### 1. **Codebase Analysis**
- Analyzed project structure for Magnetiq v2 CMS
- Examined multi-stage Dockerfiles for backend (Python/FastAPI) and frontend (React/Vite)
- Reviewed Kubernetes deployment configurations
- Identified missing configuration files

#### 2. **Docker Environment Investigation**
**Question**: How to maintain separate DEV and PROD Docker builds?

**Answer**: Use Docker-native multi-stage builds (already implemented)
- No need for complex external tooling (Makefiles, etc.)
- Dockerfiles already properly structured with `development` and `production` stages
- docker-compose.yml uses `target: development` for DEV
- Production uses `--target production` flag when building

#### 3. **nginx:alpine Architecture Understanding**
**Finding**: nginx:alpine has different roles per environment
- **DEV**: NOT used - Frontend runs Vite dev server directly
- **PROD**: Embedded in frontend container via `FROM nginx:alpine as production`
- **K8s**: Separate nginx-ingress-controller handles cluster routing

**Critical Discovery**: Missing `docker/nginx-frontend.conf` file
- Referenced in frontend Dockerfile line 50
- Required for production frontend builds
- Action item flagged for creation

#### 4. **Build Script Creation**
Created `/Users/ashant/magnetiq2/scripts/build.sh` with:
- Automatic path resolution (works from any directory)
- Color-coded output
- Interactive push confirmation for prod builds
- Timestamp tagging strategy
- Both DEV and PROD modes tested successfully

**Usage**:
```bash
./scripts/build.sh dev   # Docker Compose development
./scripts/build.sh prod  # Production images for K8s
```

#### 5. **Port Configuration Documented**
- **DEV**: Backend 4036, Frontend 9036
- **PROD (K8s)**: Backend 4036 (internal), Frontend 80→9036 (service mapping)
- Vite config adjusted to match Docker port mappings

#### 6. **Knowledge Base System Established**
- Updated CLAUDE.md with kb.md documentation guidelines
- Created initial `/Users/ashant/magnetiq2/docs/kb.md`
- Documented Docker build learnings as first entry
- Established "add that to kb" workflow

### Technical Decisions Made

1. **Keep It Docker-Native**: Rejected complex build tooling in favor of multi-stage builds
2. **Single Build Script**: One simple script handles both environments
3. **Interactive Production Push**: Safety feature to prevent accidental registry pushes
4. **Timestamp Tagging**: Production images tagged with both `latest` and `YYYYMMDD-HHMMSS`

### Container Registry Configuration
- Registry: `crepo.re-cloud.io`
- Project: `magnetiq/v2`
- Repositories: `backend` and `frontend`
- K8s pulls with `imagePullPolicy: Always`

### Services Status After Session
- ✅ Backend running at http://localhost:4036 (Docker)
- ✅ Frontend running at http://localhost:9036 (Docker)
- ✅ Build script created and tested
- ✅ Knowledge base system established
- ⚠️ Missing nginx-frontend.conf (to be created)

### Lessons From This Session

1. **Simplicity Wins**: The existing multi-stage Dockerfiles were already optimal. No need to add complexity.

2. **Understanding Over Doing**: Spent time understanding nginx:alpine's role before making changes - prevented unnecessary modifications.

3. **Document As You Go**: Established kb.md early to capture learnings immediately rather than trying to remember later.

4. **Path Resolution Matters**: Build script properly handles relative paths so it works from any directory.

5. **Interactive Safety Nets**: Production push confirmation prevents costly mistakes.

### Impact
This session established:
- Clear understanding of DEV/PROD build separation
- Simple, maintainable build workflow
- Documentation system for future learning retention
- Foundation for consistent deployment practices

### Next Steps Identified
1. Create missing `docker/nginx-frontend.conf`
2. Test complete DEV→PROD→K8s deployment pipeline
3. Continue populating kb.md as new insights emerge

---

## Future Entries
New learnings will be appended below...

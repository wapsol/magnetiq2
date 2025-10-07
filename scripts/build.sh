#!/bin/bash
# ==============================================================================
# build.sh - Build Docker images for DEV or PROD environments
# ==============================================================================
# Usage (Legacy Mode):
#   ./scripts/build.sh dev   - Build and start development containers
#   ./scripts/build.sh prod  - Build production images and push to registry
#
# Usage (Parameter Mode):
#   ./scripts/build.sh --component backend --tag v1.0.0 --registry magnetiq/v2
#   ./scripts/build.sh --component frontend --tag v1.0.0 --target production
#
# Parameters:
#   --component   Component to build (backend/frontend)
#   --tag         Version tag for the image
#   --registry    Container registry path (default: crepo.re-cloud.io/magnetiq/v2)
#   --log-file    Optional log file path
#   --target      Docker build target (default: production)
#   --network     Docker network mode (e.g., host)
#   --sudo        Use sudo for docker commands
# ==============================================================================

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Default values
REGISTRY="crepo.re-cloud.io/magnetiq/v2"
TARGET="production"
USE_SUDO=""
LOG_FILE=""
USE_NETWORK_HOST=""
LEGACY_MODE=""
COMPONENT=""
TAG=""

# Detect mode: Legacy (dev|prod) or Parameter-based
if [[ $# -eq 1 && "$1" =~ ^(dev|prod)$ ]]; then
    # Legacy mode
    LEGACY_MODE="$1"
elif [[ $# -gt 0 ]]; then
    # Parse named parameters
    while [[ $# -gt 0 ]]; do
        case $1 in
            --component) COMPONENT="$2"; shift 2 ;;
            --tag) TAG="$2"; shift 2 ;;
            --registry) REGISTRY="$2"; shift 2 ;;
            --log-file) LOG_FILE="$2"; shift 2 ;;
            --target) TARGET="$2"; shift 2 ;;
            --network) USE_NETWORK_HOST="--network=$2"; shift 2 ;;
            --sudo) USE_SUDO="sudo"; shift ;;
            *) echo -e "${RED}Unknown option: $1${NC}"; exit 1 ;;
        esac
    done
else
    # No arguments, default to dev
    LEGACY_MODE="dev"
fi

# Change to project root
cd "${PROJECT_ROOT}"

# ==============================================================================
# Parameter Mode - Build specific component
# ==============================================================================
if [ -n "$COMPONENT" ]; then
    echo -e "${BLUE}==================================================${NC}"
    echo -e "${BLUE}  Magnetiq v2 Docker Build (Parameter Mode)${NC}"
    echo -e "${BLUE}==================================================${NC}"
    echo -e "Component: ${YELLOW}${COMPONENT}${NC}"
    echo -e "Tag: ${YELLOW}${TAG:-latest}${NC}"
    echo -e "Registry: ${YELLOW}${REGISTRY}${NC}"
    echo -e "Target: ${YELLOW}${TARGET}${NC}"
    echo -e "Project Root: ${PROJECT_ROOT}"
    [ -n "$LOG_FILE" ] && echo -e "Log File: ${LOG_FILE}"
    [ -n "$USE_SUDO" ] && echo -e "Using sudo: ${YELLOW}Yes${NC}"
    echo ""

    # Validate component
    if [[ "$COMPONENT" != "backend" && "$COMPONENT" != "frontend" ]]; then
        echo -e "${RED}Error: Invalid component '${COMPONENT}'. Must be 'backend' or 'frontend'${NC}"
        exit 1
    fi

    # Validate tag is provided
    if [ -z "$TAG" ]; then
        echo -e "${RED}Error: --tag parameter is required in parameter mode${NC}"
        exit 1
    fi

    # Setup logging if requested
    if [ -n "$LOG_FILE" ]; then
        exec 1> >(tee -a "$LOG_FILE")
        exec 2>&1
    fi

    # Build the component
    echo -e "${GREEN}Building ${COMPONENT} image...${NC}"

    BUILD_CMD="${USE_SUDO} docker build --target ${TARGET}"
    [ -n "$USE_NETWORK_HOST" ] && BUILD_CMD="${BUILD_CMD} ${USE_NETWORK_HOST}"
    BUILD_CMD="${BUILD_CMD} -t ${REGISTRY}/${COMPONENT}:${TAG}"
    BUILD_CMD="${BUILD_CMD} -t ${REGISTRY}/${COMPONENT}:latest"
    BUILD_CMD="${BUILD_CMD} ./${COMPONENT}"

    echo -e "${BLUE}Command: ${BUILD_CMD}${NC}"
    eval $BUILD_CMD

    echo ""
    echo -e "${GREEN}✓ ${COMPONENT} image built successfully${NC}"
    echo ""

    # Show built images
    echo -e "${BLUE}Built images:${NC}"
    ${USE_SUDO} docker images | grep "${REGISTRY}/${COMPONENT}" | head -2
    echo ""

    # Ask to push
    echo -e "${YELLOW}Push images to registry? (y/n)${NC}"
    read -r PUSH_CONFIRM

    if [ "$PUSH_CONFIRM" = "y" ] || [ "$PUSH_CONFIRM" = "Y" ]; then
        echo ""
        echo -e "${GREEN}Pushing images to ${REGISTRY}...${NC}"

        ${USE_SUDO} docker push ${REGISTRY}/${COMPONENT}:${TAG}
        ${USE_SUDO} docker push ${REGISTRY}/${COMPONENT}:latest

        echo ""
        echo -e "${GREEN}==================================================${NC}"
        echo -e "${GREEN}  Images pushed successfully!${NC}"
        echo -e "${GREEN}==================================================${NC}"
        echo -e "${COMPONENT}: ${REGISTRY}/${COMPONENT}:${TAG}"
        echo -e "          ${REGISTRY}/${COMPONENT}:latest"
    else
        echo -e "${YELLOW}Skipping push. Images available locally.${NC}"
    fi

# ==============================================================================
# Legacy Mode - DEV or PROD
# ==============================================================================
else
    echo -e "${BLUE}==================================================${NC}"
    echo -e "${BLUE}  Magnetiq v2 Docker Build Script${NC}"
    echo -e "${BLUE}==================================================${NC}"
    echo -e "Environment: ${YELLOW}${LEGACY_MODE}${NC}"
    echo -e "Project Root: ${PROJECT_ROOT}"
    echo ""

# ==============================================================================
# DEV Environment
# ==============================================================================
if [ "$LEGACY_MODE" = "dev" ]; then
    echo -e "${GREEN}Building and starting DEVELOPMENT containers...${NC}"
    echo ""

    # Build and start with docker-compose
    docker-compose up --build -d

    # Wait a moment for containers to start
    sleep 3

    # Show status
    echo ""
    echo -e "${GREEN}==================================================${NC}"
    echo -e "${GREEN}  DEV Environment Started${NC}"
    echo -e "${GREEN}==================================================${NC}"
    docker-compose ps

    echo ""
    echo -e "${BLUE}Access URLs:${NC}"
    echo -e "  Frontend: ${GREEN}http://localhost:9036${NC}"
    echo -e "  Backend:  ${GREEN}http://localhost:4036${NC}"
    echo -e "  API Docs: ${GREEN}http://localhost:4036/docs${NC}"
    echo ""
    echo -e "${YELLOW}Logs: docker-compose logs -f${NC}"
    echo -e "${YELLOW}Stop: docker-compose down${NC}"

# ==============================================================================
# PROD Environment
# ==============================================================================
elif [ "$ENV" = "prod" ]; then
    echo -e "${GREEN}Building PRODUCTION images...${NC}"
    echo ""

    # Generate timestamp tag
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)

    # Build backend
    echo -e "${BLUE}Building backend image...${NC}"
    docker build --target production \
        --network=host \
        -t ${REGISTRY}/backend:latest \
        -t ${REGISTRY}/backend:${TIMESTAMP} \
        ./backend

    echo -e "${GREEN}✓ Backend image built${NC}"
    echo ""

    # Build frontend
    echo -e "${BLUE}Building frontend image...${NC}"
    docker build --target production \
        --network=host \
        -t ${REGISTRY}/frontend:latest \
        -t ${REGISTRY}/frontend:${TIMESTAMP} \
        ./frontend

    echo -e "${GREEN}✓ Frontend image built${NC}"
    echo ""

    # Show built images
    echo -e "${BLUE}Built images:${NC}"
    docker images | grep "${REGISTRY}" | head -4
    echo ""

    # Ask to push
    echo -e "${YELLOW}Push images to registry? (y/n)${NC}"
    read -r PUSH_CONFIRM

    if [ "$PUSH_CONFIRM" = "y" ] || [ "$PUSH_CONFIRM" = "Y" ]; then
        echo ""
        echo -e "${GREEN}Pushing images to ${REGISTRY}...${NC}"

        docker push ${REGISTRY}/backend:latest
        docker push ${REGISTRY}/backend:${TIMESTAMP}
        docker push ${REGISTRY}/frontend:latest
        docker push ${REGISTRY}/frontend:${TIMESTAMP}

        echo ""
        echo -e "${GREEN}==================================================${NC}"
        echo -e "${GREEN}  Images pushed successfully!${NC}"
        echo -e "${GREEN}==================================================${NC}"
        echo -e "Backend:  ${REGISTRY}/backend:latest"
        echo -e "          ${REGISTRY}/backend:${TIMESTAMP}"
        echo -e "Frontend: ${REGISTRY}/frontend:latest"
        echo -e "          ${REGISTRY}/frontend:${TIMESTAMP}"
        echo ""
        echo -e "${BLUE}Deploy to K8s:${NC}"
        echo -e "  kubectl rollout restart deployment/magnetiq-backend -n magnetiq-v2"
        echo -e "  kubectl rollout restart deployment/magnetiq-frontend -n magnetiq-v2"
    else
        echo -e "${YELLOW}Skipping push. Images available locally.${NC}"
    fi

# ==============================================================================
# Invalid Environment
# ==============================================================================
else
    echo -e "${RED}Error: Invalid environment '${LEGACY_MODE}'${NC}"
    echo ""
    echo "Usage:"
    echo "  ./scripts/build.sh dev   - Build and start development containers"
    echo "  ./scripts/build.sh prod  - Build production images and push to registry"
    exit 1
fi

fi  # End of Legacy Mode

echo ""
echo -e "${GREEN}Done!${NC}"

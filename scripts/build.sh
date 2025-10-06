#!/bin/bash
# ==============================================================================
# build.sh - Build Docker images for DEV or PROD environments
# ==============================================================================
# Usage:
#   ./scripts/build.sh dev   - Build and start development containers
#   ./scripts/build.sh prod  - Build production images and push to registry
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

# Environment argument
ENV=${1:-dev}

# Container registry
REGISTRY="crepo.re-cloud.io/magnetiq/v2"

# Change to project root
cd "${PROJECT_ROOT}"

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  Magnetiq v2 Docker Build Script${NC}"
echo -e "${BLUE}==================================================${NC}"
echo -e "Environment: ${YELLOW}${ENV}${NC}"
echo -e "Project Root: ${PROJECT_ROOT}"
echo ""

# ==============================================================================
# DEV Environment
# ==============================================================================
if [ "$ENV" = "dev" ]; then
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
        -t ${REGISTRY}/backend:latest \
        -t ${REGISTRY}/backend:${TIMESTAMP} \
        ./backend

    echo -e "${GREEN}✓ Backend image built${NC}"
    echo ""

    # Build frontend
    echo -e "${BLUE}Building frontend image...${NC}"
    docker build --target production \
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
    echo -e "${RED}Error: Invalid environment '${ENV}'${NC}"
    echo ""
    echo "Usage:"
    echo "  ./scripts/build.sh dev   - Build and start development containers"
    echo "  ./scripts/build.sh prod  - Build production images and push to registry"
    exit 1
fi

echo ""
echo -e "${GREEN}Done!${NC}"

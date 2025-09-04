#!/bin/bash
# ==============================================================================
# update-code.sh - Rebuild and deploy code changes to Docker containers
# ==============================================================================
# Purpose: Smart rebuilding of containers after code changes
# Usage: ./scripts/update-code.sh [service] [--no-cache]
# Examples:
#   ./scripts/update-code.sh           # Auto-detect and rebuild changed services
#   ./scripts/update-code.sh frontend  # Rebuild only frontend
#   ./scripts/update-code.sh --no-cache # Force rebuild without cache
# ==============================================================================

# PSEUDO-CODE - To be implemented with actual bash commands

# -----------------------------------------------------------------------------
# 1. PARSE ARGUMENTS
# -----------------------------------------------------------------------------

# SPECIFIC_SERVICE=""
# NO_CACHE=false
# FORCE_ALL=false
# 
# for arg in "$@":
#     case arg:
#         frontend|backend|nginx:
#             SPECIFIC_SERVICE=arg
#         --no-cache:
#             NO_CACHE=true
#         --all:
#             FORCE_ALL=true
#         --help:
#             show_help()
#             exit 0

# -----------------------------------------------------------------------------
# 2. DETECT CHANGES
# -----------------------------------------------------------------------------

# function detect_changed_services() {
#     CHANGED_SERVICES=()
#     
#     # Check git status for changes
#     if command_exists git:
#         # Get list of modified files since last commit
#         CHANGED_FILES = git diff --name-only HEAD
#         CHANGED_FILES += git ls-files --others --exclude-standard  # untracked files
#         
#         # Detect frontend changes
#         if echo CHANGED_FILES | grep -E "^frontend/|package\.json|package-lock\.json":
#             CHANGED_SERVICES.add("frontend")
#             FRONTEND_DEPS_CHANGED = check_package_json_changed()
#         
#         # Detect backend changes
#         if echo CHANGED_FILES | grep -E "^backend/|requirements\.txt|alembic/":
#             CHANGED_SERVICES.add("backend")
#             BACKEND_DEPS_CHANGED = check_requirements_changed()
#         
#         # Detect nginx config changes
#         if echo CHANGED_FILES | grep -E "nginx\.conf|docker/nginx":
#             CHANGED_SERVICES.add("nginx")
#     else:
#         echo "Git not available, checking timestamps..."
#         # Fallback to timestamp checking
#         check_timestamps_for_changes()
#     
#     return CHANGED_SERVICES
# }

# if SPECIFIC_SERVICE:
#     SERVICES_TO_UPDATE = [SPECIFIC_SERVICE]
# elif FORCE_ALL:
#     SERVICES_TO_UPDATE = ["frontend", "backend", "nginx"]
# else:
#     SERVICES_TO_UPDATE = detect_changed_services()
#     
#     if SERVICES_TO_UPDATE is empty:
#         echo "No changes detected in any service."
#         read -p "Force rebuild all services? (y/N): " force
#         if force != "y":
#             exit 0
#         SERVICES_TO_UPDATE = ["frontend", "backend"]

# -----------------------------------------------------------------------------
# 3. PRE-UPDATE CHECKS
# -----------------------------------------------------------------------------

# echo "Pre-update checks..."

# Check if Docker is running
# if ! docker info > /dev/null 2>&1:
#     echo "Docker is not running. Starting Docker Desktop..."
#     open -a Docker
#     wait_for_docker()

# Check if services are running
# RUNNING_SERVICES = docker-compose -f docker-compose.local.yml ps --services --filter "status=running"
# if RUNNING_SERVICES is empty:
#     echo "No services running. Starting environment first..."
#     ./scripts/dev-start.sh
#     exit 0

# Check for uncommitted changes (warning only)
# if git diff --quiet && git diff --staged --quiet:
#     echo "✓ No uncommitted changes"
# else:
#     echo "⚠️  Warning: You have uncommitted changes"
#     git status --short

# -----------------------------------------------------------------------------
# 4. UPDATE SERVICES
# -----------------------------------------------------------------------------

# echo ""
# echo "Services to update: ${SERVICES_TO_UPDATE[@]}"
# echo ""

# for SERVICE in SERVICES_TO_UPDATE:
#     echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
#     echo "Updating ${SERVICE}..."
#     echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
#     
#     case SERVICE:
#         "frontend":
#             update_frontend_service()
#         "backend":
#             update_backend_service()
#         "nginx":
#             update_nginx_service()
#         default:
#             update_generic_service(SERVICE)

# -----------------------------------------------------------------------------
# 5. SERVICE UPDATE FUNCTIONS
# -----------------------------------------------------------------------------

# function update_frontend_service() {
#     echo "Updating frontend service..."
#     
#     # Check if package.json changed
#     if FRONTEND_DEPS_CHANGED or NO_CACHE:
#         echo "Dependencies changed, rebuilding from scratch..."
#         
#         # Stop the service
#         docker-compose -f docker-compose.local.yml stop frontend
#         
#         # Remove the old container
#         docker-compose -f docker-compose.local.yml rm -f frontend
#         
#         # Rebuild without cache
#         docker-compose -f docker-compose.local.yml build --no-cache frontend
#         
#         # Start with fresh node_modules
#         docker-compose -f docker-compose.local.yml up -d frontend
#         
#         # Install dependencies
#         docker-compose -f docker-compose.local.yml exec frontend npm install
#     else:
#         echo "Code changes only, hot-reload should handle it..."
#         
#         # For Vite/React, hot reload should work automatically
#         # But we can force a rebuild if needed
#         if NO_CACHE:
#             docker-compose -f docker-compose.local.yml build --no-cache frontend
#         else:
#             docker-compose -f docker-compose.local.yml build frontend
#         
#         docker-compose -f docker-compose.local.yml up -d frontend
#     
#     # Wait for service to be ready
#     wait_for_service "http://localhost:8036" "Frontend"
# }

# function update_backend_service() {
#     echo "Updating backend service..."
#     
#     # Check if requirements.txt changed
#     if BACKEND_DEPS_CHANGED or NO_CACHE:
#         echo "Dependencies changed, rebuilding from scratch..."
#         
#         # Stop the service
#         docker-compose -f docker-compose.local.yml stop backend
#         
#         # Remove the old container
#         docker-compose -f docker-compose.local.yml rm -f backend
#         
#         # Rebuild without cache
#         docker-compose -f docker-compose.local.yml build --no-cache backend
#     else:
#         echo "Code changes only, rebuilding..."
#         docker-compose -f docker-compose.local.yml build backend
#     
#     # Restart the service
#     docker-compose -f docker-compose.local.yml up -d backend
#     
#     # Check if migrations are needed
#     if alembic changes detected:
#         echo "Running database migrations..."
#         docker-compose -f docker-compose.local.yml exec backend alembic upgrade head
#     
#     # Wait for service to be ready
#     wait_for_service "http://localhost:3036/health" "Backend"
# }

# function update_nginx_service() {
#     echo "Updating nginx configuration..."
#     
#     # Test nginx config first
#     docker-compose -f docker-compose.local.yml exec nginx nginx -t
#     
#     if config test passed:
#         # Reload nginx without downtime
#         docker-compose -f docker-compose.local.yml exec nginx nginx -s reload
#         echo "✓ Nginx configuration reloaded"
#     else:
#         echo "✗ Nginx configuration invalid!"
#         exit 1
# }

# -----------------------------------------------------------------------------
# 6. POST-UPDATE TASKS
# -----------------------------------------------------------------------------

# echo ""
# echo "Running post-update tasks..."

# Run tests if they exist
# if exists ./scripts/run-tests.sh:
#     read -p "Run tests? (y/N): " run_tests
#     if run_tests == "y":
#         ./scripts/run-tests.sh

# Clear caches if needed
# if SERVICE includes "backend":
#     echo "Clearing Python cache..."
#     find ./backend -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
#     docker-compose -f docker-compose.local.yml exec backend python -c "import sys; sys.stdout.write('Cache cleared\n')"

# if SERVICE includes "frontend":
#     echo "Clearing frontend build cache..."
#     docker-compose -f docker-compose.local.yml exec frontend npm run clean 2>/dev/null || true

# -----------------------------------------------------------------------------
# 7. VERIFICATION
# -----------------------------------------------------------------------------

# echo ""
# echo "Verifying services..."

# ALL_HEALTHY = true
# for SERVICE in SERVICES_TO_UPDATE:
#     if check_service_health(SERVICE):
#         echo "✓ ${SERVICE} is healthy"
#     else:
#         echo "✗ ${SERVICE} is not responding properly"
#         ALL_HEALTHY = false

# -----------------------------------------------------------------------------
# 8. DISPLAY RESULTS
# -----------------------------------------------------------------------------

# echo ""
# echo "════════════════════════════════════════"
# if ALL_HEALTHY:
#     echo "   ✓ Update completed successfully!"
# else:
#     echo "   ⚠️  Update completed with warnings"
# echo "════════════════════════════════════════"
# echo ""
# echo "Updated services: ${SERVICES_TO_UPDATE[@]}"
# echo ""

# Show logs if there were issues
# if ! ALL_HEALTHY:
#     echo "Showing recent logs for problematic services..."
#     for SERVICE in SERVICES_TO_UPDATE:
#         if ! check_service_health(SERVICE):
#             docker-compose -f docker-compose.local.yml logs --tail=20 SERVICE

# Offer to show logs
# read -p "Show logs for updated services? (y/N): " show_logs
# if show_logs == "y":
#     docker-compose -f docker-compose.local.yml logs -f ${SERVICES_TO_UPDATE[@]}
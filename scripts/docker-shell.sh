#!/bin/bash
# ==============================================================================
# docker-shell.sh - Interactive shell access to Docker containers
# ==============================================================================
# Purpose: Provide easy shell access to running containers
# Usage: ./scripts/docker-shell.sh [service] [command]
# Examples:
#   ./scripts/docker-shell.sh                    # Show service menu
#   ./scripts/docker-shell.sh backend            # Shell into backend container
#   ./scripts/docker-shell.sh postgres psql      # Run psql in postgres container
# ==============================================================================

# PSEUDO-CODE - To be implemented with actual bash commands

# -----------------------------------------------------------------------------
# 1. CONFIGURATION
# -----------------------------------------------------------------------------

# SERVICE="$1"
# COMMAND="$2"
# COMPOSE_FILE="docker-compose.local.yml"

# Service configurations
# SERVICE_CONFIGS = {
#     "backend": {
#         "shell": "/bin/bash",
#         "work_dir": "/app",
#         "common_commands": ["python", "alembic", "pip", "pytest"]
#     },
#     "frontend": {
#         "shell": "/bin/sh",  # Alpine Linux uses sh
#         "work_dir": "/app", 
#         "common_commands": ["npm", "node", "yarn"]
#     },
#     "postgres": {
#         "shell": "psql -U magnetiq -d magnetiq",
#         "work_dir": "/",
#         "common_commands": ["psql", "pg_dump", "createdb"]
#     },
#     "redis": {
#         "shell": "redis-cli",
#         "work_dir": "/",
#         "common_commands": ["redis-cli", "redis-server"]
#     },
#     "nginx": {
#         "shell": "/bin/sh",
#         "work_dir": "/etc/nginx",
#         "common_commands": ["nginx", "cat"]
#     }
# }

# -----------------------------------------------------------------------------
# 2. SERVICE DISCOVERY
# -----------------------------------------------------------------------------

# function get_available_services() {
#     # Get all services from docker-compose
#     ALL_SERVICES = docker-compose -f COMPOSE_FILE config --services
#     
#     # Filter only running services
#     RUNNING_SERVICES = ()
#     
#     for service in ALL_SERVICES:
#         if docker-compose -f COMPOSE_FILE ps service | grep -q "Up":
#             RUNNING_SERVICES.add(service)
#     
#     return RUNNING_SERVICES
# }

# function show_service_menu() {
#     AVAILABLE_SERVICES = get_available_services()
#     
#     if AVAILABLE_SERVICES is empty:
#         echo "No services are currently running."
#         echo "Start services with: ./scripts/dev-start.sh"
#         exit 1
#     
#     echo "Available services:"
#     echo "───────────────────────────────────────"
#     
#     for i, service in enumerate(AVAILABLE_SERVICES):
#         SERVICE_STATUS = docker-compose -f COMPOSE_FILE ps service --format "{{.Status}}"
#         echo "  ${i+1}) ${service} (${SERVICE_STATUS})"
#         
#         # Show common commands for this service
#         if service in SERVICE_CONFIGS:
#             COMMON_COMMANDS = SERVICE_CONFIGS[service].common_commands
#             echo "     Common: ${COMMON_COMMANDS[@]}"
#     
#     echo "  q) Quit"
#     echo ""
#     
#     read -p "Select a service (1-${#AVAILABLE_SERVICES[@]}): " choice
#     
#     case choice:
#         q|Q:
#             exit 0
#         [1-9]*:
#             if choice <= ${#AVAILABLE_SERVICES[@]}:
#                 SERVICE = AVAILABLE_SERVICES[choice-1]
#                 return SERVICE
#             else:
#                 echo "Invalid choice"
#                 exit 1
#         default:
#             echo "Invalid choice"
#             exit 1
# }

# -----------------------------------------------------------------------------
# 3. SHELL CONNECTION FUNCTIONS
# -----------------------------------------------------------------------------

# function connect_to_service(service, command="") {
#     echo "Connecting to ${service}..."
#     
#     # Check if service is running
#     if ! docker-compose -f COMPOSE_FILE ps service | grep -q "Up":
#         echo "Service '${service}' is not running."
#         echo "Start it with: docker-compose -f ${COMPOSE_FILE} up -d ${service}"
#         exit 1
#     
#     # Get service configuration
#     if service in SERVICE_CONFIGS:
#         CONFIG = SERVICE_CONFIGS[service]
#         DEFAULT_SHELL = CONFIG.shell
#         WORK_DIR = CONFIG.work_dir
#     else:
#         DEFAULT_SHELL = "/bin/bash"
#         WORK_DIR = "/"
#     
#     # Determine what to execute
#     if command is not empty:
#         execute_command_in_service(service, command, WORK_DIR)
#     else:
#         open_interactive_shell(service, DEFAULT_SHELL, WORK_DIR)
# }

# function open_interactive_shell(service, shell, work_dir) {
#     echo "Opening interactive shell in ${service}..."
#     echo "Working directory: ${work_dir}"
#     echo "Shell: ${shell}"
#     echo ""
#     echo "Type 'exit' to return to host shell"
#     echo "───────────────────────────────────────"
#     
#     case service:
#         "postgres":
#             # Special handling for PostgreSQL
#             docker-compose -f COMPOSE_FILE exec service psql -U magnetiq -d magnetiq
#         
#         "redis":
#             # Special handling for Redis
#             docker-compose -f COMPOSE_FILE exec service redis-cli
#         
#         default:
#             # Standard shell access
#             docker-compose -f COMPOSE_FILE exec --workdir=work_dir service shell
# }

# function execute_command_in_service(service, command, work_dir) {
#     echo "Executing: ${command}"
#     echo "Service: ${service}"
#     echo "───────────────────────────────────────"
#     
#     # Execute the command
#     docker-compose -f COMPOSE_FILE exec --workdir=work_dir service sh -c "command"
#     
#     COMMAND_EXIT_CODE = $?
#     
#     echo ""
#     echo "Command completed with exit code: ${COMMAND_EXIT_CODE}"
# }

# -----------------------------------------------------------------------------
# 4. SPECIALIZED SERVICE FUNCTIONS
# -----------------------------------------------------------------------------

# function postgres_helper() {
#     echo "PostgreSQL Helper"
#     echo "════════════════════════════════════════"
#     echo ""
#     echo "Quick commands:"
#     echo "  1) Open psql shell"
#     echo "  2) Show databases"
#     echo "  3) Show tables"
#     echo "  4) Show user count"
#     echo "  5) Database size"
#     echo "  6) Active connections"
#     echo "  7) Custom SQL query"
#     echo ""
#     read -p "Choose an option: " pg_choice
#     
#     case pg_choice:
#         1:
#             docker-compose -f COMPOSE_FILE exec postgres psql -U magnetiq -d magnetiq
#         2:
#             docker-compose -f COMPOSE_FILE exec postgres psql -U postgres -c "\l"
#         3:
#             docker-compose -f COMPOSE_FILE exec postgres psql -U magnetiq -d magnetiq -c "\dt"
#         4:
#             docker-compose -f COMPOSE_FILE exec postgres \
#                 psql -U magnetiq -d magnetiq -c "SELECT COUNT(*) FROM users;"
#         5:
#             docker-compose -f COMPOSE_FILE exec postgres \
#                 psql -U magnetiq -d magnetiq -c "SELECT pg_size_pretty(pg_database_size('magnetiq'));"
#         6:
#             docker-compose -f COMPOSE_FILE exec postgres \
#                 psql -U magnetiq -d magnetiq -c "SELECT count(*) FROM pg_stat_activity;"
#         7:
#             read -p "Enter SQL query: " sql_query
#             docker-compose -f COMPOSE_FILE exec postgres \
#                 psql -U magnetiq -d magnetiq -c "sql_query"
# }

# function backend_helper() {
#     echo "Backend (Python/FastAPI) Helper"
#     echo "════════════════════════════════════════"
#     echo ""
#     echo "Quick commands:"
#     echo "  1) Python shell"
#     echo "  2) Run tests"
#     echo "  3) Database migration status"
#     echo "  4) Create new migration"
#     echo "  5) Install dependencies"
#     echo "  6) Check app configuration"
#     echo "  7) View recent logs"
#     echo ""
#     read -p "Choose an option: " backend_choice
#     
#     case backend_choice:
#         1:
#             docker-compose -f COMPOSE_FILE exec backend python
#         2:
#             docker-compose -f COMPOSE_FILE exec backend pytest
#         3:
#             docker-compose -f COMPOSE_FILE exec backend alembic current
#         4:
#             read -p "Migration description: " migration_desc
#             docker-compose -f COMPOSE_FILE exec backend \
#                 alembic revision --autogenerate -m "migration_desc"
#         5:
#             docker-compose -f COMPOSE_FILE exec backend pip install -r requirements.txt
#         6:
#             docker-compose -f COMPOSE_FILE exec backend \
#                 python -c "from app.core.config import settings; print(settings.dict())"
#         7:
#             docker-compose -f COMPOSE_FILE logs --tail=50 backend
# }

# function frontend_helper() {
#     echo "Frontend (React/Node) Helper"
#     echo "════════════════════════════════════════"
#     echo ""
#     echo "Quick commands:"
#     echo "  1) Node.js shell"
#     echo "  2) Install dependencies"
#     echo "  3) Run build"
#     echo "  4) Run linter"
#     echo "  5) Run tests"
#     echo "  6) Check bundle size"
#     echo "  7) Clear cache"
#     echo ""
#     read -p "Choose an option: " frontend_choice
#     
#     case frontend_choice:
#         1:
#             docker-compose -f COMPOSE_FILE exec frontend sh
#         2:
#             docker-compose -f COMPOSE_FILE exec frontend npm install
#         3:
#             docker-compose -f COMPOSE_FILE exec frontend npm run build
#         4:
#             docker-compose -f COMPOSE_FILE exec frontend npm run lint
#         5:
#             docker-compose -f COMPOSE_FILE exec frontend npm test
#         6:
#             docker-compose -f COMPOSE_FILE exec frontend \
#                 sh -c "npm run build && du -sh dist/*"
#         7:
#             docker-compose -f COMPOSE_FILE exec frontend npm cache clean --force
# }

# -----------------------------------------------------------------------------
# 5. UTILITY FUNCTIONS
# -----------------------------------------------------------------------------

# function show_service_info(service) {
#     echo "Service Information: ${service}"
#     echo "════════════════════════════════════════"
#     
#     # Basic container info
#     CONTAINER_ID = docker-compose -f COMPOSE_FILE ps -q service
#     
#     if CONTAINER_ID:
#         # Get detailed container information
#         CONTAINER_INFO = docker inspect CONTAINER_ID
#         
#         echo "Container ID: ${CONTAINER_ID}"
#         echo "Image: $(echo CONTAINER_INFO | jq -r '.[0].Config.Image')"
#         echo "Status: $(echo CONTAINER_INFO | jq -r '.[0].State.Status')"
#         echo "Started: $(echo CONTAINER_INFO | jq -r '.[0].State.StartedAt')"
#         
#         # Network information
#         echo ""
#         echo "Network Information:"
#         echo "IP Address: $(echo CONTAINER_INFO | jq -r '.[0].NetworkSettings.IPAddress')"
#         
#         # Port mappings
#         echo ""
#         echo "Port Mappings:"
#         docker-compose -f COMPOSE_FILE ps service --format "table {{.Ports}}"
#         
#         # Resource usage
#         echo ""
#         echo "Resource Usage:"
#         docker stats CONTAINER_ID --no-stream --format \
#             "CPU: {{.CPUPerc}}, Memory: {{.MemUsage}}, Network: {{.NetIO}}"
#     else:
#         echo "Service is not running"
# }

# function list_available_commands(service) {
#     echo "Available commands in ${service}:"
#     echo "────────────────────────────────────────"
#     
#     case service:
#         "backend":
#             echo "Python commands:"
#             docker-compose -f COMPOSE_FILE exec service python --version
#             echo "Available packages:"
#             docker-compose -f COMPOSE_FILE exec service pip list | head -10
#             echo "Alembic commands:"
#             docker-compose -f COMPOSE_FILE exec service alembic --help | head -5
#         
#         "frontend":
#             echo "Node.js version:"
#             docker-compose -f COMPOSE_FILE exec service node --version
#             echo "NPM version:"
#             docker-compose -f COMPOSE_FILE exec service npm --version
#             echo "Available scripts:"
#             docker-compose -f COMPOSE_FILE exec service npm run
#         
#         "postgres":
#             echo "PostgreSQL version:"
#             docker-compose -f COMPOSE_FILE exec service psql --version
#             echo "Available utilities:"
#             echo "  psql, pg_dump, pg_restore, createdb, dropdb"
#         
#         default:
#             echo "Standard shell commands available"
#             docker-compose -f COMPOSE_FILE exec service sh -c "which bash sh ls cat grep" | head -5
# }

# -----------------------------------------------------------------------------
# 6. MAIN EXECUTION
# -----------------------------------------------------------------------------

# # If no service specified, show menu
# if SERVICE is empty:
#     SERVICE = show_service_menu()

# # Validate service exists and is running
# AVAILABLE_SERVICES = get_available_services()

# if SERVICE not in AVAILABLE_SERVICES:
#     echo "Service '${SERVICE}' is not available or not running."
#     echo ""
#     echo "Available services: ${AVAILABLE_SERVICES[@]}"
#     exit 1

# # Show service info if verbose
# if "$1" == "--info":
#     show_service_info(SERVICE)
#     exit 0

# # Handle special helper modes
# case SERVICE:
#     "postgres":
#         if COMMAND is empty:
#             postgres_helper()
#         else:
#             connect_to_service(SERVICE, COMMAND)
#     
#     "backend":
#         if COMMAND is empty:
#             backend_helper()
#         else:
#             connect_to_service(SERVICE, COMMAND)
#     
#     "frontend":
#         if COMMAND is empty:
#             frontend_helper()
#         else:
#             connect_to_service(SERVICE, COMMAND)
#     
#     default:
#         connect_to_service(SERVICE, COMMAND)

# echo ""
# echo "Shell session ended. You're back on the host system."
#!/bin/bash
# ==============================================================================
# health-check.sh - Comprehensive SQLite development environment health monitoring
# ==============================================================================
# Purpose: Check health status of local development services and SQLite database
# Usage: ./scripts/docker-health-check.sh [options]
# Options:
#   --verbose    Show detailed health information
#   --json       Output results in JSON format
#   --fix        Attempt to fix unhealthy services
#   --quiet      Only show critical issues
# ==============================================================================

# -----------------------------------------------------------------------------
# 1. CONFIGURATION
# -----------------------------------------------------------------------------

# Default settings
VERBOSE=false
JSON_OUTPUT=false
AUTO_FIX=false
QUIET=false

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Service configuration
DB_PATH="./data/magnetiq.db"
BACKEND_PORT=8037
FRONTEND_PORT=8040
BACKEND_HEALTH_ENDPOINT="http://localhost:${BACKEND_PORT}/health"
FRONTEND_ENDPOINT="http://localhost:${FRONTEND_PORT}"
API_DOCS_ENDPOINT="http://localhost:${BACKEND_PORT}/docs"

# Health check timeouts (seconds)
HTTP_TIMEOUT=10
DB_TIMEOUT=5
PROCESS_TIMEOUT=3

# Parse arguments
for arg in "$@"; do
    case $arg in
        --verbose)
            VERBOSE=true
            ;;
        --json)
            JSON_OUTPUT=true
            ;;
        --fix)
            AUTO_FIX=true
            ;;
        --quiet)
            QUIET=true
            ;;
        --help)
            show_help
            exit 0
            ;;
    esac
done

# -----------------------------------------------------------------------------
# 2. SERVICE DISCOVERY AND HELP
# -----------------------------------------------------------------------------

function show_help() {
    echo "Usage: ./scripts/docker-health-check.sh [options]"
    echo ""
    echo "SQLite Development Environment Health Check"
    echo ""
    echo "Options:"
    echo "  --verbose    Show detailed health information"
    echo "  --json       Output results in JSON format"
    echo "  --fix        Attempt to fix unhealthy services"
    echo "  --quiet      Only show critical issues"
    echo "  --help       Show this help message"
    echo ""
    echo "Checks:"
    echo "  • SQLite database accessibility and integrity"
    echo "  • Backend server (Python/uvicorn) on port $BACKEND_PORT"
    echo "  • Frontend server (npm/vite) on port $FRONTEND_PORT"
    echo "  • Process health and resource usage"
    echo "  • File system permissions and disk space"
}

function get_running_services() {
    local services=()
    
    # Check if database exists
    if [ -f "$DB_PATH" ]; then
        services+=("database")
    fi
    
    # Check if backend is running
    if lsof -ti :$BACKEND_PORT >/dev/null 2>&1; then
        services+=("backend")
    fi
    
    # Check if frontend is running
    if lsof -ti :$FRONTEND_PORT >/dev/null 2>&1; then
        services+=("frontend")
    fi
    
    echo "${services[@]}"
}

function get_service_info() {
    local service="$1"
    local info
    
    case $service in
        "database")
            if [ -f "$DB_PATH" ]; then
                local db_size=$(ls -lah "$DB_PATH" | awk '{print $5}')
                local db_modified=$(stat -f %Sm "$DB_PATH" 2>/dev/null || stat -c %y "$DB_PATH" 2>/dev/null)
                info="SQLite database (${db_size}) - Modified: ${db_modified}"
            else
                info="Database file not found"
            fi
            ;;
        "backend")
            local pid=$(lsof -ti :$BACKEND_PORT 2>/dev/null)
            if [ -n "$pid" ]; then
                local process_info=$(ps -p "$pid" -o pid,ppid,etime,cmd --no-headers 2>/dev/null || echo "Process info unavailable")
                info="Backend server (PID: $pid) - $process_info"
            else
                info="Backend server not running"
            fi
            ;;
        "frontend")
            local pid=$(lsof -ti :$FRONTEND_PORT 2>/dev/null)
            if [ -n "$pid" ]; then
                local process_info=$(ps -p "$pid" -o pid,ppid,etime,cmd --no-headers 2>/dev/null || echo "Process info unavailable")
                info="Frontend server (PID: $pid) - $process_info"
            else
                info="Frontend server not running"
            fi
            ;;
        *)
            info="Unknown service: $service"
            ;;
    esac
    
    echo "$info"
}

# -----------------------------------------------------------------------------
# 3. HEALTH CHECK FUNCTIONS
# -----------------------------------------------------------------------------

function check_service_health() {
    local service="$1"
    local status="unknown"
    local message=""
    local details=""
    
    case $service in
        "database")
            check_sqlite_health
            ;;
        "backend")
            check_backend_health
            ;;
        "frontend")
            check_frontend_health
            ;;
        *)
            echo "status=unknown;message=Unknown service: $service"
            ;;
    esac
}

function check_http_health() {
    local endpoint="$1"
    local service_name="$2"
    
    [ "$QUIET" != true ] && echo "  Checking HTTP endpoint: ${endpoint}"
    
    # Use curl with timeout
    local response
    response=$(curl --silent --max-time $HTTP_TIMEOUT \
                   --write-out "HTTPSTATUS:%{http_code};TIME:%{time_total}" \
                   "$endpoint" 2>/dev/null)
    
    local http_code
    local time_total
    http_code=$(echo "$response" | grep -o "HTTPSTATUS:[0-9]*" | cut -d: -f2)
    time_total=$(echo "$response" | grep -o "TIME:[0-9.]*" | cut -d: -f2)
    
    if [ -n "$http_code" ] && [ "$http_code" -ge 200 ] && [ "$http_code" -lt 400 ]; then
        echo "status=healthy;http_code=$http_code;response_time=${time_total}s;message=OK"
    else
        local error_msg="HTTP error"
        [ -z "$http_code" ] && error_msg="Connection failed"
        echo "status=unhealthy;http_code=${http_code:-0};response_time=${time_total:-0}s;message=$error_msg"
    fi
}

function check_sqlite_health() {
    [ "$QUIET" != true ] && echo "  Checking SQLite database..."
    
    if [ ! -f "$DB_PATH" ]; then
        echo "status=warning;message=Database file does not exist;database_size=0;tables=0"
        return
    fi
    
    # Check if SQLite can access the database
    if ! sqlite3 "$DB_PATH" "SELECT 1;" >/dev/null 2>&1; then
        echo "status=unhealthy;message=Cannot access SQLite database;database_size=0;tables=0"
        return
    fi
    
    # Get database statistics
    local db_size
    local table_count
    local integrity_check
    
    db_size=$(ls -lah "$DB_PATH" | awk '{print $5}')
    table_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "0")
    integrity_check=$(sqlite3 "$DB_PATH" "PRAGMA integrity_check;" 2>/dev/null | head -1)
    
    if [ "$integrity_check" = "ok" ]; then
        echo "status=healthy;database_size=$db_size;tables=$table_count;message=SQLite database is healthy"
    else
        echo "status=unhealthy;database_size=$db_size;tables=$table_count;message=Database integrity issues detected"
    fi
}

function check_backend_health() {
    [ "$QUIET" != true ] && echo "  Checking backend server..."
    
    local pid
    pid=$(lsof -ti :$BACKEND_PORT 2>/dev/null)
    
    if [ -z "$pid" ]; then
        echo "status=unhealthy;message=Backend server not running;port=$BACKEND_PORT;pid=0"
        return
    fi
    
    # Check if process is actually running
    if ! kill -0 "$pid" 2>/dev/null; then
        echo "status=unhealthy;message=Backend process not responding;port=$BACKEND_PORT;pid=$pid"
        return
    fi
    
    # Try health endpoint first, fallback to basic HTTP check
    local health_result
    health_result=$(check_http_health "$BACKEND_HEALTH_ENDPOINT" "backend")
    
    if echo "$health_result" | grep -q "status=healthy"; then
        echo "$health_result;port=$BACKEND_PORT;pid=$pid"
    else
        # Fallback to basic connection test
        health_result=$(check_http_health "http://localhost:$BACKEND_PORT" "backend")
        echo "$health_result;port=$BACKEND_PORT;pid=$pid"
    fi
}

function check_frontend_health() {
    [ "$QUIET" != true ] && echo "  Checking frontend server..."
    
    local pid
    pid=$(lsof -ti :$FRONTEND_PORT 2>/dev/null)
    
    if [ -z "$pid" ]; then
        echo "status=unhealthy;message=Frontend server not running;port=$FRONTEND_PORT;pid=0"
        return
    fi
    
    # Check if process is actually running
    if ! kill -0 "$pid" 2>/dev/null; then
        echo "status=unhealthy;message=Frontend process not responding;port=$FRONTEND_PORT;pid=$pid"
        return
    fi
    
    # Check HTTP endpoint
    local health_result
    health_result=$(check_http_health "$FRONTEND_ENDPOINT" "frontend")
    echo "$health_result;port=$FRONTEND_PORT;pid=$pid"
}

# -----------------------------------------------------------------------------
# 4. DIAGNOSTIC FUNCTIONS
# -----------------------------------------------------------------------------

function get_service_diagnostics() {
    local service="$1"
    local diagnostics=""
    
    case $service in
        "database")
            diagnostics=$(get_database_diagnostics)
            ;;
        "backend"|"frontend")
            local pid
            pid=$(lsof -ti :$([ "$service" = "backend" ] && echo "$BACKEND_PORT" || echo "$FRONTEND_PORT") 2>/dev/null)
            if [ -n "$pid" ]; then
                diagnostics=$(get_process_diagnostics "$pid" "$service")
            else
                diagnostics="process_status=not_running;cpu_usage=0;memory_usage=0"
            fi
            ;;
        *)
            diagnostics="diagnostics=unavailable"
            ;;
    esac
    
    echo "$diagnostics"
}

function get_database_diagnostics() {
    if [ ! -f "$DB_PATH" ]; then
        echo "file_exists=false;size=0;permissions=none;disk_space=unknown"
        return
    fi
    
    # Get file statistics
    local file_size
    local file_permissions
    local disk_space
    local last_modified
    
    file_size=$(ls -lah "$DB_PATH" | awk '{print $5}')
    file_permissions=$(ls -la "$DB_PATH" | awk '{print $1}')
    last_modified=$(stat -f %Sm "$DB_PATH" 2>/dev/null || stat -c %y "$DB_PATH" 2>/dev/null || echo "unknown")
    
    # Check available disk space
    disk_space=$(df -h "$(dirname "$DB_PATH")" | tail -1 | awk '{print "used:"$3";available:"$4";usage:"$5}')
    
    echo "file_exists=true;size=$file_size;permissions=$file_permissions;disk_space=$disk_space;last_modified=$last_modified"
}

function get_process_diagnostics() {
    local pid="$1"
    local service="$2"
    
    if ! kill -0 "$pid" 2>/dev/null; then
        echo "process_status=dead;cpu_usage=0;memory_usage=0;uptime=0"
        return
    fi
    
    # Get process statistics (works on both macOS and Linux)
    local cpu_usage="unknown"
    local memory_usage="unknown"
    local uptime="unknown"
    
    if command -v ps >/dev/null 2>&1; then
        # Try to get CPU and memory usage
        local process_stats
        process_stats=$(ps -p "$pid" -o pid,pcpu,pmem,etime --no-headers 2>/dev/null)
        
        if [ -n "$process_stats" ]; then
            cpu_usage=$(echo "$process_stats" | awk '{print $2"%"}')
            memory_usage=$(echo "$process_stats" | awk '{print $3"%"}')
            uptime=$(echo "$process_stats" | awk '{print $4}')
        fi
    fi
    
    echo "process_status=running;cpu_usage=$cpu_usage;memory_usage=$memory_usage;uptime=$uptime;pid=$pid"
}

function get_system_diagnostics() {
    # Get overall system health information
    local load_avg="unknown"
    local disk_usage="unknown"
    local memory_total="unknown"
    
    # Load average
    if [ -f "/proc/loadavg" ]; then
        load_avg=$(cat /proc/loadavg | cut -d' ' -f1-3)
    elif command -v uptime >/dev/null 2>&1; then
        load_avg=$(uptime | grep -o 'load average.*' | cut -d' ' -f3-5 | tr -d ',')
    fi
    
    # Disk usage for current directory
    if command -v df >/dev/null 2>&1; then
        disk_usage=$(df -h . | tail -1 | awk '{print "used:"$3";available:"$4";usage:"$5}')
    fi
    
    # Memory usage
    if [ -f "/proc/meminfo" ]; then
        local mem_total=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        local mem_available=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
        memory_total="total:${mem_total}kB;available:${mem_available}kB"
    elif command -v vm_stat >/dev/null 2>&1; then  # macOS
        memory_total="macos_vm_stat=true"
    fi
    
    echo "load_average=$load_avg;disk_usage=$disk_usage;memory=$memory_total"
}

# -----------------------------------------------------------------------------
# 5. AUTO-FIX FUNCTIONS
# -----------------------------------------------------------------------------

function attempt_service_fix() {
    local service="$1"
    local health_result="$2"
    
    [ "$QUIET" != true ] && echo -e "${YELLOW}Attempting to fix ${service}...${NC}"
    
    case $service in
        "database")
            fix_database_service "$health_result"
            ;;
        "backend")
            fix_backend_service "$health_result"
            ;;
        "frontend")
            fix_frontend_service "$health_result"
            ;;
        *)
            echo -e "${RED}Unknown service: $service${NC}"
            return 1
            ;;
    esac
}

function fix_database_service() {
    local health_result="$1"
    
    if echo "$health_result" | grep -q "Database file does not exist"; then
        echo "  Creating SQLite database..."
        mkdir -p "$(dirname "$DB_PATH")"
        sqlite3 "$DB_PATH" "SELECT 1;" >/dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}  ✓ Database created successfully${NC}"
        else
            echo -e "${RED}  ✗ Failed to create database${NC}"
            return 1
        fi
    elif echo "$health_result" | grep -q "Cannot access SQLite database"; then
        echo "  Checking database permissions..."
        
        # Check if directory is writable
        local db_dir
        db_dir=$(dirname "$DB_PATH")
        
        if [ ! -w "$db_dir" ]; then
            echo "  Fixing directory permissions..."
            chmod 755 "$db_dir" 2>/dev/null
        fi
        
        if [ -f "$DB_PATH" ] && [ ! -w "$DB_PATH" ]; then
            echo "  Fixing database file permissions..."
            chmod 644 "$DB_PATH" 2>/dev/null
        fi
        
        echo -e "${GREEN}  ✓ Permissions updated${NC}"
    elif echo "$health_result" | grep -q "Database integrity issues"; then
        echo -e "${YELLOW}  ⚠️  Database integrity issues detected${NC}"
        echo "  Consider running: sqlite3 $DB_PATH '.recover' > recovered.sql"
        echo "  Then restore from backup if needed"
    fi
}

function fix_backend_service() {
    local health_result="$1"
    
    if echo "$health_result" | grep -q "Backend server not running"; then
        echo "  Starting backend server..."
        
        if [ -d "./backend" ]; then
            cd backend
            python3 -m uvicorn app.main:app --host 0.0.0.0 --port $BACKEND_PORT --reload --app-dir . &
            local pid=$!
            cd ..
            
            echo "  Backend started (PID: $pid)"
            echo $pid > .backend.pid
            
            # Wait a moment for startup
            sleep 3
            
            # Check if it's actually running
            if kill -0 "$pid" 2>/dev/null; then
                echo -e "${GREEN}  ✓ Backend service started successfully${NC}"
            else
                echo -e "${RED}  ✗ Backend failed to start${NC}"
                return 1
            fi
        else
            echo -e "${RED}  ✗ Backend directory not found${NC}"
            return 1
        fi
    elif echo "$health_result" | grep -q "Backend process not responding"; then
        echo "  Restarting unresponsive backend..."
        
        # Kill existing process
        local pid
        pid=$(lsof -ti :$BACKEND_PORT 2>/dev/null)
        if [ -n "$pid" ]; then
            kill "$pid" 2>/dev/null
            sleep 2
            kill -9 "$pid" 2>/dev/null
        fi
        
        # Restart
        fix_backend_service "pid=0;message=Backend server not running"
    fi
}

function fix_frontend_service() {
    local health_result="$1"
    
    if echo "$health_result" | grep -q "Frontend server not running"; then
        echo "  Starting frontend server..."
        
        if [ -d "./frontend" ]; then
            # Check if dependencies are installed
            if [ ! -d "./frontend/node_modules" ]; then
                echo "  Installing frontend dependencies..."
                cd frontend && npm install && cd ..
            fi
            
            cd frontend
            npm run dev &
            local pid=$!
            cd ..
            
            echo "  Frontend started (PID: $pid)"
            echo $pid > .frontend.pid
            
            # Wait a moment for startup
            sleep 5
            
            # Check if it's actually running
            if kill -0 "$pid" 2>/dev/null; then
                echo -e "${GREEN}  ✓ Frontend service started successfully${NC}"
            else
                echo -e "${RED}  ✗ Frontend failed to start${NC}"
                return 1
            fi
        else
            echo -e "${RED}  ✗ Frontend directory not found${NC}"
            return 1
        fi
    elif echo "$health_result" | grep -q "Frontend process not responding"; then
        echo "  Restarting unresponsive frontend..."
        
        # Kill existing process
        local pid
        pid=$(lsof -ti :$FRONTEND_PORT 2>/dev/null)
        if [ -n "$pid" ]; then
            kill "$pid" 2>/dev/null
            sleep 2
            kill -9 "$pid" 2>/dev/null
        fi
        
        # Restart
        fix_frontend_service "pid=0;message=Frontend server not running"
    fi
}

# -----------------------------------------------------------------------------
# 6. OUTPUT FORMATTING
# -----------------------------------------------------------------------------

function format_health_report() {
    local -A results
    local service
    local result
    
    # Parse arguments (service1:result1 service2:result2 ...)
    for arg in "$@"; do
        service=$(echo "$arg" | cut -d: -f1)
        result=$(echo "$arg" | cut -d: -f2-)
        results["$service"]="$result"
    done
    
    if [ "$JSON_OUTPUT" = true ]; then
        format_json_output results
    else
        format_console_output results
    fi
}

function format_console_output() {
    local -n results_ref=$1
    
    if [ "$QUIET" != true ]; then
        echo ""
        echo -e "${BLUE}════════════════════════════════════════════════${NC}"
        echo -e "${BLUE}   SQLite Development Environment Health Check${NC}"
        echo -e "${BLUE}════════════════════════════════════════════════${NC}"
        echo ""
    fi
    
    # Calculate overall status
    local overall_healthy=true
    local critical_issues=()
    
    for service in "${!results_ref[@]}"; do
        local result="${results_ref[$service]}"
        if echo "$result" | grep -q "status=unhealthy"; then
            overall_healthy=false
            critical_issues+=("$service")
        fi
    done
    
    if [ "$overall_healthy" = true ]; then
        echo -e "${GREEN}✓ All services are healthy${NC}"
    else
        echo -e "${RED}✗ Issues detected with: ${critical_issues[*]}${NC}"
    fi
    
    if [ "$QUIET" != true ]; then
        echo ""
        echo "Service Details:"
        echo "───────────────────────────────────────────────"
    fi
    
    for service in "${!results_ref[@]}"; do
        local result="${results_ref[$service]}"
        show_service_status "$service" "$result"
    done
    
    if [ "$QUIET" != true ]; then
        echo ""
        # Show system diagnostics
        local sys_diag
        sys_diag=$(get_system_diagnostics)
        echo "System Status:"
        echo "  $sys_diag" | tr ';' '\n' | sed 's/^/  /'
    fi
}

function show_service_status() {
    local service="$1"
    local result="$2"
    
    # Parse status from result
    local status=$(echo "$result" | grep -o 'status=[^;]*' | cut -d= -f2)
    local message=$(echo "$result" | grep -o 'message=[^;]*' | cut -d= -f2)
    
    # Choose icon and color based on status
    local icon color
    case $status in
        "healthy")
            icon="✓"
            color="$GREEN"
            ;;
        "warning")
            icon="⚠️"
            color="$YELLOW"
            ;;
        "unhealthy")
            icon="✗"
            color="$RED"
            ;;
        *)
            icon="?"
            color="$YELLOW"
            ;;
    esac
    
    if [ "$QUIET" = true ]; then
        # Only show issues in quiet mode
        if [ "$status" != "healthy" ]; then
            echo -e "${color}${icon} ${service}: ${message}${NC}"
        fi
    else
        echo -e "${color}${icon} ${service}${NC}"
        
        if [ "$VERBOSE" = true ]; then
            show_detailed_info "$service" "$result"
        else
            echo "    Status: ${status}"
            [ -n "$message" ] && echo "    Message: ${message}"
        fi
        echo ""
    fi
}

function show_detailed_info() {
    local service="$1"
    local result="$2"
    
    # Parse all fields from result
    echo "$result" | tr ';' '\n' | while IFS='=' read -r key value; do
        case $key in
            "status"|"message") ;; # Already shown
            "http_code") echo "    HTTP Code: $value" ;;
            "response_time") echo "    Response Time: $value" ;;
            "database_size") echo "    Database Size: $value" ;;
            "tables") echo "    Tables: $value" ;;
            "port") echo "    Port: $value" ;;
            "pid") echo "    Process ID: $value" ;;
            "cpu_usage") echo "    CPU Usage: $value" ;;
            "memory_usage") echo "    Memory Usage: $value" ;;
            "uptime") echo "    Uptime: $value" ;;
            "disk_space") echo "    Disk: $value" | tr ':' ' ' ;;
            *) [ -n "$value" ] && echo "    ${key}: $value" ;;
        esac
    done
    
    # Show diagnostics if verbose
    if [ "$VERBOSE" = true ]; then
        local diagnostics
        diagnostics=$(get_service_diagnostics "$service")
        if [ -n "$diagnostics" ]; then
            echo "  Diagnostics:"
            echo "$diagnostics" | tr ';' '\n' | sed 's/^/    /' | while IFS='=' read -r key value; do
                [ -n "$value" ] && echo "    ${key}: $value"
            done
        fi
    fi
}

function format_json_output() {
    local -n results_ref=$1
    
    echo "{"
    echo '  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",'
    echo '  "services": {'
    
    local first=true
    for service in "${!results_ref[@]}"; do
        [ "$first" = true ] && first=false || echo ","
        
        local result="${results_ref[$service]}"
        echo -n "    \"$service\": {"
        
        # Convert key=value;key=value format to JSON
        echo "$result" | tr ';' '\n' | while IFS='=' read -r key value; do
            echo -n "\"$key\": \"$value\", "
        done | sed 's/, $//' # Remove trailing comma
        
        echo "}"
    done
    
    echo "  }"
    echo "}"
}

# -----------------------------------------------------------------------------
# 7. MAIN EXECUTION
# -----------------------------------------------------------------------------

# Show startup message
[ "$QUIET" != true ] && echo -e "${BLUE}Starting SQLite development environment health check...${NC}"

# Get list of services to check
RUNNING_SERVICES=($(get_running_services))

# Always check core services even if not running
ALL_SERVICES=("database" "backend" "frontend")

# Health check results
declare -A HEALTH_RESULTS
OVERALL_HEALTHY=true

# Check each service
for service in "${ALL_SERVICES[@]}"; do
    [ "$QUIET" != true ] && echo "Checking ${service}..."
    
    # Get service information
    SERVICE_INFO=$(get_service_info "$service")
    
    # Perform health check
    HEALTH_STATUS=$(check_service_health "$service")
    
    # Store result
    HEALTH_RESULTS["$service"]="$HEALTH_STATUS"
    
    # Check if service is unhealthy
    if echo "$HEALTH_STATUS" | grep -q "status=unhealthy"; then
        OVERALL_HEALTHY=false
        
        # Attempt auto-fix if requested
        if [ "$AUTO_FIX" = true ]; then
            [ "$QUIET" != true ] && echo "  Service is unhealthy, attempting fix..."
            
            if attempt_service_fix "$service" "$HEALTH_STATUS"; then
                # Re-check after fix attempt
                sleep 2
                HEALTH_STATUS=$(check_service_health "$service")
                HEALTH_RESULTS["$service"]="$HEALTH_STATUS"
                
                # Update overall health status
                if echo "$HEALTH_STATUS" | grep -q "status=healthy"; then
                    [ "$QUIET" != true ] && echo -e "${GREEN}  ✓ Service fixed successfully${NC}"
                else
                    [ "$QUIET" != true ] && echo -e "${YELLOW}  ⚠️  Service partially fixed or still has issues${NC}"
                fi
            else
                [ "$QUIET" != true ] && echo -e "${RED}  ✗ Failed to fix service${NC}"
            fi
        fi
    fi
done

# Convert results to format expected by format_health_report
RESULT_ARGS=()
for service in "${!HEALTH_RESULTS[@]}"; do
    RESULT_ARGS+=("$service:${HEALTH_RESULTS[$service]}")
done

# Display results
format_health_report "${RESULT_ARGS[@]}"

# Show recommendations based on results
if [ "$OVERALL_HEALTHY" != true ] && [ "$QUIET" != true ]; then
    echo ""
    echo -e "${YELLOW}Recommendations:${NC}"
    
    # Check if services are not running
    if ! echo "${HEALTH_RESULTS[database]}" | grep -q "status=healthy" && \
       ! echo "${HEALTH_RESULTS[backend]}" | grep -q "status=healthy" && \
       ! echo "${HEALTH_RESULTS[frontend]}" | grep -q "status=healthy"; then
        echo "  • Start development environment: ./scripts/dev-start.sh"
    fi
    
    # Database-specific recommendations
    if echo "${HEALTH_RESULTS[database]}" | grep -q "Database file does not exist"; then
        echo "  • Initialize database: ./scripts/update-data.sh migrate"
    fi
    
    # Service-specific recommendations
    if echo "${HEALTH_RESULTS[backend]}" | grep -q "Backend server not running"; then
        echo "  • Start backend only: ./scripts/dev-start.sh --backend-only"
    fi
    
    if echo "${HEALTH_RESULTS[frontend]}" | grep -q "Frontend server not running"; then
        echo "  • Start frontend only: ./scripts/dev-start.sh --frontend-only"
    fi
    
    echo "  • Auto-fix issues: $0 --fix"
    echo "  • Verbose diagnostics: $0 --verbose"
fi

# Final status message
if [ "$OVERALL_HEALTHY" = true ]; then
    [ "$QUIET" != true ] && echo -e "\n${GREEN}✓ All systems operational!${NC}"
    exit 0
else
    [ "$QUIET" != true ] && echo -e "\n${RED}✗ Issues detected. See details above.${NC}"
    exit 1
fi
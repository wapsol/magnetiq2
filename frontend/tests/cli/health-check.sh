#!/bin/bash
#
# CLI Health Check Scripts for Booking System
#
# Provides command-line tools to verify system health and functionality:
# - Service availability checks
# - Database connectivity tests  
# - API endpoint validation
# - Quick smoke tests for booking system
# - Performance monitoring
# - Log analysis
#
# Usage: ./tests/cli/health-check.sh [command] [options]
#
# Commands:
#   all           - Run all health checks
#   services      - Check all services are running
#   database      - Verify database connectivity
#   api           - Test API endpoints
#   booking       - Quick booking system test
#   performance   - Check response times
#   logs          - Analyze recent logs for errors
#
# Examples:
#   ./tests/cli/health-check.sh all
#   ./tests/cli/health-check.sh services --verbose
#   ./tests/cli/health-check.sh api --endpoint="/api/v1/consultations/public/consultants/active"
#

set -e

# Configuration
FRONTEND_URL="http://localhost:8040"
BACKEND_URL="http://localhost:8037"
DB_NAME="magnetiq"
LOG_DIR="./logs"
TIMEOUT=10
VERBOSE=false

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

print_separator() {
    echo "=================================================="
}

# Check if service is running on specific port
check_service() {
    local service_name="$1"
    local port="$2"
    local url="$3"
    
    log_info "Checking $service_name service..."
    
    # Check if port is listening
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_success "$service_name is running on port $port"
    else
        log_error "$service_name is not running on port $port"
        return 1
    fi
    
    # Check HTTP response if URL provided
    if [ -n "$url" ]; then
        if curl -s --max-time $TIMEOUT "$url" >/dev/null; then
            log_success "$service_name HTTP endpoint is responding"
        else
            log_error "$service_name HTTP endpoint is not responding at $url"
            return 1
        fi
    fi
    
    return 0
}

# Check all services
check_services() {
    log_info "=== SERVICE HEALTH CHECK ==="
    
    local all_healthy=true
    
    # Check frontend (Vite dev server)
    if ! check_service "Frontend" "8040" "$FRONTEND_URL"; then
        all_healthy=false
    fi
    
    # Check backend (FastAPI)
    if ! check_service "Backend API" "8037" "$BACKEND_URL/health"; then
        all_healthy=false
    fi
    
    # Check if backend docs are accessible
    if curl -s --max-time $TIMEOUT "$BACKEND_URL/docs" >/dev/null; then
        log_success "Backend API docs are accessible"
    else
        log_warning "Backend API docs not accessible at $BACKEND_URL/docs"
    fi
    
    if $all_healthy; then
        log_success "All services are healthy"
        return 0
    else
        log_error "Some services are not healthy"
        return 1
    fi
}

# Check database connectivity
check_database() {
    log_info "=== DATABASE CONNECTIVITY CHECK ==="
    
    # Check if database file exists (SQLite)
    if [ -f "../data/magnetiq.db" ]; then
        log_success "Database file exists at ../data/magnetiq.db"
        
        # Test basic query
        if command -v sqlite3 >/dev/null 2>&1; then
            if sqlite3 "../data/magnetiq.db" "SELECT 1;" >/dev/null 2>&1; then
                log_success "Database is accessible and responsive"
            else
                log_error "Database file exists but is not accessible"
                return 1
            fi
        else
            log_warning "sqlite3 not available - cannot test database queries"
        fi
    else
        log_warning "Database file not found at ../data/magnetiq.db"
    fi
    
    # Test database via API
    if curl -s --max-time $TIMEOUT "$BACKEND_URL/api/v1/consultations/public/consultants/active" | grep -q '"success":true'; then
        log_success "Database accessible via API"
        return 0
    else
        log_error "Database not accessible via API"
        return 1
    fi
}

# Test API endpoints
check_api() {
    log_info "=== API ENDPOINTS CHECK ==="
    
    local endpoint="$1"
    local all_healthy=true
    
    # Define critical endpoints to test
    local endpoints=(
        "/api/v1/consultations/public/consultants/active"
        "/api/v1/consultations/public/consultants/1/availability"
        "/health"
    )
    
    # If specific endpoint provided, test only that
    if [ -n "$endpoint" ]; then
        endpoints=("$endpoint")
    fi
    
    for ep in "${endpoints[@]}"; do
        log_info "Testing endpoint: $ep"
        
        local response=$(curl -s --max-time $TIMEOUT -w "%{http_code}" "$BACKEND_URL$ep")
        local http_code="${response: -3}"
        local body="${response%???}"
        
        case $http_code in
            200)
                log_success "$ep returned HTTP $http_code"
                if $VERBOSE && [ -n "$body" ]; then
                    echo "Response preview: ${body:0:100}..."
                fi
                ;;
            404)
                log_warning "$ep returned HTTP $http_code (Not Found)"
                ;;
            *)
                log_error "$ep returned HTTP $http_code"
                all_healthy=false
                ;;
        esac
    done
    
    if $all_healthy; then
        log_success "All API endpoints are healthy"
        return 0
    else
        log_error "Some API endpoints are not healthy"
        return 1
    fi
}

# Quick booking system smoke test
check_booking_system() {
    log_info "=== BOOKING SYSTEM SMOKE TEST ==="
    
    # Test consultant retrieval
    log_info "Testing consultant retrieval..."
    local consultants_response=$(curl -s --max-time $TIMEOUT "$BACKEND_URL/api/v1/consultations/public/consultants/active")
    
    if echo "$consultants_response" | jq -e '.success == true' >/dev/null 2>&1; then
        local consultant_count=$(echo "$consultants_response" | jq '.data.total')
        if [ "$consultant_count" = "2" ]; then
            log_success "Consultant retrieval working - found $consultant_count consultants"
        else
            log_warning "Expected 2 consultants, found $consultant_count"
        fi
    else
        log_error "Consultant retrieval failed"
        return 1
    fi
    
    # Test availability check for first consultant
    log_info "Testing availability check..."
    local consultant_id=$(echo "$consultants_response" | jq -r '.data.consultants[0].id')
    local tomorrow=$(date -d "+1 day" +%Y-%m-%d)
    
    local availability_response=$(curl -s --max-time $TIMEOUT \
        "$BACKEND_URL/api/v1/consultations/public/consultants/$consultant_id/availability?target_date=$tomorrow&timezone=Europe/Berlin")
    
    if echo "$availability_response" | jq -e '.success == true' >/dev/null 2>&1; then
        log_success "Availability check working for consultant $consultant_id"
    else
        log_error "Availability check failed for consultant $consultant_id"
        return 1
    fi
    
    log_success "Booking system core functionality is working"
    return 0
}

# Check performance metrics
check_performance() {
    log_info "=== PERFORMANCE CHECK ==="
    
    local endpoints=(
        "/api/v1/consultations/public/consultants/active"
        "/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        log_info "Testing response time for $endpoint"
        
        local response_time=$(curl -s --max-time $TIMEOUT -w "%{time_total}" -o /dev/null "$BACKEND_URL$endpoint")
        local response_ms=$(echo "$response_time * 1000" | bc -l | cut -d. -f1)
        
        if [ "$response_ms" -lt 1000 ]; then
            log_success "$endpoint responds in ${response_ms}ms (excellent)"
        elif [ "$response_ms" -lt 2000 ]; then
            log_warning "$endpoint responds in ${response_ms}ms (acceptable)"
        else
            log_error "$endpoint responds in ${response_ms}ms (too slow)"
        fi
    done
}

# Analyze logs for errors
check_logs() {
    log_info "=== LOG ANALYSIS ==="
    
    if [ -d "$LOG_DIR" ]; then
        log_info "Checking logs in $LOG_DIR for recent errors..."
        
        # Look for error patterns in recent logs
        local error_count=$(find "$LOG_DIR" -name "*.log" -mtime -1 -exec grep -i "error\|exception\|failed" {} \; | wc -l)
        local warning_count=$(find "$LOG_DIR" -name "*.log" -mtime -1 -exec grep -i "warning\|warn" {} \; | wc -l)
        
        if [ "$error_count" -eq 0 ]; then
            log_success "No errors found in recent logs"
        else
            log_warning "Found $error_count error entries in recent logs"
        fi
        
        if [ "$warning_count" -eq 0 ]; then
            log_success "No warnings found in recent logs"
        else
            log_info "Found $warning_count warning entries in recent logs"
        fi
    else
        log_warning "Log directory $LOG_DIR not found"
    fi
    
    # Check system logs if available
    if command -v journalctl >/dev/null 2>&1; then
        local system_errors=$(journalctl --since "1 hour ago" --priority=err --no-pager --quiet | wc -l)
        if [ "$system_errors" -eq 0 ]; then
            log_success "No system errors in the last hour"
        else
            log_warning "Found $system_errors system errors in the last hour"
        fi
    fi
}

# Main execution logic
main() {
    local command="${1:-all}"
    shift || true
    
    # Parse options
    while [[ $# -gt 0 ]]; do
        case $1 in
            --verbose|-v)
                VERBOSE=true
                shift
                ;;
            --timeout|-t)
                TIMEOUT="$2"
                shift 2
                ;;
            --endpoint|-e)
                ENDPOINT="$2"
                shift 2
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    echo "Magnetiq Booking System Health Check"
    print_separator
    
    local overall_success=true
    
    case $command in
        all)
            log_info "Running comprehensive health check..."
            echo ""
            
            check_services || overall_success=false
            echo ""
            check_database || overall_success=false
            echo ""
            check_api || overall_success=false
            echo ""
            check_booking_system || overall_success=false
            echo ""
            check_performance || overall_success=false
            echo ""
            check_logs || overall_success=false
            ;;
        services)
            check_services || overall_success=false
            ;;
        database)
            check_database || overall_success=false
            ;;
        api)
            check_api "$ENDPOINT" || overall_success=false
            ;;
        booking)
            check_booking_system || overall_success=false
            ;;
        performance)
            check_performance || overall_success=false
            ;;
        logs)
            check_logs || overall_success=false
            ;;
        *)
            log_error "Unknown command: $command"
            echo ""
            echo "Usage: $0 [command] [options]"
            echo "Commands: all, services, database, api, booking, performance, logs"
            echo "Options: --verbose, --timeout <seconds>, --endpoint <path>"
            exit 1
            ;;
    esac
    
    echo ""
    print_separator
    
    if $overall_success; then
        log_success "Health check completed successfully!"
        exit 0
    else
        log_error "Health check found issues that need attention"
        exit 1
    fi
}

# Check dependencies
check_dependencies() {
    local missing_deps=()
    
    if ! command -v curl >/dev/null 2>&1; then
        missing_deps+=("curl")
    fi
    
    if ! command -v jq >/dev/null 2>&1; then
        missing_deps+=("jq")
    fi
    
    if ! command -v lsof >/dev/null 2>&1; then
        missing_deps+=("lsof")
    fi
    
    if ! command -v bc >/dev/null 2>&1; then
        missing_deps+=("bc")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Please install missing dependencies before running health checks"
        exit 1
    fi
}

# Run dependency check and main function
check_dependencies
main "$@"
#!/bin/bash
#
# Smoke Test Script for Booking System
#
# Quick validation tests that can be run before/after deployments:
# - Verify critical user journeys work end-to-end
# - Test essential API functionality
# - Validate booking flow without creating real bookings
# - Check internationalization (German/English)
# - Monitor for basic security issues
#
# Usage: ./tests/cli/smoke-test.sh [options]
#
# Options:
#   --locale <en|de>    - Test specific locale (default: both)
#   --fast              - Skip slow tests (performance, etc.)
#   --api-only          - Only test API endpoints
#   --frontend-only     - Only test frontend accessibility
#   --verbose           - Show detailed output
#
# Exit codes:
#   0 - All smoke tests passed
#   1 - Critical smoke tests failed
#   2 - Non-critical issues found
#

set -e

# Configuration
FRONTEND_BASE="http://localhost:8040"
BACKEND_BASE="http://localhost:8037"
TEST_TIMEOUT=15
VERBOSE=false
FAST_MODE=false
API_ONLY=false
FRONTEND_ONLY=false
LOCALE="both"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_WARNED=0

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((TESTS_PASSED++))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((TESTS_FAILED++))
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((TESTS_WARNED++))
}

run_test() {
    local test_name="$1"
    ((TESTS_RUN++))
    
    if $VERBOSE; then
        log_info "Running: $test_name"
    fi
}

print_summary() {
    echo ""
    echo "=============================================="
    echo "SMOKE TEST SUMMARY"
    echo "=============================================="
    echo "Tests Run:    $TESTS_RUN"
    echo "Tests Passed: $TESTS_PASSED"
    echo "Tests Failed: $TESTS_FAILED"
    echo "Warnings:     $TESTS_WARNED"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        if [ $TESTS_WARNED -eq 0 ]; then
            log_pass "All smoke tests passed successfully!"
            return 0
        else
            log_warn "Smoke tests passed with $TESTS_WARNED warnings"
            return 2
        fi
    else
        log_fail "$TESTS_FAILED critical smoke tests failed"
        return 1
    fi
}

# Test basic API availability
test_api_health() {
    run_test "API Health Check"
    
    local response=$(curl -s --max-time $TEST_TIMEOUT -w "%{http_code}" "$BACKEND_BASE/health" 2>/dev/null || echo "000")
    local http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        log_pass "API health endpoint responding"
    else
        log_fail "API health endpoint not responding (HTTP $http_code)"
        return 1
    fi
}

# Test consultant data retrieval
test_consultants_api() {
    run_test "Consultants API"
    
    local response=$(curl -s --max-time $TEST_TIMEOUT "$BACKEND_BASE/api/v1/consultations/public/consultants/active" 2>/dev/null)
    
    if echo "$response" | jq -e '.success == true and .data.total == 2' >/dev/null 2>&1; then
        log_pass "Consultants API returning expected data"
        
        # Verify consultant names
        local ashant_found=$(echo "$response" | jq -e '.data.consultants[] | select(.name | contains("Ashant"))' >/dev/null 2>&1 && echo "true" || echo "false")
        local pascal_found=$(echo "$response" | jq -e '.data.consultants[] | select(.name | contains("Pascal"))' >/dev/null 2>&1 && echo "true" || echo "false")
        
        if [ "$ashant_found" = "true" ] && [ "$pascal_found" = "true" ]; then
            log_pass "Both consultants (Ashant & Pascal) found in API response"
        else
            log_warn "Expected consultants not found in API response"
        fi
    else
        log_fail "Consultants API not returning expected data structure"
        return 1
    fi
}

# Test availability endpoint
test_availability_api() {
    run_test "Availability API"
    
    # Get first consultant ID
    local consultants_response=$(curl -s --max-time $TEST_TIMEOUT "$BACKEND_BASE/api/v1/consultations/public/consultants/active" 2>/dev/null)
    local consultant_id=$(echo "$consultants_response" | jq -r '.data.consultants[0].id' 2>/dev/null)
    
    if [ "$consultant_id" != "null" ] && [ -n "$consultant_id" ]; then
        local tomorrow=$(date -d "+1 day" +%Y-%m-%d 2>/dev/null || date -j -v+1d +%Y-%m-%d)
        local availability_response=$(curl -s --max-time $TEST_TIMEOUT \
            "$BACKEND_BASE/api/v1/consultations/public/consultants/$consultant_id/availability?target_date=$tomorrow&timezone=Europe/Berlin" 2>/dev/null)
        
        if echo "$availability_response" | jq -e '.success == true' >/dev/null 2>&1; then
            log_pass "Availability API responding correctly"
        else
            log_fail "Availability API not responding correctly"
            return 1
        fi
    else
        log_fail "Could not get consultant ID for availability test"
        return 1
    fi
}

# Test frontend accessibility
test_frontend_access() {
    run_test "Frontend Accessibility"
    
    local locales_to_test=()
    case $LOCALE in
        "en")
            locales_to_test=("en")
            ;;
        "de")
            locales_to_test=("de")
            ;;
        "both"|*)
            locales_to_test=("en" "de")
            ;;
    esac
    
    for locale in "${locales_to_test[@]}"; do
        local url="$FRONTEND_BASE/$locale/kontakt/terminbuchung"
        local response=$(curl -s --max-time $TEST_TIMEOUT -w "%{http_code}" "$url" 2>/dev/null || echo "000")
        local http_code="${response: -3}"
        
        if [ "$http_code" = "200" ]; then
            log_pass "Frontend accessible in $locale locale"
            
            # Check for key elements in response body
            local body="${response%???}"
            if echo "$body" | grep -q "terminbuchung\|booking" >/dev/null 2>&1; then
                log_pass "Frontend contains booking-related content ($locale)"
            else
                log_warn "Frontend accessible but booking content not detected ($locale)"
            fi
        else
            log_fail "Frontend not accessible in $locale locale (HTTP $http_code)"
        fi
    done
}

# Test API security headers
test_security_headers() {
    run_test "Security Headers"
    
    local headers=$(curl -s --max-time $TEST_TIMEOUT -I "$BACKEND_BASE/health" 2>/dev/null)
    
    # Check for important security headers
    local security_checks=(
        "x-frame-options:X-Frame-Options"
        "x-content-type-options:X-Content-Type-Options"
        "x-xss-protection:X-XSS-Protection"
    )
    
    local security_ok=true
    for check in "${security_checks[@]}"; do
        local header_name="${check#*:}"
        local search_pattern="${check%:*}"
        
        if echo "$headers" | grep -i "$search_pattern" >/dev/null 2>&1; then
            if $VERBOSE; then
                log_pass "$header_name header present"
            fi
        else
            log_warn "$header_name header missing"
            security_ok=false
        fi
    done
    
    if $security_ok; then
        log_pass "Security headers check passed"
    fi
}

# Test rate limiting (basic check)
test_rate_limiting() {
    run_test "Rate Limiting Check"
    
    local endpoint="$BACKEND_BASE/api/v1/consultations/public/consultants/active"
    local rapid_requests=0
    local failed_requests=0
    
    # Make 10 rapid requests
    for i in {1..10}; do
        local response_code=$(curl -s --max-time 3 -w "%{http_code}" -o /dev/null "$endpoint" 2>/dev/null || echo "000")
        ((rapid_requests++))
        
        if [ "$response_code" = "429" ]; then
            log_pass "Rate limiting active (HTTP 429 detected)"
            return 0
        elif [ "$response_code" != "200" ]; then
            ((failed_requests++))
        fi
        
        sleep 0.1
    done
    
    if [ $failed_requests -gt 7 ]; then
        log_fail "Too many failed requests during rate limiting test"
    else
        log_warn "Rate limiting not detected (may be configured with higher limits)"
    fi
}

# Test HTTPS redirect (if applicable)
test_https_enforcement() {
    run_test "HTTPS Enforcement"
    
    # Check if HTTP redirects to HTTPS in production-like environment
    local http_url="http://localhost:8037/health"
    local response=$(curl -s --max-time $TEST_TIMEOUT -I "$http_url" 2>/dev/null || true)
    
    if echo "$response" | grep -i "location.*https" >/dev/null 2>&1; then
        log_pass "HTTPS redirect configured"
    else
        log_warn "HTTPS redirect not detected (expected in local development)"
    fi
}

# Test error handling
test_error_handling() {
    run_test "Error Handling"
    
    # Test 404 handling
    local not_found_response=$(curl -s --max-time $TEST_TIMEOUT -w "%{http_code}" \
        "$BACKEND_BASE/api/v1/nonexistent-endpoint" 2>/dev/null || echo "000")
    local not_found_code="${not_found_response: -3}"
    
    if [ "$not_found_code" = "404" ]; then
        log_pass "404 error handling working"
    else
        log_warn "Unexpected response for non-existent endpoint: HTTP $not_found_code"
    fi
    
    # Test invalid consultant ID
    local invalid_consultant_response=$(curl -s --max-time $TEST_TIMEOUT -w "%{http_code}" \
        "$BACKEND_BASE/api/v1/consultations/public/consultants/999999/availability" 2>/dev/null || echo "000")
    local invalid_code="${invalid_consultant_response: -3}"
    
    if [ "$invalid_code" = "404" ] || [ "$invalid_code" = "400" ]; then
        log_pass "Invalid consultant ID handled correctly"
    else
        log_warn "Invalid consultant ID handling may need review (HTTP $invalid_code)"
    fi
}

# Performance smoke test
test_performance() {
    if $FAST_MODE; then
        return 0
    fi
    
    run_test "Performance Smoke Test"
    
    local endpoints=(
        "$BACKEND_BASE/health"
        "$BACKEND_BASE/api/v1/consultations/public/consultants/active"
    )
    
    local performance_ok=true
    for endpoint in "${endpoints[@]}"; do
        local response_time=$(curl -s --max-time $TEST_TIMEOUT -w "%{time_total}" -o /dev/null "$endpoint" 2>/dev/null || echo "999")
        local response_ms=$(echo "$response_time * 1000" | bc -l 2>/dev/null | cut -d. -f1 2>/dev/null || echo "9999")
        
        if [ "$response_ms" -lt 2000 ]; then
            if $VERBOSE; then
                log_pass "$(basename "$endpoint") responds in ${response_ms}ms"
            fi
        else
            log_warn "$(basename "$endpoint") responds slowly in ${response_ms}ms"
            performance_ok=false
        fi
    done
    
    if $performance_ok; then
        log_pass "Performance smoke test passed"
    fi
}

# Main execution
main() {
    # Parse command line options
    while [[ $# -gt 0 ]]; do
        case $1 in
            --locale)
                LOCALE="$2"
                shift 2
                ;;
            --fast)
                FAST_MODE=true
                shift
                ;;
            --api-only)
                API_ONLY=true
                shift
                ;;
            --frontend-only)
                FRONTEND_ONLY=true
                shift
                ;;
            --verbose|-v)
                VERBOSE=true
                shift
                ;;
            --timeout|-t)
                TEST_TIMEOUT="$2"
                shift 2
                ;;
            *)
                echo "Unknown option: $1"
                echo "Usage: $0 [--locale en|de|both] [--fast] [--api-only] [--frontend-only] [--verbose] [--timeout seconds]"
                exit 1
                ;;
        esac
    done
    
    echo "Magnetiq Booking System Smoke Tests"
    echo "=============================================="
    
    if $API_ONLY; then
        log_info "Running API-only smoke tests..."
        test_api_health
        test_consultants_api
        test_availability_api
        test_security_headers
        test_rate_limiting
        test_error_handling
    elif $FRONTEND_ONLY; then
        log_info "Running frontend-only smoke tests..."
        test_frontend_access
    else
        log_info "Running comprehensive smoke tests..."
        
        # API Tests
        test_api_health
        test_consultants_api  
        test_availability_api
        
        # Frontend Tests
        test_frontend_access
        
        # Security Tests
        test_security_headers
        test_rate_limiting
        test_https_enforcement
        test_error_handling
        
        # Performance Tests
        test_performance
    fi
    
    # Print summary and exit with appropriate code
    print_summary
    return $?
}

# Check dependencies
if ! command -v curl >/dev/null 2>&1; then
    echo "Error: curl is required but not installed"
    exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
    echo "Warning: jq not found - some tests may be limited"
fi

# Run main function with all arguments
main "$@"
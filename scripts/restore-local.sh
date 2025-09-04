#!/bin/bash
# ==============================================================================
# restore-local.sh - Restore from backup to local development environment
# ==============================================================================
# Purpose: Restore SQLite database, files, and configuration from backup
# Usage: ./scripts/restore-local.sh <backup-name> [options]
# Options:
#   --force         Skip confirmations
#   --data-only     Restore only database and data files
#   --config-only   Restore only configuration files
#   --decrypt       Decrypt backup (requires gpg)
# ==============================================================================

# -----------------------------------------------------------------------------
# 1. CONFIGURATION AND SETUP
# -----------------------------------------------------------------------------

# Set default values
BACKUP_NAME="$1"
FORCE_RESTORE=false
DATA_ONLY=false
CONFIG_ONLY=false
DECRYPT_BACKUP=false

BACKUP_DIR="./backups"
TEMP_RESTORE_DIR=$(mktemp -d)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parse arguments
if [ -z "$BACKUP_NAME" ]; then
    echo "Usage: ./restore-local.sh <backup-name> [options]"
    echo ""
    echo "Available backups:"
    list_available_backups
    exit 1
fi

for arg in "$@"; do
    case $arg in
        --force)
            FORCE_RESTORE=true
            ;;
        --data-only)
            DATA_ONLY=true
            ;;
        --config-only)
            CONFIG_ONLY=true
            ;;
        --decrypt)
            DECRYPT_BACKUP=true
            ;;
    esac
done

# -----------------------------------------------------------------------------
# 2. PRE-RESTORE VALIDATION
# -----------------------------------------------------------------------------

function list_available_backups() {
    echo "Available backups in ${BACKUP_DIR}:"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        echo "  No backups directory found."
        return
    fi
    
    BACKUPS=$(find "$BACKUP_DIR" -name "*.tar.gz" -o -name "*.tar.gz.gpg" 2>/dev/null)
    
    if [ -z "$BACKUPS" ]; then
        echo "  No backup files found."
        return
    fi
    
    while IFS= read -r backup; do
        if [ -n "$backup" ]; then
            BACKUP_BASE=$(basename "$backup")
            SIZE=$(ls -lah "$backup" | awk '{print $5}')
            if [[ "$OSTYPE" == "darwin"* ]]; then
                DATE=$(stat -f %Sm -t %Y-%m-%d "$backup")
            else
                DATE=$(stat -c %y "$backup" | cut -d' ' -f1)
            fi
            echo "  • ${BACKUP_BASE} (${SIZE}, ${DATE})"
        fi
    done <<< "$BACKUPS"
}

function validate_backup_file() {
    echo -e "${BLUE}Validating backup file...${NC}"
    
    # Determine backup file path
    BACKUP_FILE="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    
    if [ "$DECRYPT_BACKUP" = true ]; then
        BACKUP_FILE="${BACKUP_FILE}.gpg"
    fi
    
    # Check if backup exists
    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}Backup file not found: ${BACKUP_FILE}${NC}"
        echo ""
        echo "Available backups:"
        list_available_backups
        exit 1
    fi
    
    # Verify checksums if they exist
    if [ -f "${BACKUP_FILE}.md5" ]; then
        echo "Verifying MD5 checksum..."
        if ! md5sum -c "${BACKUP_FILE}.md5" >/dev/null 2>&1; then
            echo -e "${RED}✗ MD5 checksum verification failed!${NC}"
            read -p "Continue anyway? (y/N): " continue_restore
            if [ "$continue_restore" != "y" ]; then
                exit 1
            fi
        else
            echo -e "${GREEN}✓ MD5 checksum verified${NC}"
        fi
    fi
    
    if [ -f "${BACKUP_FILE}.sha256" ]; then
        echo "Verifying SHA256 checksum..."
        if ! sha256sum -c "${BACKUP_FILE}.sha256" >/dev/null 2>&1; then
            echo -e "${RED}✗ SHA256 checksum verification failed!${NC}"
            read -p "Continue anyway? (y/N): " continue_restore
            if [ "$continue_restore" != "y" ]; then
                exit 1
            fi
        else
            echo -e "${GREEN}✓ SHA256 checksum verified${NC}"
        fi
    fi
    
    echo -e "${GREEN}✓ Backup file validated${NC}"
}

# -----------------------------------------------------------------------------
# 3. DECRYPT AND EXTRACT BACKUP
# -----------------------------------------------------------------------------

function decrypt_backup() {
    if [ "$DECRYPT_BACKUP" != true ]; then
        return 0
    fi
    
    echo -e "${BLUE}Decrypting backup...${NC}"
    
    # Check if GPG is available
    if ! command -v gpg >/dev/null 2>&1; then
        echo -e "${RED}GPG not found. Cannot decrypt backup.${NC}"
        exit 1
    fi
    
    ENCRYPTED_FILE="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz.gpg"
    DECRYPTED_FILE="${TEMP_RESTORE_DIR}/${BACKUP_NAME}.tar.gz"
    
    # Decrypt the backup
    if gpg --quiet --batch --yes --decrypt "$ENCRYPTED_FILE" > "$DECRYPTED_FILE" 2>/dev/null; then
        BACKUP_FILE="$DECRYPTED_FILE"
        echo -e "${GREEN}✓ Backup decrypted${NC}"
    else
        echo -e "${RED}✗ Decryption failed!${NC}"
        exit 1
    fi
}

function extract_backup() {
    echo -e "${BLUE}Extracting backup...${NC}"
    
    # Extract to temporary directory
    if tar -xzf "$BACKUP_FILE" -C "$TEMP_RESTORE_DIR"; then
        echo -e "${GREEN}✓ Backup extracted${NC}"
    else
        echo -e "${RED}✗ Failed to extract backup!${NC}"
        exit 1
    fi
    
    # Verify metadata file exists
    if [ ! -f "${TEMP_RESTORE_DIR}/backup_metadata.json" ]; then
        echo -e "${YELLOW}⚠️  Warning: No metadata file found. This may be an old backup format.${NC}"
    else
        # Display backup information
        show_backup_info
    fi
}

function show_backup_info() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BLUE}   Backup Information${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    
    METADATA="${TEMP_RESTORE_DIR}/backup_metadata.json"
    
    if command -v jq >/dev/null 2>&1; then
        # Extract key information from metadata using jq
        BACKUP_DATE=$(jq -r '.backup_info.timestamp' "$METADATA" 2>/dev/null || echo "unknown")
        APP_VERSION=$(jq -r '.application.version' "$METADATA" 2>/dev/null || echo "unknown")
        GIT_COMMIT=$(jq -r '.application.git_commit' "$METADATA" 2>/dev/null || echo "unknown")
        DB_TYPE=$(jq -r '.database.type' "$METADATA" 2>/dev/null || echo "unknown")
        TOTAL_SIZE=$(jq -r '.files.total_size' "$METADATA" 2>/dev/null || echo "unknown")
        
        echo "  Date: ${BACKUP_DATE}"
        echo "  Version: ${APP_VERSION}"
        echo "  Git commit: ${GIT_COMMIT}"
        echo "  Database: ${DB_TYPE}"
        echo "  Size: ${TOTAL_SIZE}"
    else
        echo "  Metadata: $(head -n 10 "$METADATA" 2>/dev/null || echo "Unable to read metadata")"
    fi
    echo ""
}

# -----------------------------------------------------------------------------
# 4. STOP SERVICES AND CREATE PRE-RESTORE BACKUP
# -----------------------------------------------------------------------------

function prepare_for_restore() {
    echo -e "${BLUE}Preparing for restore...${NC}"
    
    # Check if development servers are running
    BACKEND_PID=$(lsof -ti :8037 2>/dev/null || echo "")
    FRONTEND_PID=$(lsof -ti :8036 2>/dev/null || lsof -ti :8040 2>/dev/null || echo "")
    
    if [ -n "$BACKEND_PID" ] || [ -n "$FRONTEND_PID" ]; then
        echo "Development services are currently running:"
        [ -n "$BACKEND_PID" ] && echo "  • Backend server (port 8037)"
        [ -n "$FRONTEND_PID" ] && echo "  • Frontend server (port 8036/8040)"
        
        if [ "$FORCE_RESTORE" != true ]; then
            read -p "Stop these services before restore? (Y/n): " stop_services
            if [ "$stop_services" != "n" ]; then
                [ -n "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null && echo "  ✓ Backend stopped"
                [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null && echo "  ✓ Frontend stopped"
                sleep 2
            fi
        else
            [ -n "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null
            [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null
            sleep 2
        fi
    fi
    
    # Create pre-restore backup
    if [ "$FORCE_RESTORE" != true ]; then
        read -p "Create backup of current state before restore? (Y/n): " create_backup
        if [ "$create_backup" != "n" ]; then
            PRERESTORE_BACKUP="pre-restore-$(date +%Y%m%d_%H%M%S)"
            echo "Creating backup: ${PRERESTORE_BACKUP}"
            ./scripts/backup-local.sh "$PRERESTORE_BACKUP"
        fi
    fi
}

# -----------------------------------------------------------------------------
# 5. RESTORE DATABASE
# -----------------------------------------------------------------------------

function restore_database() {
    if [ "$CONFIG_ONLY" = true ]; then
        return 0
    fi
    
    echo -e "${BLUE}Restoring database...${NC}"
    
    # Check which database format we have (SQLite-based)
    if [ -f "${TEMP_RESTORE_DIR}/magnetiq.db" ]; then
        restore_sqlite_database
    elif [ -f "${TEMP_RESTORE_DIR}/magnetiq_dump.sql" ]; then
        restore_sqlite_from_dump
    else
        echo -e "${YELLOW}No SQLite database backup found in restore archive${NC}"
        echo "Looking for available database files:"
        find "$TEMP_RESTORE_DIR" -name "*.db" -o -name "*.sql" 2>/dev/null || echo "  No database files found"
        return 1
    fi
}

function restore_sqlite_from_dump() {
    echo "Restoring SQLite database from SQL dump..."
    
    # Ensure data directory exists
    mkdir -p ./data
    
    # Backup existing database if it exists
    if [ -f "./data/magnetiq.db" ]; then
        BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        mv "./data/magnetiq.db" "./data/magnetiq.db.backup.${BACKUP_TIMESTAMP}"
        echo "  ✓ Existing database backed up as magnetiq.db.backup.${BACKUP_TIMESTAMP}"
    fi
    
    # Restore from SQL dump
    if sqlite3 "./data/magnetiq.db" < "${TEMP_RESTORE_DIR}/magnetiq_dump.sql"; then
        echo -e "${GREEN}✓ SQLite database restored from SQL dump${NC}"
        
        # Verify database integrity
        if sqlite3 "./data/magnetiq.db" "PRAGMA integrity_check;" | grep -q "ok"; then
            echo -e "${GREEN}✓ Database integrity verified${NC}"
        else
            echo -e "${YELLOW}⚠️  Database integrity check failed${NC}"
        fi
    else
        echo -e "${RED}✗ Database restore from SQL dump failed!${NC}"
        return 1
    fi
}

function restore_sqlite_database() {
    echo "Restoring SQLite database from backup file..."
    
    # Ensure data directory exists
    mkdir -p ./data
    
    # Backup existing database if it exists
    if [ -f "./data/magnetiq.db" ]; then
        BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        mv "./data/magnetiq.db" "./data/magnetiq.db.backup.${BACKUP_TIMESTAMP}"
        echo "  ✓ Existing database backed up as magnetiq.db.backup.${BACKUP_TIMESTAMP}"
    fi
    
    # Copy database file
    if cp "${TEMP_RESTORE_DIR}/magnetiq.db" "./data/magnetiq.db"; then
        echo -e "${GREEN}✓ SQLite database restored${NC}"
        
        # Verify database integrity and get basic stats
        if command -v sqlite3 >/dev/null 2>&1; then
            # Check database integrity
            INTEGRITY_CHECK=$(sqlite3 "./data/magnetiq.db" "PRAGMA integrity_check;" 2>/dev/null)
            if echo "$INTEGRITY_CHECK" | grep -q "ok"; then
                echo -e "${GREEN}✓ Database integrity verified${NC}"
            else
                echo -e "${YELLOW}⚠️  Database integrity check: ${INTEGRITY_CHECK}${NC}"
            fi
            
            # Get database statistics
            TABLE_COUNT=$(sqlite3 "./data/magnetiq.db" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "unknown")
            DB_SIZE=$(ls -lah "./data/magnetiq.db" | awk '{print $5}')
            echo "  Database size: ${DB_SIZE}"
            echo "  Tables: ${TABLE_COUNT}"
        fi
    else
        echo -e "${RED}✗ Failed to restore SQLite database!${NC}"
        return 1
    fi
}

# -----------------------------------------------------------------------------
# 6. RESTORE FILES AND DATA
# -----------------------------------------------------------------------------

function restore_files() {
    if [ "$CONFIG_ONLY" = true ]; then
        return 0
    fi
    
    echo -e "${BLUE}Restoring files and data...${NC}"
    
    # Restore media files
    if [ -d "${TEMP_RESTORE_DIR}/media" ]; then
        echo "Restoring media files..."
        
        # Remove existing media directory
        if [ -d "./media" ]; then
            rm -rf ./media
        fi
        
        # Copy media files
        cp -r "${TEMP_RESTORE_DIR}/media" ./
        
        MEDIA_COUNT=$(find ./media -type f 2>/dev/null | wc -l)
        echo -e "${GREEN}✓ Restored ${MEDIA_COUNT} media files${NC}"
    fi
    
    # Restore data directory
    if [ -d "${TEMP_RESTORE_DIR}/data" ]; then
        echo "Restoring data files..."
        
        # Create data directory if it doesn't exist
        mkdir -p ./data
        
        # Copy data files (excluding database if already restored separately)
        if command -v rsync >/dev/null 2>&1; then
            rsync -av --exclude='*.db' "${TEMP_RESTORE_DIR}/data/" ./data/
        else
            # Fallback to cp if rsync not available
            find "${TEMP_RESTORE_DIR}/data" -type f ! -name "*.db" -exec cp {} ./data/ \;
        fi
        
        echo -e "${GREEN}✓ Data files restored${NC}"
    fi
    
    # Restore logs if they exist
    if [ -d "${TEMP_RESTORE_DIR}/logs" ]; then
        echo "Restoring logs..."
        
        mkdir -p ./logs
        cp -r "${TEMP_RESTORE_DIR}/logs/"* ./logs/ 2>/dev/null || true
        
        echo -e "${GREEN}✓ Logs restored${NC}"
    fi
}

# -----------------------------------------------------------------------------
# 7. RESTORE CONFIGURATION
# -----------------------------------------------------------------------------

function restore_configuration() {
    if [ "$DATA_ONLY" = true ]; then
        return 0
    fi
    
    echo -e "${BLUE}Restoring configuration...${NC}"
    
    # Restore environment file
    if [ -f "${TEMP_RESTORE_DIR}/env.local" ]; then
        if [ -f ".env.local" ]; then
            BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
            mv .env.local ".env.local.backup.${BACKUP_TIMESTAMP}"
            echo "  Backed up existing .env.local"
        fi
        
        cp "${TEMP_RESTORE_DIR}/env.local" .env.local
        echo -e "${GREEN}✓ Environment configuration restored${NC}"
        
        # Show differences if backup exists
        if ls .env.local.backup.* >/dev/null 2>&1; then
            echo "Configuration changes:"
            diff -u .env.local.backup.* .env.local 2>/dev/null || true
        fi
    fi
    
    # Restore frontend environment file
    if [ -f "${TEMP_RESTORE_DIR}/frontend.env" ]; then
        if [ -f "./frontend/.env" ]; then
            BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
            mv ./frontend/.env "./frontend/.env.backup.${BACKUP_TIMESTAMP}"
            echo "  Backed up existing frontend .env"
        fi
        
        mkdir -p ./frontend
        cp "${TEMP_RESTORE_DIR}/frontend.env" ./frontend/.env
        echo -e "${GREEN}✓ Frontend configuration restored${NC}"
    fi
    
    # Restore application configurations
    if [ -d "${TEMP_RESTORE_DIR}/config" ]; then
        mkdir -p ./backend/app
        cp -r "${TEMP_RESTORE_DIR}/config" ./backend/app/
        echo -e "${GREEN}✓ Application configuration restored${NC}"
    fi
    
    # Show git information
    if [ -f "${TEMP_RESTORE_DIR}/git_info.txt" ]; then
        echo ""
        echo "Backup was created from:"
        cat "${TEMP_RESTORE_DIR}/git_info.txt"
        
        CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
        echo "Current commit: ${CURRENT_COMMIT}"
    fi
}

# -----------------------------------------------------------------------------
# 8. POST-RESTORE TASKS
# -----------------------------------------------------------------------------

function post_restore_tasks() {
    echo -e "${BLUE}Running post-restore tasks...${NC}"
    
    # Set proper permissions
    echo "Setting file permissions..."
    
    chmod -R 755 ./data 2>/dev/null || true
    chmod -R 755 ./media 2>/dev/null || true
    chmod -R 644 ./logs/*.log 2>/dev/null || true
    
    echo -e "${GREEN}✓ File permissions set${NC}"
    
    # Ask about starting services
    if [ "$FORCE_RESTORE" != true ]; then
        read -p "Start development services? (Y/n): " start_services
        if [ "$start_services" != "n" ]; then
            start_development_services
        fi
    fi
    
    # Verify restore
    verify_restore
}

function start_development_services() {
    echo "Starting development services..."
    
    # Start backend
    echo "  Starting backend server..."
    if [ -f "./backend/app/main.py" ]; then
        cd backend && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8037 --reload --app-dir . &
        BACKEND_PID=$!
        cd ..
        echo "    Backend started (PID: $BACKEND_PID)"
    fi
    
    # Start frontend
    echo "  Starting frontend server..."
    if [ -f "./frontend/package.json" ]; then
        cd frontend && npm run dev &
        FRONTEND_PID=$!
        cd ..
        echo "    Frontend started (PID: $FRONTEND_PID)"
    fi
    
    echo -e "${GREEN}✓ Development services started${NC}"
    echo "  Backend: http://localhost:8037"
    echo "  Frontend: http://localhost:8040" # or whatever port the frontend uses
}

function verify_restore() {
    echo ""
    echo -e "${BLUE}Verifying restore...${NC}"
    
    # Check database connectivity
    if [ -f "./data/magnetiq.db" ] && command -v sqlite3 >/dev/null 2>&1; then
        # Try to query the database
        if sqlite3 "./data/magnetiq.db" "SELECT name FROM sqlite_master WHERE type='table';" >/dev/null 2>&1; then
            TABLE_COUNT=$(sqlite3 "./data/magnetiq.db" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "0")
            echo -e "${GREEN}✓ Database is accessible (${TABLE_COUNT} tables)${NC}"
        else
            echo -e "${YELLOW}⚠️  Database may have issues${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Database file not found or sqlite3 not available${NC}"
    fi
    
    # Check media files
    if [ -d "./media" ] && [ "$(ls -A ./media 2>/dev/null)" ]; then
        MEDIA_COUNT=$(find ./media -type f 2>/dev/null | wc -l)
        echo -e "${GREEN}✓ ${MEDIA_COUNT} media files restored${NC}"
    fi
    
    # Check data directory
    if [ -d "./data" ]; then
        DATA_FILES=$(find ./data -type f 2>/dev/null | wc -l)
        echo -e "${GREEN}✓ ${DATA_FILES} files in data directory${NC}"
    fi
    
    echo -e "${GREEN}✓ Restore verification completed${NC}"
}

# -----------------------------------------------------------------------------
# 9. CLEANUP AND REPORTING
# -----------------------------------------------------------------------------

function cleanup_and_report() {
    # Clean up temporary directory
    rm -rf "$TEMP_RESTORE_DIR"
    
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}   Restore Completed Successfully! ✓${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════${NC}"
    echo ""
    echo "Restored from: ${BACKUP_NAME}"
    echo ""
    echo "What was restored:"
    if [ "$DATA_ONLY" != true ] && [ "$CONFIG_ONLY" != true ]; then
        echo "  ✓ SQLite database and data files"
        echo "  ✓ Configuration files"
        echo "  ✓ Media files"
    elif [ "$DATA_ONLY" = true ]; then
        echo "  ✓ SQLite database and data files only"
    elif [ "$CONFIG_ONLY" = true ]; then
        echo "  ✓ Configuration files only"
    fi
    echo ""
    
    # Check if services are running
    BACKEND_RUNNING=$(lsof -ti :8037 2>/dev/null || echo "")
    FRONTEND_RUNNING=$(lsof -ti :8040 2>/dev/null || lsof -ti :8036 2>/dev/null || echo "")
    
    echo "Services status:"
    if [ -n "$BACKEND_RUNNING" ]; then
        echo "  ✓ Backend server running on port 8037"
    else
        echo "  ✗ Backend server not running"
    fi
    
    if [ -n "$FRONTEND_RUNNING" ]; then
        echo "  ✓ Frontend server running"
    else
        echo "  ✗ Frontend server not running"
    fi
    
    echo ""
    echo "Access your application at:"
    echo "  Frontend: http://localhost:8040"
    echo "  Backend:  http://localhost:8037/docs"
    echo ""
    echo "Database location: ./data/magnetiq.db"
    echo ""
    echo "To start services manually:"
    echo "  Backend:  cd backend && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8037 --reload --app-dir ."
    echo "  Frontend: cd frontend && npm run dev"
}

# -----------------------------------------------------------------------------
# 10. MAIN EXECUTION
# -----------------------------------------------------------------------------

# Execute restore process
echo -e "${BLUE}Starting restore process...${NC}"
echo "Backup: ${BACKUP_NAME}"
echo ""

validate_backup_file
decrypt_backup
extract_backup
prepare_for_restore
restore_database
restore_files
restore_configuration
post_restore_tasks
cleanup_and_report

echo -e "${GREEN}Restore process completed!${NC}"
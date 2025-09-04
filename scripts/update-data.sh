#!/bin/bash
# ==============================================================================
# update-data.sh - SQLite database migration and schema update manager
# ==============================================================================
# Purpose: Handle SQLite database schema changes, migrations, and data updates
# Usage: ./scripts/update-data.sh [command] [options]
# Commands:
#   migrate     Run pending migrations (via Alembic)
#   rollback    Rollback last migration
#   create      Create new migration
#   status      Show migration status
#   seed        Seed development data
#   backup      Create database backup before changes
# ==============================================================================

# -----------------------------------------------------------------------------
# 1. CONFIGURATION AND SETUP
# -----------------------------------------------------------------------------

# Set database configuration for SQLite
DB_PATH="./data/magnetiq.db"
BACKUP_DIR="./backups"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Parse command
COMMAND=${1:-status}
shift

# -----------------------------------------------------------------------------
# 2. HELPER FUNCTIONS
# -----------------------------------------------------------------------------

function check_database_connection() {
    echo -e "${BLUE}Checking database connection...${NC}"
    
    # Check if SQLite database exists and is accessible
    if [ ! -f "$DB_PATH" ]; then
        echo -e "${YELLOW}SQLite database not found at: ${DB_PATH}${NC}"
        echo "Creating new database..."
        
        # Ensure data directory exists
        mkdir -p "$(dirname "$DB_PATH")"
        
        # Create empty database
        sqlite3 "$DB_PATH" "SELECT 1;" >/dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ New SQLite database created${NC}"
        else
            echo -e "${RED}✗ Failed to create SQLite database!${NC}"
            exit 1
        fi
    fi
    
    # Test database connection
    if sqlite3 "$DB_PATH" "SELECT 1;" >/dev/null 2>&1; then
        echo -e "${GREEN}✓ SQLite database connection established${NC}"
    else
        echo -e "${RED}✗ Cannot connect to SQLite database!${NC}"
        exit 1
    fi
}

function backup_database() {
    echo -e "${BLUE}Creating backup before migration...${NC}"
    
    if [ ! -f "$DB_PATH" ]; then
        echo -e "${YELLOW}No database to backup${NC}"
        return 0
    fi
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="${BACKUP_DIR}/pre_migration_${TIMESTAMP}.db"
    BACKUP_SQL="${BACKUP_DIR}/pre_migration_${TIMESTAMP}.sql"
    
    mkdir -p "$BACKUP_DIR"
    
    # Create both binary and SQL backups
    if cp "$DB_PATH" "$BACKUP_FILE" && sqlite3 "$DB_PATH" ".dump" > "$BACKUP_SQL"; then
        echo -e "${GREEN}✓ Backup saved to: ${BACKUP_FILE}${NC}"
        echo -e "${GREEN}✓ SQL dump saved to: ${BACKUP_SQL}${NC}"
        echo "$BACKUP_FILE"
    else
        echo -e "${RED}✗ Backup failed!${NC}"
        read -p "Continue without backup? (y/N): " continue_migration
        if [ "$continue_migration" != "y" ]; then
            exit 1
        fi
    fi
}

# -----------------------------------------------------------------------------
# 3. MIGRATION STATUS
# -----------------------------------------------------------------------------

function show_migration_status() {
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo -e "${BLUE}   SQLite Database Migration Status${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
    echo ""
    
    # Check if backend directory and alembic are available
    if [ ! -d "./backend" ]; then
        echo -e "${YELLOW}Backend directory not found. Cannot check migration status.${NC}"
        return 1
    fi
    
    cd backend
    
    # Get current revision
    if command -v python3 >/dev/null 2>&1; then
        CURRENT=$(python3 -m alembic current 2>/dev/null | grep -v "INFO" || echo "No migrations applied")
        echo "Current revision: ${CURRENT}"
        echo ""
        
        # Get migration history
        echo "Migration history:"
        python3 -m alembic history --indicate-current 2>/dev/null | head -20 || echo "  No migration history available"
        echo ""
    else
        echo -e "${YELLOW}Python3 not available. Cannot check Alembic status.${NC}"
    fi
    
    cd ..
    
    # Show database statistics
    echo "Database statistics:"
    if [ -f "$DB_PATH" ] && command -v sqlite3 >/dev/null 2>&1; then
        TABLE_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "unknown")
        DB_SIZE=$(ls -lah "$DB_PATH" 2>/dev/null | awk '{print $5}' || echo "unknown")
        
        echo "  Database file: ${DB_PATH}"
        echo "  Tables: ${TABLE_COUNT}"
        echo "  Size: ${DB_SIZE}"
        
        # Show table list
        if [ "$TABLE_COUNT" != "unknown" ] && [ "$TABLE_COUNT" -gt 0 ]; then
            echo "  Table list:"
            sqlite3 "$DB_PATH" "SELECT name FROM sqlite_master WHERE type='table';" 2>/dev/null | sed 's/^/    - /' || echo "    Unable to list tables"
        fi
    else
        echo "  Database file not found or sqlite3 not available"
    fi
}

# -----------------------------------------------------------------------------
# 4. RUN MIGRATIONS
# -----------------------------------------------------------------------------

function run_migrations() {
    echo -e "${BLUE}Running database migrations...${NC}"
    
    if [ ! -d "./backend" ]; then
        echo -e "${RED}Backend directory not found!${NC}"
        exit 1
    fi
    
    cd backend
    
    # Check if Python and Alembic are available
    if ! command -v python3 >/dev/null 2>&1; then
        echo -e "${RED}Python3 not found!${NC}"
        exit 1
    fi
    
    # Create backup first
    cd ..
    BACKUP_FILE=$(backup_database)
    cd backend
    
    # Show current status
    echo "Current migration status:"
    python3 -m alembic current 2>/dev/null || echo "No current revision"
    echo ""
    
    # Show what migrations will be applied
    echo "Checking for pending migrations..."
    MIGRATION_CHECK=$(python3 -m alembic history 2>/dev/null | head -10)
    
    if [ -z "$MIGRATION_CHECK" ]; then
        echo "No migration history found."
    else
        echo "Migration history (latest 10):"
        echo "$MIGRATION_CHECK"
    fi
    
    echo ""
    read -p "Apply all pending migrations? (y/N): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Migration cancelled."
        cd ..
        exit 0
    fi
    
    # Run migrations
    echo "Applying migrations..."
    if python3 -m alembic upgrade head; then
        echo -e "${GREEN}✓ Migrations applied successfully${NC}"
        
        # Verify database
        cd ..
        verify_database_schema
    else
        echo -e "${RED}✗ Migration failed!${NC}"
        
        read -p "Restore from backup? (y/N): " restore_backup
        if [ "$restore_backup" = "y" ] && [ -n "$BACKUP_FILE" ]; then
            cd ..
            restore_from_backup "$BACKUP_FILE"
        fi
        cd ..
        exit 1
    fi
    
    cd ..
}

# -----------------------------------------------------------------------------
# 5. ROLLBACK MIGRATION
# -----------------------------------------------------------------------------

function rollback_migration() {
    echo -e "${BLUE}Rolling back last migration...${NC}"
    
    if [ ! -d "./backend" ]; then
        echo -e "${RED}Backend directory not found!${NC}"
        exit 1
    fi
    
    cd backend
    
    # Show current revision
    CURRENT=$(python3 -m alembic current 2>/dev/null || echo "unknown")
    echo "Current revision: ${CURRENT}"
    
    if [ "$CURRENT" = "unknown" ] || [ -z "$CURRENT" ]; then
        echo -e "${YELLOW}No current revision found. Nothing to rollback.${NC}"
        cd ..
        return 0
    fi
    
    # Show migration history to see what we're rolling back from
    echo "Recent migration history:"
    python3 -m alembic history -r-3: 2>/dev/null | head -5 || echo "Unable to retrieve history"
    
    echo ""
    read -p "Confirm rollback to previous migration? (y/N): " confirm
    if [ "$confirm" != "y" ]; then
        echo "Rollback cancelled."
        cd ..
        exit 0
    fi
    
    # Create backup first
    cd ..
    backup_database
    cd backend
    
    # Perform rollback
    echo "Performing rollback..."
    if python3 -m alembic downgrade -1; then
        echo -e "${GREEN}✓ Rollback completed${NC}"
        cd ..
        show_migration_status
    else
        echo -e "${RED}✗ Rollback failed!${NC}"
        cd ..
        exit 1
    fi
    
    cd ..
}

# -----------------------------------------------------------------------------
# 6. CREATE NEW MIGRATION
# -----------------------------------------------------------------------------

function create_migration() {
    echo -e "${BLUE}Creating new migration...${NC}"
    
    if [ ! -d "./backend" ]; then
        echo -e "${RED}Backend directory not found!${NC}"
        exit 1
    fi
    
    cd backend
    
    # Get migration message
    read -p "Migration description: " MESSAGE
    
    if [ -z "$MESSAGE" ]; then
        echo -e "${RED}Migration message is required!${NC}"
        cd ..
        exit 1
    fi
    
    # Auto-generate or empty migration
    echo "Migration type:"
    echo "  1) Auto-generate from model changes"
    echo "  2) Empty migration (manual)"
    read -p "Choice (1/2): " TYPE
    
    case $TYPE in
        1)
            # Auto-generate migration
            echo "Auto-generating migration from model changes..."
            if python3 -m alembic revision --autogenerate -m "$MESSAGE"; then
                echo -e "${GREEN}✓ Auto-generated migration created${NC}"
            else
                echo -e "${RED}✗ Failed to create auto-generated migration${NC}"
                cd ..
                exit 1
            fi
            ;;
        2)
            # Empty migration
            echo "Creating empty migration..."
            if python3 -m alembic revision -m "$MESSAGE"; then
                echo -e "${GREEN}✓ Empty migration created${NC}"
            else
                echo -e "${RED}✗ Failed to create empty migration${NC}"
                cd ..
                exit 1
            fi
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            cd ..
            exit 1
            ;;
    esac
    
    # Show the new migration file
    if [ -d "alembic/versions" ]; then
        NEW_MIGRATION=$(find alembic/versions -name "*.py" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2- || find alembic/versions -name "*.py" -type f | tail -1)
        if [ -n "$NEW_MIGRATION" ]; then
            echo "Migration file: ${NEW_MIGRATION}"
            
            # Open in editor?
            read -p "Open in editor? (y/N): " open_editor
            if [ "$open_editor" = "y" ]; then
                ${EDITOR:-nano} "$NEW_MIGRATION"
            fi
        fi
    fi
    
    cd ..
}

# -----------------------------------------------------------------------------
# 7. SEED DEVELOPMENT DATA
# -----------------------------------------------------------------------------

function seed_development_data() {
    echo -e "${BLUE}Seeding development data...${NC}"
    
    # Check environment (optional warning)
    if [ "${ENVIRONMENT:-development}" != "development" ]; then
        echo -e "${YELLOW}⚠️  Warning: Not in development environment!${NC}"
        read -p "Continue anyway? (y/N): " confirm
        if [ "$confirm" != "y" ]; then
            exit 0
        fi
    fi
    
    # Look for seed scripts
    if [ ! -d "./backend" ]; then
        echo -e "${RED}Backend directory not found!${NC}"
        exit 1
    fi
    
    SEED_SCRIPTS=()
    if [ -d "./backend/scripts" ]; then
        while IFS= read -r -d '' script; do
            SEED_SCRIPTS+=("$script")
        done < <(find ./backend/scripts -name "seed_*.py" -type f -print0 2>/dev/null)
    fi
    
    # Also check for common seed file locations
    [ -f "./backend/seed_data.py" ] && SEED_SCRIPTS+=("./backend/seed_data.py")
    [ -f "./backend/app/seed.py" ] && SEED_SCRIPTS+=("./backend/app/seed.py")
    
    if [ ${#SEED_SCRIPTS[@]} -eq 0 ]; then
        echo -e "${YELLOW}No seed scripts found in ./backend/scripts/ or common locations${NC}"
        echo "You can create seed scripts like:"
        echo "  ./backend/scripts/seed_users.py"
        echo "  ./backend/scripts/seed_sample_data.py"
        return 1
    fi
    
    echo "Available seed scripts:"
    for i in "${!SEED_SCRIPTS[@]}"; do
        echo "  $((i+1))) ${SEED_SCRIPTS[$i]}"
    done
    echo "  a) Run all"
    
    read -p "Choice: " choice
    
    if [ "$choice" = "a" ]; then
        for script in "${SEED_SCRIPTS[@]}"; do
            run_seed_script "$script"
        done
    elif [[ "$choice" =~ ^[0-9]+$ ]] && [ "$choice" -ge 1 ] && [ "$choice" -le ${#SEED_SCRIPTS[@]} ]; then
        run_seed_script "${SEED_SCRIPTS[$((choice-1))]}"
    else
        echo -e "${RED}Invalid choice${NC}"
        exit 1
    fi
}

function run_seed_script() {
    local script="$1"
    echo -e "${BLUE}Running: ${script}${NC}"
    
    if [ ! -f "$script" ]; then
        echo -e "${RED}✗ Seed script not found: ${script}${NC}"
        return 1
    fi
    
    cd backend
    
    # Run the seed script
    if python3 "../$script"; then
        echo -e "${GREEN}✓ Seed script completed: $(basename "$script")${NC}"
    else
        echo -e "${RED}✗ Seed script failed: $(basename "$script")${NC}"
    fi
    
    cd ..
}

# -----------------------------------------------------------------------------
# 8. DATABASE VERIFICATION AND RESTORE
# -----------------------------------------------------------------------------

function verify_database_schema() {
    echo -e "${BLUE}Verifying database schema...${NC}"
    
    if [ ! -f "$DB_PATH" ]; then
        echo -e "${RED}Database file not found: ${DB_PATH}${NC}"
        return 1
    fi
    
    # Check database integrity
    if sqlite3 "$DB_PATH" "PRAGMA integrity_check;" | grep -q "ok"; then
        echo -e "${GREEN}✓ Database integrity check passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Database integrity check failed${NC}"
    fi
    
    # List all tables
    echo "Database tables:"
    TABLES=$(sqlite3 "$DB_PATH" "SELECT name FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "")
    
    if [ -n "$TABLES" ]; then
        echo "$TABLES" | while read -r table; do
            if [ -n "$table" ]; then
                ROW_COUNT=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM \"$table\";" 2>/dev/null || echo "?")
                echo "  ✓ Table '$table' (${ROW_COUNT} rows)"
            fi
        done
    else
        echo -e "${YELLOW}  No tables found in database${NC}"
    fi
    
    # Check indexes
    echo ""
    echo "Database indexes:"
    INDEXES=$(sqlite3 "$DB_PATH" "SELECT name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%';" 2>/dev/null || echo "")
    
    if [ -n "$INDEXES" ]; then
        echo "$INDEXES" | while read -r index; do
            if [ -n "$index" ]; then
                echo "  ✓ Index '$index'"
            fi
        done
    else
        echo "  No custom indexes found"
    fi
    
    # Run backend validation if available
    if [ -d "./backend" ]; then
        echo ""
        echo "Running backend schema validation..."
        cd backend
        
        # Try to run a simple Python validation
        if python3 -c "import sys; sys.path.append('.'); from app.database import engine; print('✓ Backend can connect to database')" 2>/dev/null; then
            echo -e "${GREEN}✓ Backend database connection verified${NC}"
        else
            echo -e "${YELLOW}⚠️  Backend database connection test failed${NC}"
        fi
        
        cd ..
    fi
}

function restore_from_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ] || [ ! -f "$backup_file" ]; then
        echo -e "${RED}Backup file not found: ${backup_file}${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Restoring database from backup...${NC}"
    
    # Create a backup of current state
    if [ -f "$DB_PATH" ]; then
        CURRENT_BACKUP="${DB_PATH}.pre-restore-$(date +%Y%m%d_%H%M%S)"
        cp "$DB_PATH" "$CURRENT_BACKUP"
        echo "Current database backed up to: $CURRENT_BACKUP"
    fi
    
    # Restore from backup
    if cp "$backup_file" "$DB_PATH"; then
        echo -e "${GREEN}✓ Database restored from backup${NC}"
        verify_database_schema
    else
        echo -e "${RED}✗ Failed to restore from backup${NC}"
        return 1
    fi
}

# -----------------------------------------------------------------------------
# 9. MAIN EXECUTION
# -----------------------------------------------------------------------------

# Show help function
function show_help() {
    echo "Usage: ./scripts/update-data.sh [command] [options]"
    echo ""
    echo "SQLite Database Management Commands:"
    echo "  status      Show current migration status and database info"
    echo "  migrate     Run pending migrations via Alembic"
    echo "  rollback    Rollback last migration"
    echo "  create      Create new migration"
    echo "  seed        Seed development data"
    echo "  verify      Verify database schema and integrity"
    echo "  backup      Create database backup"
    echo "  help        Show this help message"
    echo ""
    echo "Options:"
    echo "  --force     Skip confirmations (use with caution)"
    echo ""
    echo "Examples:"
    echo "  ./scripts/update-data.sh status                    # Show migration status"
    echo "  ./scripts/update-data.sh migrate                  # Apply pending migrations"
    echo "  ./scripts/update-data.sh create                   # Create new migration"
    echo "  ./scripts/update-data.sh seed                     # Run seed scripts"
    echo ""
    echo "Database location: ${DB_PATH}"
}

# Parse additional options
FORCE_MODE=false
for arg in "$@"; do
    case $arg in
        --force)
            FORCE_MODE=true
            ;;
    esac
done

# Always check database connection first
echo -e "${BLUE}Magnetiq v2 SQLite Database Manager${NC}"
echo "==============================================="
echo ""

check_database_connection

# Execute command
case $COMMAND in
    status)
        show_migration_status
        ;;
    
    migrate)
        run_migrations
        ;;
    
    rollback)
        rollback_migration
        ;;
    
    create)
        create_migration
        ;;
    
    seed)
        seed_development_data
        ;;
    
    verify)
        verify_database_schema
        ;;
    
    backup)
        backup_database
        ;;
    
    help|--help|-h)
        show_help
        ;;
    
    *)
        echo -e "${RED}Unknown command: ${COMMAND}${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Operation completed!${NC}"
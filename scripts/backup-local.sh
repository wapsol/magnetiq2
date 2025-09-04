#!/bin/bash
# ==============================================================================
# backup-local.sh - Complete local development data backup
# ==============================================================================
# Purpose: Create comprehensive backups of all development data and configuration
# Usage: ./scripts/backup-local.sh [backup-name] [options]
# Options:
#   --compress      Use maximum compression
#   --encrypt       Encrypt backup (requires gpg)
#   --cloud         Upload to cloud storage after creation
#   --full          Include everything (logs, cache, etc.)
# ==============================================================================

# -----------------------------------------------------------------------------
# 1. CONFIGURATION AND SETUP
# -----------------------------------------------------------------------------

# Set default values
BACKUP_NAME="${1:-backup-$(date +%Y%m%d_%H%M%S)}"
COMPRESS_LEVEL=6  # Default compression
ENCRYPT_BACKUP=false
UPLOAD_TO_CLOUD=false
FULL_BACKUP=false

BACKUP_DIR="./backups"
TEMP_BACKUP_DIR=$(mktemp -d)

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Parse options
for arg in "$@"; do
    case $arg in
        --compress)
            COMPRESS_LEVEL=9
            ;;
        --encrypt)
            ENCRYPT_BACKUP=true
            ;;
        --cloud)
            UPLOAD_TO_CLOUD=true
            ;;
        --full)
            FULL_BACKUP=true
            ;;
    esac
done

# -----------------------------------------------------------------------------
# 2. PRE-BACKUP CHECKS
# -----------------------------------------------------------------------------

function pre_backup_checks() {
    echo -e "${BLUE}Performing pre-backup checks...${NC}"
    
    # Check available disk space
    AVAILABLE_SPACE=$(df -h . | tail -1 | awk '{print $4}')
    ESTIMATED_BACKUP_SIZE=$(calculate_backup_size)
    
    echo "Available space: ${AVAILABLE_SPACE}"
    echo "Estimated backup size: ${ESTIMATED_BACKUP_SIZE}"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$TEMP_BACKUP_DIR"
    
    echo -e "${GREEN}✓ Pre-backup checks completed${NC}"
}

function calculate_backup_size() {
    SIZE=0
    
    # SQLite database
    if [ -f "./data/magnetiq.db" ]; then
        DB_SIZE=$(du -sb "./data/magnetiq.db" 2>/dev/null | cut -f1 || echo 0)
        SIZE=$((SIZE + DB_SIZE))
    fi
    
    # Media files
    if [ -d "./media" ]; then
        MEDIA_SIZE=$(du -sb ./media 2>/dev/null | cut -f1 || echo 0)
        SIZE=$((SIZE + MEDIA_SIZE))
    fi
    
    # Data directory
    if [ -d "./data" ]; then
        DATA_SIZE=$(du -sb ./data 2>/dev/null | cut -f1 || echo 0)
        SIZE=$((SIZE + DATA_SIZE))
    fi
    
    # Convert to human readable
    if [ $SIZE -gt 1073741824 ]; then
        echo "$(echo "scale=1; $SIZE/1073741824" | bc)GB"
    elif [ $SIZE -gt 1048576 ]; then
        echo "$(echo "scale=1; $SIZE/1048576" | bc)MB"
    elif [ $SIZE -gt 1024 ]; then
        echo "$(echo "scale=1; $SIZE/1024" | bc)KB"
    else
        echo "${SIZE}B"
    fi
}

# -----------------------------------------------------------------------------
# 3. BACKUP DATABASE
# -----------------------------------------------------------------------------

function backup_database() {
    echo -e "${BLUE}Backing up database...${NC}"
    
    # Check if SQLite database exists
    if [ -f "./data/magnetiq.db" ]; then
        echo "Creating SQLite backup..."
        
        # Create backup using SQLite backup command for consistency
        if command -v sqlite3 >/dev/null 2>&1; then
            # Use SQLite's backup command for a consistent backup
            sqlite3 "./data/magnetiq.db" ".backup ${TEMP_BACKUP_DIR}/magnetiq.db"
            
            if [ $? -eq 0 ]; then
                # Also create SQL dump for portability
                sqlite3 "./data/magnetiq.db" ".dump" > "${TEMP_BACKUP_DIR}/magnetiq_dump.sql"
                
                # Get database statistics
                DB_STATS=$(sqlite3 "./data/magnetiq.db" "
                    SELECT 
                        COUNT(name) as tables,
                        page_count * page_size as size
                    FROM sqlite_master 
                    WHERE type='table' AND name NOT LIKE 'sqlite_%';
                    PRAGMA page_count;
                    PRAGMA page_size;
                " 2>/dev/null || echo "Could not get stats")
                
                echo "$DB_STATS" > "${TEMP_BACKUP_DIR}/database_stats.txt"
                
                # Get database info
                sqlite3 "./data/magnetiq.db" ".schema" > "${TEMP_BACKUP_DIR}/schema.sql"
                
                echo -e "${GREEN}✓ SQLite database backup completed${NC}"
            else
                echo -e "${RED}✗ SQLite backup failed!${NC}"
                return 1
            fi
        else
            echo "sqlite3 command not found, using file copy..."
            # Fallback to file copy
            cp "./data/magnetiq.db" "${TEMP_BACKUP_DIR}/magnetiq.db"
            echo -e "${YELLOW}✓ SQLite backup completed (file copy)${NC}"
        fi
    else
        echo -e "${YELLOW}No SQLite database found at ./data/magnetiq.db${NC}"
    fi
}

# -----------------------------------------------------------------------------
# 4. BACKUP MEDIA AND DATA FILES
# -----------------------------------------------------------------------------

function backup_files() {
    echo -e "${BLUE}Backing up files...${NC}"
    
    # Media files
    if [ -d "./media" ] && [ "$(ls -A ./media 2>/dev/null)" ]; then
        echo "Backing up media files..."
        
        MEDIA_SIZE=$(du -sh ./media | cut -f1)
        echo "Media directory size: ${MEDIA_SIZE}"
        
        # Copy media files preserving structure
        cp -r ./media "${TEMP_BACKUP_DIR}/"
        
        # Create media inventory
        find ./media -type f -exec ls -lah {} + > "${TEMP_BACKUP_DIR}/media_inventory.txt"
        
        echo -e "${GREEN}✓ Media files backed up${NC}"
    else
        echo "No media files to backup"
    fi
    
    # Data directory (excluding database if already backed up)
    if [ -d "./data" ] && [ "$(ls -A ./data 2>/dev/null)" ]; then
        echo "Backing up data directory..."
        
        # Create data backup directory
        mkdir -p "${TEMP_BACKUP_DIR}/data"
        
        # Copy data files excluding database files if already backed up separately
        if [ -f "${TEMP_BACKUP_DIR}/magnetiq.db" ]; then
            rsync -av --exclude='*.db' ./data/ "${TEMP_BACKUP_DIR}/data/"
        else
            cp -r ./data/* "${TEMP_BACKUP_DIR}/data/" 2>/dev/null || true
        fi
        
        echo -e "${GREEN}✓ Data files backed up${NC}"
    fi
    
    # Logs (if full backup)
    if [ "$FULL_BACKUP" = true ]; then
        if [ -d "./logs" ] && [ "$(ls -A ./logs 2>/dev/null)" ]; then
            echo "Backing up logs..."
            cp -r ./logs "${TEMP_BACKUP_DIR}/"
            echo -e "${GREEN}✓ Logs backed up${NC}"
        fi
    fi
}

# -----------------------------------------------------------------------------
# 5. BACKUP CONFIGURATION
# -----------------------------------------------------------------------------

function backup_configuration() {
    echo -e "${BLUE}Backing up configuration...${NC}"
    
    # Environment files
    if [ -f ".env.local" ]; then
        cp .env.local "${TEMP_BACKUP_DIR}/env.local"
        echo "✓ Environment configuration backed up"
    fi
    
    # Application configuration
    if [ -d "./backend/app/config" ]; then
        cp -r ./backend/app/config "${TEMP_BACKUP_DIR}/"
    fi
    
    # Frontend configuration
    if [ -f "./frontend/.env" ]; then
        cp ./frontend/.env "${TEMP_BACKUP_DIR}/frontend.env"
    fi
    
    # Git information
    GIT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    GIT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
    
    echo "Git commit: ${GIT_COMMIT}" > "${TEMP_BACKUP_DIR}/git_info.txt"
    echo "Git branch: ${GIT_BRANCH}" >> "${TEMP_BACKUP_DIR}/git_info.txt"
    
    echo -e "${GREEN}✓ Configuration backed up${NC}"
}

# -----------------------------------------------------------------------------
# 6. CREATE BACKUP METADATA
# -----------------------------------------------------------------------------

function create_backup_metadata() {
    echo -e "${BLUE}Creating backup metadata...${NC}"
    
    METADATA_FILE="${TEMP_BACKUP_DIR}/backup_metadata.json"
    
    # Get database size if it exists
    DB_SIZE="0"
    if [ -f "${TEMP_BACKUP_DIR}/magnetiq.db" ]; then
        DB_SIZE=$(ls -la "${TEMP_BACKUP_DIR}/magnetiq.db" | awk '{print $5}')
    fi
    
    # Count media files
    MEDIA_FILES=0
    if [ -d "${TEMP_BACKUP_DIR}/media" ]; then
        MEDIA_FILES=$(find "${TEMP_BACKUP_DIR}/media" -type f | wc -l 2>/dev/null || echo 0)
    fi
    
    # Get total size
    TOTAL_SIZE=$(du -sh "${TEMP_BACKUP_DIR}" | cut -f1)
    
    # Create comprehensive metadata
    cat > "$METADATA_FILE" << EOF
{
    "backup_info": {
        "name": "${BACKUP_NAME}",
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
        "hostname": "$(hostname)",
        "user": "$(whoami)",
        "type": "$(if [ "$FULL_BACKUP" = true ]; then echo "full"; else echo "standard"; fi)"
    },
    "application": {
        "name": "magnetiq2",
        "version": "$(cat package.json 2>/dev/null | grep '"version"' | cut -d'"' -f4 || echo 'unknown')",
        "git_commit": "${GIT_COMMIT}",
        "git_branch": "${GIT_BRANCH}"
    },
    "database": {
        "type": "sqlite",
        "size": "${DB_SIZE}",
        "location": "./data/magnetiq.db"
    },
    "files": {
        "media_files": "${MEDIA_FILES}",
        "total_size": "${TOTAL_SIZE}"
    },
    "system": {
        "os": "$(uname -s)",
        "sqlite_version": "$(sqlite3 --version 2>/dev/null | cut -d' ' -f1 || echo 'unknown')"
    }
}
EOF
    
    echo -e "${GREEN}✓ Metadata created${NC}"
}

# -----------------------------------------------------------------------------
# 7. COMPRESS AND FINALIZE BACKUP
# -----------------------------------------------------------------------------

function compress_backup() {
    echo -e "${BLUE}Compressing backup...${NC}"
    
    FINAL_BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    
    # Create compressed archive
    cd "$TEMP_BACKUP_DIR" || exit 1
    tar -czf "$FINAL_BACKUP_PATH" ./* --use-compress-program="gzip -${COMPRESS_LEVEL}"
    
    if [ $? -eq 0 ]; then
        BACKUP_SIZE=$(ls -lah "$FINAL_BACKUP_PATH" | awk '{print $5}')
        echo -e "${GREEN}✓ Backup compressed: ${BACKUP_SIZE}${NC}"
        
        # Generate checksums
        md5sum "$FINAL_BACKUP_PATH" > "${FINAL_BACKUP_PATH}.md5"
        sha256sum "$FINAL_BACKUP_PATH" > "${FINAL_BACKUP_PATH}.sha256"
        
        echo -e "${GREEN}✓ Checksums generated${NC}"
    else
        echo -e "${RED}✗ Compression failed!${NC}"
        return 1
    fi
}

# -----------------------------------------------------------------------------
# 8. OPTIONAL ENCRYPTION
# -----------------------------------------------------------------------------

function encrypt_backup() {
    if [ "$ENCRYPT_BACKUP" != true ]; then
        return 0
    fi
    
    echo -e "${BLUE}Encrypting backup...${NC}"
    
    # Check if GPG is available
    if ! command -v gpg >/dev/null 2>&1; then
        echo -e "${RED}GPG not found. Cannot encrypt backup.${NC}"
        return 1
    fi
    
    # Get recipient email
    read -p "Enter GPG recipient email: " GPG_RECIPIENT
    
    # Encrypt the backup
    gpg --trust-model always --encrypt -r "$GPG_RECIPIENT" "$FINAL_BACKUP_PATH"
    
    if [ $? -eq 0 ]; then
        # Remove unencrypted version
        rm "$FINAL_BACKUP_PATH"
        rm "${FINAL_BACKUP_PATH}.md5"
        rm "${FINAL_BACKUP_PATH}.sha256"
        
        # Generate new checksums for encrypted file
        ENCRYPTED_FILE="${FINAL_BACKUP_PATH}.gpg"
        md5sum "$ENCRYPTED_FILE" > "${ENCRYPTED_FILE}.md5"
        sha256sum "$ENCRYPTED_FILE" > "${ENCRYPTED_FILE}.sha256"
        
        FINAL_BACKUP_PATH="$ENCRYPTED_FILE"
        echo -e "${GREEN}✓ Backup encrypted${NC}"
    else
        echo -e "${RED}✗ Encryption failed!${NC}"
        return 1
    fi
}

# -----------------------------------------------------------------------------
# 9. CLEANUP AND REPORTING
# -----------------------------------------------------------------------------

function cleanup_and_report() {
    # Clean up temporary directory
    rm -rf "$TEMP_BACKUP_DIR"
    
    # Show final report
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}   Backup Completed Successfully! ✓${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════${NC}"
    echo ""
    echo "Backup Details:"
    echo "  Name: ${BACKUP_NAME}"
    echo "  Location: ${FINAL_BACKUP_PATH}"
    echo "  Size: $(ls -lah "${FINAL_BACKUP_PATH}" | awk '{print $5}')"
    echo "  Type: $(if [ "$FULL_BACKUP" = true ]; then echo "Full"; else echo "Standard"; fi)"
    echo "  Encrypted: $(if [ "$ENCRYPT_BACKUP" = true ]; then echo "Yes"; else echo "No"; fi)"
    echo ""
    echo "Contents:"
    echo "  • SQLite database backup"
    echo "  • Configuration files"
    echo "  • Media files"
    echo "  • Application data"
    if [ "$FULL_BACKUP" = true ]; then
        echo "  • Log files"
    fi
    echo ""
    echo "To restore this backup:"
    echo "  ./scripts/restore-local.sh ${BACKUP_NAME}"
    echo ""
    echo "Backup files:"
    ls -la "${BACKUP_DIR}/${BACKUP_NAME}"*
}

# -----------------------------------------------------------------------------
# 10. MAIN EXECUTION
# -----------------------------------------------------------------------------

# Execute backup process
echo -e "${BLUE}Starting backup process...${NC}"
echo "Backup name: ${BACKUP_NAME}"

pre_backup_checks
backup_database
backup_files
backup_configuration
create_backup_metadata
compress_backup
encrypt_backup
cleanup_and_report

echo -e "${GREEN}Backup process completed!${NC}"
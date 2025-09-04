#!/bin/bash
# ==============================================================================
# dev-start.sh - Start local development environment with SQLite
# ==============================================================================
# Purpose: Initialize and start the complete development environment with SQLite
# Usage: ./scripts/dev-start.sh [options]
# Options:
#   --frontend-only    Start only the frontend development server
#   --backend-only     Start only the backend development server
#   --no-browser       Don't open browser automatically
# ==============================================================================

# -----------------------------------------------------------------------------
# 1. CONFIGURATION AND SETUP
# -----------------------------------------------------------------------------

# Parse options
FRONTEND_ONLY=false
BACKEND_ONLY=false
NO_BROWSER=false

for arg in "$@"; do
    case $arg in
        --frontend-only)
            FRONTEND_ONLY=true
            ;;
        --backend-only)
            BACKEND_ONLY=true
            ;;
        --no-browser)
            NO_BROWSER=true
            ;;
    esac
done

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DB_PATH="./data/magnetiq.db"
BACKEND_PORT=8037
FRONTEND_PORT=8040

# -----------------------------------------------------------------------------
# 2. ENVIRONMENT CHECKS
# -----------------------------------------------------------------------------

function check_prerequisites() {
    echo -e "${BLUE}Checking prerequisites...${NC}"
    
    # Check Python
    if ! command -v python3 >/dev/null 2>&1; then
        echo -e "${RED}✗ Python3 is required but not installed${NC}"
        exit 1
    else
        PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
        echo -e "${GREEN}✓ Python3 found (${PYTHON_VERSION})${NC}"
    fi
    
    # Check Node.js and npm
    if ! command -v node >/dev/null 2>&1; then
        echo -e "${RED}✗ Node.js is required but not installed${NC}"
        exit 1
    else
        NODE_VERSION=$(node --version 2>&1)
        echo -e "${GREEN}✓ Node.js found (${NODE_VERSION})${NC}"
    fi
    
    if ! command -v npm >/dev/null 2>&1; then
        echo -e "${RED}✗ npm is required but not installed${NC}"
        exit 1
    else
        NPM_VERSION=$(npm --version 2>&1)
        echo -e "${GREEN}✓ npm found (${NPM_VERSION})${NC}"
    fi
    
    # Check SQLite
    if ! command -v sqlite3 >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  SQLite3 not found. Database operations may be limited.${NC}"
    else
        SQLITE_VERSION=$(sqlite3 --version 2>&1 | cut -d' ' -f1)
        echo -e "${GREEN}✓ SQLite3 found (${SQLITE_VERSION})${NC}"
    fi
}

function setup_configuration() {
    echo -e "${BLUE}Setting up configuration...${NC}"
    
    # Check for backend environment configuration
    if [ ! -f ".env.local" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env.local
            echo -e "${GREEN}✓ Created .env.local from template${NC}"
            echo -e "${YELLOW}Please review .env.local and update:${NC}"
            echo "  - SECRET_KEY"
            echo "  - Database settings (already configured for SQLite)"
            echo "  - API keys if needed"
        else
            echo -e "${YELLOW}Creating basic .env.local file...${NC}"
            cat > .env.local << EOF
# Magnetiq v2 Local Development Configuration
DATABASE_URL=sqlite:///./data/magnetiq.db
SECRET_KEY=development-secret-key-change-in-production
DEBUG=true
ENVIRONMENT=development
EOF
            echo -e "${GREEN}✓ Basic .env.local created${NC}"
        fi
    else
        echo -e "${GREEN}✓ .env.local already exists${NC}"
    fi
    
    # Check for frontend environment
    if [ -d "./frontend" ] && [ ! -f "./frontend/.env" ]; then
        if [ -f "./frontend/.env.example" ]; then
            cp ./frontend/.env.example ./frontend/.env
            echo -e "${GREEN}✓ Created frontend .env from template${NC}"
        else
            echo -e "${YELLOW}Creating basic frontend .env...${NC}"
            cat > ./frontend/.env << EOF
VITE_API_URL=http://localhost:${BACKEND_PORT}
VITE_APP_NAME=Magnetiq v2
VITE_ENVIRONMENT=development
EOF
            echo -e "${GREEN}✓ Basic frontend .env created${NC}"
        fi
    fi
    
    # Ensure data directory exists
    mkdir -p ./data
    echo -e "${GREEN}✓ Data directory ready${NC}"
}

# -----------------------------------------------------------------------------
# 3. CLEANUP PREVIOUS STATE
# -----------------------------------------------------------------------------

function cleanup_previous_processes() {
    echo -e "${BLUE}Cleaning up any previous processes...${NC}"
    
    # Check for existing backend processes
    BACKEND_PID=$(lsof -ti :$BACKEND_PORT 2>/dev/null || echo "")
    if [ -n "$BACKEND_PID" ]; then
        echo "  Stopping existing backend server (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
        sleep 2
        # Force kill if still running
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill -9 $BACKEND_PID 2>/dev/null
        fi
        echo -e "${GREEN}✓ Backend server stopped${NC}"
    fi
    
    # Check for existing frontend processes
    FRONTEND_PID=$(lsof -ti :$FRONTEND_PORT 2>/dev/null || echo "")
    if [ -n "$FRONTEND_PID" ]; then
        echo "  Stopping existing frontend server (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
        sleep 2
        # Force kill if still running
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill -9 $FRONTEND_PID 2>/dev/null
        fi
        echo -e "${GREEN}✓ Frontend server stopped${NC}"
    fi
    
    if [ -z "$BACKEND_PID" ] && [ -z "$FRONTEND_PID" ]; then
        echo -e "${GREEN}✓ No previous processes to clean up${NC}"
    fi
}

# -----------------------------------------------------------------------------
# 4. INSTALL DEPENDENCIES AND START SERVICES
# -----------------------------------------------------------------------------

function install_dependencies() {
    echo -e "${BLUE}Installing dependencies...${NC}"
    
    # Install backend dependencies
    if [ -f "./backend/requirements.txt" ] || [ -f "./backend/pyproject.toml" ]; then
        echo "Installing Python dependencies..."
        cd backend
        
        if [ -f "requirements.txt" ]; then
            pip3 install -r requirements.txt
        elif [ -f "pyproject.toml" ]; then
            pip3 install -e .
        fi
        
        cd ..
        echo -e "${GREEN}✓ Backend dependencies installed${NC}"
    fi
    
    # Install frontend dependencies
    if [ -d "./frontend" ] && [ -f "./frontend/package.json" ]; then
        echo "Installing Node.js dependencies..."
        cd frontend
        npm install
        cd ..
        echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    fi
}

function start_backend() {
    if [ "$FRONTEND_ONLY" = true ]; then
        return 0
    fi
    
    echo -e "${BLUE}Starting backend server...${NC}"
    
    if [ ! -d "./backend" ]; then
        echo -e "${RED}✗ Backend directory not found${NC}"
        return 1
    fi
    
    cd backend
    
    # Start backend with uvicorn
    python3 -m uvicorn app.main:app --host 0.0.0.0 --port $BACKEND_PORT --reload --app-dir . &
    BACKEND_PID=$!
    
    cd ..
    
    # Store PID for cleanup
    echo $BACKEND_PID > .backend.pid
    
    echo -e "${GREEN}✓ Backend server starting (PID: $BACKEND_PID)${NC}"
    echo "  Backend will be available at: http://localhost:$BACKEND_PORT"
    echo "  API documentation at: http://localhost:$BACKEND_PORT/docs"
}

function start_frontend() {
    if [ "$BACKEND_ONLY" = true ]; then
        return 0
    fi
    
    echo -e "${BLUE}Starting frontend server...${NC}"
    
    if [ ! -d "./frontend" ]; then
        echo -e "${YELLOW}⚠️  Frontend directory not found${NC}"
        return 0
    fi
    
    cd frontend
    
    # Start frontend development server
    npm run dev &
    FRONTEND_PID=$!
    
    cd ..
    
    # Store PID for cleanup
    echo $FRONTEND_PID > .frontend.pid
    
    echo -e "${GREEN}✓ Frontend server starting (PID: $FRONTEND_PID)${NC}"
    echo "  Frontend will be available at: http://localhost:$FRONTEND_PORT"
}

# -----------------------------------------------------------------------------
# 5. HEALTH CHECKS
# -----------------------------------------------------------------------------

function wait_for_services() {
    echo -e "${BLUE}Waiting for services to be healthy...${NC}"
    sleep 2  # Give services a moment to start
    
    # Wait for Backend API
    if [ "$FRONTEND_ONLY" != true ]; then
        echo "  Checking backend health..."
        for i in {1..30}; do
            if curl -f http://localhost:$BACKEND_PORT/health >/dev/null 2>&1; then
                echo -e "${GREEN}✓ Backend API is ready${NC}"
                break
            elif curl -f http://localhost:$BACKEND_PORT >/dev/null 2>&1; then
                echo -e "${GREEN}✓ Backend server is responding${NC}"
                break
            fi
            
            if [ $i -eq 30 ]; then
                echo -e "${YELLOW}⚠️  Backend API not responding after 30 seconds${NC}"
                echo "    Backend may still be starting up..."
            else
                sleep 1
            fi
        done
    fi
    
    # Wait for Frontend
    if [ "$BACKEND_ONLY" != true ] && [ -d "./frontend" ]; then
        echo "  Checking frontend health..."
        for i in {1..30}; do
            if curl -f http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
                echo -e "${GREEN}✓ Frontend is ready${NC}"
                break
            fi
            
            if [ $i -eq 30 ]; then
                echo -e "${YELLOW}⚠️  Frontend not responding after 30 seconds${NC}"
                echo "    Frontend may still be starting up..."
            else
                sleep 1
            fi
        done
    fi
    
    # Check SQLite database
    if [ -f "$DB_PATH" ]; then
        if sqlite3 "$DB_PATH" "SELECT 1;" >/dev/null 2>&1; then
            echo -e "${GREEN}✓ SQLite database is accessible${NC}"
        else
            echo -e "${YELLOW}⚠️  SQLite database connection issues${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  SQLite database not found (will be created on first use)${NC}"
    fi
}

# -----------------------------------------------------------------------------
# 6. DATABASE INITIALIZATION
# -----------------------------------------------------------------------------

function initialize_database() {
    echo -e "${BLUE}Initializing SQLite database...${NC}"
    
    # Ensure database directory exists
    mkdir -p "$(dirname "$DB_PATH")"
    
    # Initialize database if it doesn't exist
    if [ ! -f "$DB_PATH" ]; then
        echo "  Creating new SQLite database..."
        sqlite3 "$DB_PATH" "SELECT 1;" >/dev/null 2>&1
        echo -e "${GREEN}✓ SQLite database created${NC}"
    fi
    
    # Run database migrations if backend is available
    if [ "$FRONTEND_ONLY" != true ] && [ -d "./backend" ]; then
        echo "  Running database migrations..."
        
        cd backend
        
        # Check if Alembic is set up
        if [ -d "alembic" ] || [ -f "alembic.ini" ]; then
            if python3 -m alembic upgrade head; then
                echo -e "${GREEN}✓ Database migrations completed${NC}"
            else
                echo -e "${YELLOW}⚠️  Database migration issues (database may still work)${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  No Alembic configuration found${NC}"
        fi
        
        # Initialize admin user if script exists
        if [ -f "scripts/init_admin.py" ]; then
            echo "  Creating initial admin user..."
            if python3 scripts/init_admin.py; then
                echo -e "${GREEN}✓ Admin user initialized${NC}"
            else
                echo -e "${YELLOW}⚠️  Admin user initialization skipped${NC}"
            fi
        fi
        
        # Seed development data if available
        if [ -f "scripts/seed_dev_data.py" ]; then
            echo "  Seeding development data..."
            if python3 scripts/seed_dev_data.py; then
                echo -e "${GREEN}✓ Development data seeded${NC}"
            else
                echo -e "${YELLOW}⚠️  Development data seeding skipped${NC}"
            fi
        fi
        
        cd ..
    fi
}

# -----------------------------------------------------------------------------
# 7. DISPLAY STATUS AND FINAL SETUP
# -----------------------------------------------------------------------------

function display_status() {
    # Clear screen for clean output
    clear
    
    echo -e "${GREEN}===========================================${NC}"
    echo -e "${GREEN}   Magnetiq v2 Development Environment${NC}"
    echo -e "${GREEN}===========================================${NC}"
    echo ""
    echo -e "${BLUE}Services are running:${NC}"
    echo ""
    
    # Check which services are actually running
    if [ "$FRONTEND_ONLY" != true ]; then
        if lsof -ti :$BACKEND_PORT >/dev/null 2>&1; then
            echo -e "  ${GREEN}🔧 Backend API:${NC}  http://localhost:$BACKEND_PORT"
            echo -e "  ${GREEN}📋 API Docs:${NC}     http://localhost:$BACKEND_PORT/docs"
        else
            echo -e "  ${YELLOW}⚠️  Backend:${NC}      Not running"
        fi
    fi
    
    if [ "$BACKEND_ONLY" != true ] && [ -d "./frontend" ]; then
        if lsof -ti :$FRONTEND_PORT >/dev/null 2>&1; then
            echo -e "  ${GREEN}🌐 Frontend:${NC}     http://localhost:$FRONTEND_PORT"
        else
            echo -e "  ${YELLOW}⚠️  Frontend:${NC}     Not running"
        fi
    fi
    
    if [ -f "$DB_PATH" ]; then
        DB_SIZE=$(ls -lah "$DB_PATH" | awk '{print $5}')
        echo -e "  ${GREEN}🗄️  Database:${NC}     $DB_PATH (${DB_SIZE})"
    else
        echo -e "  ${YELLOW}⚠️  Database:${NC}     Will be created on first use"
    fi
    
    echo ""
    echo -e "${BLUE}Useful commands:${NC}"
    echo ""
    echo "  Manage database:  ./scripts/update-data.sh status"
    echo "  View processes:   ps aux | grep -E '(uvicorn|npm)'"
    echo "  Stop services:    pkill -f uvicorn; pkill -f 'npm run dev'"
    echo "  Backend logs:     tail -f backend/logs/*.log (if logging to file)"
    echo "  Database shell:   sqlite3 $DB_PATH"
    echo ""
    
    if [ "$NO_BROWSER" != true ]; then
        echo -e "${BLUE}Opening application in browser...${NC}"
        
        # Open frontend in browser if available
        if [ "$BACKEND_ONLY" != true ] && lsof -ti :$FRONTEND_PORT >/dev/null 2>&1; then
            if command -v open >/dev/null 2>&1; then  # macOS
                open http://localhost:$FRONTEND_PORT
            elif command -v xdg-open >/dev/null 2>&1; then  # Linux
                xdg-open http://localhost:$FRONTEND_PORT
            fi
        elif [ "$FRONTEND_ONLY" != true ] && lsof -ti :$BACKEND_PORT >/dev/null 2>&1; then
            # Fallback to backend docs
            if command -v open >/dev/null 2>&1; then  # macOS
                open http://localhost:$BACKEND_PORT/docs
            elif command -v xdg-open >/dev/null 2>&1; then  # Linux
                xdg-open http://localhost:$BACKEND_PORT/docs
            fi
        fi
    fi
    
    echo -e "${GREEN}===========================================${NC}"
    echo ""
    echo -e "${YELLOW}Development servers are running in the background.${NC}"
    echo -e "${YELLOW}To stop them, use: pkill -f uvicorn; pkill -f 'npm run dev'${NC}"
    echo ""
}

# -----------------------------------------------------------------------------
# 8. MAIN EXECUTION
# -----------------------------------------------------------------------------

# Trap to handle cleanup on script exit
trap 'echo -e "\n${YELLOW}Received interrupt signal. Development servers will continue running in background.${NC}"' INT

echo -e "${BLUE}Starting Magnetiq v2 Development Environment...${NC}"
echo "==============================================="
echo ""

# Execute setup steps
check_prerequisites
setup_configuration
cleanup_previous_processes
install_dependencies
start_backend
start_frontend
wait_for_services
initialize_database
display_status

echo -e "${GREEN}Development environment is ready!${NC}"
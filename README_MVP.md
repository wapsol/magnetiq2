# Magnetiq v2 - Content Management System

A modern, streamlined CMS with integrated business automation features including webinars, whitepapers, and consultation booking.

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optional)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd magnetiq2
   ```

2. **Backend Setup**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Copy environment file
   cp .env.example .env
   
   # Initialize database
   python scripts/create_admin.py
   
   # Start backend server
   uvicorn app.main:app --reload --port 3036
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:8036
   - Backend API: http://localhost:3036
   - API Documentation: http://localhost:3036/docs

### Docker Setup (Alternative)

```bash
# Start all services
docker-compose up -d

# Create admin user
docker-compose exec backend python scripts/create_admin.py
```

## 🏗️ Architecture

### Technology Stack
- **Backend**: Python, FastAPI, SQLite, SQLAlchemy, Alembic
- **Frontend**: React 18, TypeScript, Tailwind CSS, Redux Toolkit
- **Database**: SQLite with Write-Ahead Logging (WAL)
- **Authentication**: JWT with refresh tokens

### Key Features
- ✅ **Content Management**: Multilingual page management (EN/DE)
- ✅ **Webinar System**: Registration and management
- ✅ **Whitepaper Distribution**: Lead capture and analytics
- ✅ **Booking System**: Consultation scheduling
- ✅ **Admin Panel**: Role-based access control
- ✅ **API Documentation**: Auto-generated OpenAPI specs

## 📁 Project Structure

```
magnetiq2/
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── api/v1/         # API endpoints
│   │   ├── core/           # Security and permissions
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── main.py         # Application entry point
│   ├── migrations/         # Database migrations
│   └── scripts/           # Utility scripts
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store
│   │   └── hooks/         # Custom hooks
│   └── public/           # Static assets
└── docker/               # Docker configurations
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout

### Content Management
- `GET /api/v1/content/pages` - List pages
- `POST /api/v1/content/pages` - Create page
- `GET /api/v1/content/pages/{id}` - Get page
- `PUT /api/v1/content/pages/{id}` - Update page
- `DELETE /api/v1/content/pages/{id}` - Delete page

### Business Features
- `GET /api/v1/business/webinars` - List webinars
- `POST /api/v1/business/webinars` - Create webinar
- `POST /api/v1/business/webinars/{id}/register` - Register for webinar

## 🔒 Security Features

- JWT authentication with access and refresh tokens
- Role-based permissions (Admin, Editor, Viewer)
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- SQL injection prevention via SQLAlchemy

## 🌐 Multilingual Support

Magnetiq v2 supports English and German content:
- Content stored in JSON format: `{"en": "Title", "de": "Titel"}`
- Language-specific database views
- Full-text search per language
- Fallback to English if translation missing

## 🚢 Deployment

### Production Environment Variables

```bash
ENVIRONMENT=production
SECRET_KEY=your-secure-secret-key
DATABASE_URL=sqlite+aiosqlite:///./data/magnetiq_prod.db
DEBUG=false
ALLOWED_ORIGINS=https://yourdomain.com
```

### Database Migration

```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migration
alembic upgrade head
```

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📝 Development Notes

This MVP implementation focuses on:
- ✅ Core functionality demonstration
- ✅ Clean architecture patterns
- ✅ Rapid prototyping capabilities
- 🔄 Placeholder integrations for external services
- 🔄 Basic error handling and validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using modern web technologies for rapid prototyping and iteration.**
# Diagram Generation for Magnetiq v2 Documentation

Technical diagrams for shorts and specification documentation using Python Diagrams + Mermaid, with comprehensive dependency visualization capabilities.

## File Structure

```
docs/diagrams/
├── README.md                                    # This file
├── requirements.txt                             # Python dependencies
├── assets/
│   ├── shorts/                                  # Generated diagram images
│   │   ├── sqlalchemy_architecture.png         # SQLAlchemy architecture
│   │   ├── sqlalchemy_data_flow.png            # SQLAlchemy data flow
│   │   ├── sqlalchemy_query_flow.png           # Query processing
│   │   ├── sqlalchemy_relationships.png        # Model relationships
│   │   ├── sqlalchemy_session_lifecycle.png    # Session lifecycle
│   │   ├── sqlalchemy_transaction_scope.png    # Transaction boundaries
│   │   ├── feature_dependency_tree.png         # Feature dependency map
│   │   ├── fastapi_service_dependencies.png    # Service layer deps
│   │   ├── external_dependency_health.png      # External health checks
│   │   ├── deployment_dependencies.png         # Deployment chain
│   │   ├── model_dependencies_cascades.png     # Model cascades
│   │   ├── service_layer_dependencies.png      # Detailed service deps
│   │   ├── request_lifecycle_dependencies.png  # Request lifecycle
│   │   ├── data_flow_dependencies.png          # Data flow map
│   │   ├── comprehensive_health_check_tree.png # Health check tree
│   │   ├── deployment_dependency_chain.png     # Deployment deps
│   │   ├── failure_cascade_analysis.png        # Failure analysis
│   │   └── monitoring_dependencies.png         # Monitoring setup
│   └── specs/                                   # Specification diagrams
│       └── ...
└── generator/
    ├── common/
    │   └── styles.py                           # Shared styling & themes
    ├── shorts/
    │   ├── sqlalchemy_diagrams.py              # SQLAlchemy diagrams
    │   ├── feature_dependency_diagrams.py      # Feature dependency trees
    │   ├── enhanced_dependency_diagrams.py     # Enhanced model & data flow
    │   └── operational_dependency_diagrams.py  # Health & deployment deps
    └── generate_all_dependency_diagrams.py     # Master generator script
```

## Dependency Visualization Categories

### 🏗️ **Feature Dependencies**
- Feature dependency trees showing core → business → communication layers
- FastAPI service dependency maps with injection patterns
- External service dependency chains (SMTP, LinkedIn, Twitter APIs)

### 🗄️ **Database Dependencies**
- SQLAlchemy model relationships with cascade behavior
- Database transaction boundaries and scope
- Data flow through ORM layers

### 🔧 **Operational Dependencies**  
- Health check dependency trees for monitoring
- Deployment dependency chains for infrastructure
- Failure cascade analysis for incident response

### 📊 **Service Layer Dependencies**
- Request lifecycle dependency flow
- Service-to-service communication patterns
- Cross-cutting concern dependencies (auth, logging, validation)

## Quick Links

- **[Generated Images](./assets/shorts/)** - PNG diagrams for documentation
- **[Generator Scripts](./generator/shorts/)** - Python code for diagram creation
- **[Shared Styles](./generator/common/)** - Common styling and utilities

## Usage

### Generate All Dependency Diagrams
```bash
# Install dependencies
pip install -r requirements.txt

# Generate all dependency diagrams (recommended)
python generator/generate_all_dependency_diagrams.py
```

### Generate Specific Diagram Categories
```bash
# Feature dependency trees and service maps
python generator/shorts/feature_dependency_diagrams.py

# Enhanced model dependencies with cascades
python generator/shorts/enhanced_dependency_diagrams.py

# Health checks and deployment dependencies  
python generator/shorts/operational_dependency_diagrams.py

# Original SQLAlchemy architecture diagrams
python generator/shorts/sqlalchemy_diagrams.py
```

### Individual Diagram Generation
```bash
# Generate specific technology diagrams
python generator/shorts/[technology]_diagrams.py
```

## Diagram Design Principles

- **Horizontal Layout**: All diagrams use `direction="LR"` for optimal page width
- **Magnetiq Branding**: Consistent color scheme and styling via `styles.py`
- **Dependency Clarity**: Clear visualization of dependency chains and relationships
- **Operational Focus**: Emphasizes health monitoring and failure cascade analysis
- **Documentation Integration**: PNG outputs optimized for markdown embedding

All diagrams follow the established Magnetiq v2 design system and are optimized for both technical documentation and operational monitoring.
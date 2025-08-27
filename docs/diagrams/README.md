# Diagram Generation for Magnetiq v2 Documentation

Technical diagrams for shorts and specification documentation using Python Diagrams + Mermaid.

## File Structure

```
docs/diagrams/
├── README.md                           # This file
├── requirements.txt                    # Python dependencies
├── assets/
│   └── shorts/                         # Generated diagram images
│       ├── sqlalchemy_architecture.png
│       ├── sqlalchemy_data_flow.png
│       ├── sqlalchemy_query_flow.png
│       ├── sqlalchemy_relationships.png
│       ├── sqlalchemy_session_lifecycle.png
│       └── sqlalchemy_transaction_scope.png
└── generator/
    ├── common/
    │   └── styles.py                   # Shared styling & themes
    └── shorts/
        └── sqlalchemy_diagrams.py      # SQLAlchemy diagram generators
```

## Quick Links

- **[Generated Images](./assets/shorts/)** - PNG diagrams for documentation
- **[Generator Scripts](./generator/shorts/)** - Python code for diagram creation
- **[Shared Styles](./generator/common/)** - Common styling and utilities

## Usage

```bash
# Install dependencies
pip install -r requirements.txt

# Generate all diagrams
python generator/shorts/sqlalchemy_diagrams.py

# Generate specific technology diagrams
python generator/shorts/[technology]_diagrams.py
```

All diagrams use horizontal layouts (`direction="LR"`) optimized for documentation page width.
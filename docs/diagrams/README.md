# Diagram Generation for Magnetiq v2 Documentation

Technical diagrams for shorts and specification documentation using Python Diagrams + Mermaid.

## Structure

- **[assets/shorts/](./assets/shorts/)** - Generated diagram images for shorts documentation
- **[generator/shorts/](./generator/shorts/)** - Python diagram generation scripts
- **[generator/common/](./generator/common/)** - Shared styling and utilities
- **[requirements.txt](./requirements.txt)** - Diagram generation dependencies

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
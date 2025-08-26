# Alembic: Database Migration Management for SQLAlchemy

## What is Alembic?

Alembic is SQLAlchemy's official database migration tool, providing version control for database schemas. It enables developers to create, track, and apply incremental database changes systematically across development, staging, and production environments.

## Key Features

- **Version Control for Schemas**: Track database changes with unique revision identifiers
- **Auto-generation**: Compares SQLAlchemy models with database state to generate migrations
- **Bidirectional Migrations**: Support for both upgrade and downgrade operations
- **Environment Management**: Different configurations per environment
- **Branch Management**: Handle parallel development with migration branches

## Usage in Magnetiq2

Alembic manages the database schema with 15+ tables supporting multilingual content, audit trails, and business operations.

### Project Structure
```
backend/
├── migrations/              # Alembic migrations directory
│   ├── versions/           # Individual migration files
│   └── env.py             # Migration environment config
├── alembic.ini            # Alembic configuration file
└── app/models/            # SQLAlchemy models
```

### Configuration
```ini
# alembic.ini - async SQLAlchemy 2.0 setup
[alembic]
script_location = migrations
sqlalchemy.url = postgresql://user:pass@localhost/magnetiq_v2
file_template = %%(year)d%%(month).2d%%(day).2d_%%(hour).2d%%(minute).2d_%%(rev)s_%%(slug)s
```

## Essential Commands

### Installation & Setup
```bash
pip install alembic[async]  # For async SQLAlchemy 2.0
alembic init --template async migrations
```

### Migration Workflow
```bash
# Generate migration from model changes
alembic revision --autogenerate -m "Add phone column to users"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1

# Check status
alembic current
alembic history
```

## Best Practices

1. **Always Review Auto-Generated Migrations**
   - Check for missing foreign keys, incorrect nullable settings, data loss operations

2. **Include Downgrade Operations**
   ```python
   def downgrade():
       op.drop_column('users', 'phone')  # Don't leave empty
   ```

3. **Handle Data Migrations Carefully**
   ```python
   def upgrade():
       # Schema change first
       op.add_column('users', sa.Column('full_name', sa.String(200)))
       # Then migrate existing data
       connection = op.get_bind()
       connection.execute("UPDATE users SET full_name = first_name || ' ' || last_name")
   ```

4. **Use Meaningful Messages**
   ```bash
   alembic revision --autogenerate -m "Add booking status enum and update constraints"
   ```

## Common Pitfalls

- **Not reviewing auto-generated migrations** - Auto-generation isn't perfect
- **Forgetting downgrade operations** - Always implement proper rollback
- **Breaking changes without data migration** - Migrate data when changing column types
- **Ignoring autogenerate limitations** - Can't detect renames or complex transformations

## Alternatives

- **Django Migrations**: Built-in Django migration system
- **Flyway**: Java-based SQL-first migrations
- **Liquibase**: Enterprise change management with XML/YAML

Alembic's tight SQLAlchemy integration and powerful auto-generation make it the standard for Python database migrations in complex projects like Magnetiq2.

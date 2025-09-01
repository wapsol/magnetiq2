#!/usr/bin/env python3
"""
Database migration script to add new fields to admin_users table
"""

import sqlite3
import sys
from pathlib import Path

def migrate_admin_users_schema(db_path: str):
    """Add new fields to admin_users table"""
    
    connection = sqlite3.connect(db_path)
    cursor = connection.cursor()
    
    try:
        print("Starting admin_users table migration...")
        
        # List of new columns to add
        new_columns = [
            "last_password_change DATETIME",
            "phone_number VARCHAR(20)",
            "department VARCHAR(100)",
            "job_title VARCHAR(100)",
            "notes TEXT",
            "created_by INTEGER",
            "updated_by INTEGER",
            "last_login_ip VARCHAR(45)",
            "last_login_user_agent TEXT"
        ]
        
        # Check which columns already exist
        cursor.execute("PRAGMA table_info(admin_users)")
        existing_columns = [row[1] for row in cursor.fetchall()]
        
        # Add new columns that don't exist
        for column in new_columns:
            column_name = column.split()[0]
            if column_name not in existing_columns:
                try:
                    cursor.execute(f"ALTER TABLE admin_users ADD COLUMN {column}")
                    print(f"✓ Added column: {column_name}")
                except sqlite3.OperationalError as e:
                    if "duplicate column name" in str(e).lower():
                        print(f"→ Column {column_name} already exists, skipping")
                    else:
                        raise
        
        # Create audit_logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY,
                action VARCHAR(100) NOT NULL,
                resource_type VARCHAR(50) NOT NULL,
                resource_id INTEGER,
                performed_by INTEGER NOT NULL,
                performed_by_email VARCHAR(255),
                ip_address VARCHAR(45),
                user_agent TEXT,
                endpoint VARCHAR(255),
                old_values JSON,
                new_values JSON,
                reason TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                session_id VARCHAR(100),
                request_id VARCHAR(100)
            )
        """)
        
        # Create indexes for audit_logs
        indexes = [
            "CREATE INDEX IF NOT EXISTS ix_audit_logs_action ON audit_logs (action)",
            "CREATE INDEX IF NOT EXISTS ix_audit_logs_resource_type ON audit_logs (resource_type)",
            "CREATE INDEX IF NOT EXISTS ix_audit_logs_resource_id ON audit_logs (resource_id)",
            "CREATE INDEX IF NOT EXISTS ix_audit_logs_performed_by ON audit_logs (performed_by)",
            "CREATE INDEX IF NOT EXISTS ix_audit_logs_timestamp ON audit_logs (timestamp)"
        ]
        
        for index_sql in indexes:
            cursor.execute(index_sql)
        
        print("✓ Created audit_logs table with indexes")
        
        # Commit changes
        connection.commit()
        print("✓ Migration completed successfully!")
        
        # Update admin user role if it needs to be super_admin
        cursor.execute("SELECT id, email, role FROM admin_users WHERE email = 'admin@voltaic.systems'")
        admin_user = cursor.fetchone()
        
        if admin_user:
            user_id, email, current_role = admin_user
            if current_role == 'admin':
                cursor.execute(
                    "UPDATE admin_users SET role = 'super_admin' WHERE id = ?",
                    (user_id,)
                )
                connection.commit()
                print(f"✓ Updated {email} role from 'admin' to 'super_admin'")
        
        # Show current admin users
        cursor.execute("SELECT id, email, first_name, last_name, role, is_active FROM admin_users WHERE deleted_at IS NULL")
        users = cursor.fetchall()
        
        print("\\n=== CURRENT ADMIN USERS ===")
        for user in users:
            user_id, email, first_name, last_name, role, is_active = user
            status = "Active" if is_active else "Inactive"
            print(f"ID: {user_id} | {email} | {first_name} {last_name} | Role: {role} | Status: {status}")
        
        print("\\n=== AVAILABLE USER ROLES ===")
        roles = ["super_admin", "admin", "editor", "viewer"]
        for role in roles:
            print(f"- {role}")
        
    except Exception as e:
        connection.rollback()
        print(f"✗ Migration failed: {e}")
        sys.exit(1)
    finally:
        connection.close()

if __name__ == "__main__":
    db_path = "/Users/ashant/magnetiq2/data/magnetiq.db"
    if not Path(db_path).exists():
        print(f"✗ Database file not found: {db_path}")
        sys.exit(1)
    
    migrate_admin_users_schema(db_path)
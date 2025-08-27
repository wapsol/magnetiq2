#!/usr/bin/env python3
"""
SQLAlchemy Diagram Generator for Magnetiq v2 Documentation
Generates architecture and flow diagrams for SQLAlchemy short documentation
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.programming.framework import FastAPI
from diagrams.programming.language import Python
from diagrams.onprem.database import PostgreSQL
from diagrams.generic.storage import Storage
from diagrams.generic.compute import Rack
from diagrams.programming.flowchart import Decision, StartEnd
import os

# Ensure output directory exists
os.makedirs("../../assets/shorts", exist_ok=True)

def generate_sqlalchemy_architecture():
    """Generate the main SQLAlchemy architecture diagram for Magnetiq v2"""
    
    with Diagram("SQLAlchemy Architecture in Magnetiq v2", 
                show=False, 
                filename="../../assets/shorts/sqlalchemy_architecture",
                direction="TB",
                graph_attr={"fontsize": "14", "bgcolor": "white", "pad": "0.5"}):
        
        # Frontend layer
        with Cluster("Client Layer"):
            client = FastAPI("React Frontend\n(Port 8036)")
        
        # API layer
        with Cluster("API Layer"):
            api = FastAPI("FastAPI Backend\n(Port 3036)")
            
        # Business Logic layer
        with Cluster("Business Logic"):
            with Cluster("Service Layer"):
                content_svc = Python("Content Service")
                auth_svc = Python("Auth Service")
                booking_svc = Python("Booking Service")
                
        # ORM layer
        with Cluster("SQLAlchemy 2.0 ORM"):
            with Cluster("Models"):
                user_model = Python("User Model")
                page_model = Python("Page Model")
                booking_model = Python("Booking Model")
                
            with Cluster("Core Components"):
                session_factory = Rack("Async Session\nFactory")
                engine = Rack("Async Engine\n(aiosqlite)")
                
        # Migration layer
        with Cluster("Schema Management"):
            alembic = Storage("Alembic\nMigrations")
            
        # Database layer
        with Cluster("Database"):
            db = PostgreSQL("SQLite Database\n(WAL Mode)")
        
        # Define relationships
        client >> Edge(label="HTTP/JSON") >> api
        api >> Edge(label="Dependency\nInjection") >> [content_svc, auth_svc, booking_svc]
        
        content_svc >> page_model
        auth_svc >> user_model
        booking_svc >> booking_model
        
        [user_model, page_model, booking_model] >> session_factory
        session_factory >> Edge(label="Connection\nPool") >> engine
        engine >> Edge(label="SQL") >> db
        alembic >> Edge(label="DDL", style="dashed") >> db

def generate_sqlalchemy_session_lifecycle():
    """Generate SQLAlchemy async session lifecycle diagram"""
    
    with Diagram("SQLAlchemy Async Session Lifecycle",
                show=False,
                filename="../../assets/shorts/sqlalchemy_session_lifecycle",
                direction="LR",
                graph_attr={"fontsize": "12", "bgcolor": "white"}):
        
        start = StartEnd("API Request")
        
        with Cluster("Session Management"):
            acquire = Python("get_db()\nDependency")
            session_start = Rack("AsyncSession\nBegin")
            operations = Python("Database\nOperations")
            commit = Decision("Commit or\nRollback")
            cleanup = Rack("Session\nClose")
        
        end = StartEnd("Response")
        
        # Flow
        start >> acquire >> session_start
        session_start >> operations >> commit
        commit >> Edge(label="Success") >> cleanup
        commit >> Edge(label="Error", style="dashed", color="red") >> cleanup
        cleanup >> end

def generate_sqlalchemy_query_flow():
    """Generate SQLAlchemy query construction and execution flow"""
    
    with Diagram("SQLAlchemy Query Processing Flow",
                show=False,
                filename="../../assets/shorts/sqlalchemy_query_flow",
                direction="TB",
                graph_attr={"fontsize": "12", "bgcolor": "white", "ranksep": "0.5"}):
        
        # Query Construction Phase
        with Cluster("Query Construction"):
            select_stmt = Python("select(Model)")
            where_clause = Python(".where()")
            join_clause = Python(".join()")
            order_clause = Python(".order_by()")
        
        # Compilation Phase
        with Cluster("SQL Compilation"):
            compiler = Rack("SQL Compiler")
            sql_cache = Storage("Compiled\nQuery Cache")
        
        # Execution Phase
        with Cluster("Execution"):
            executor = Rack("Async Executor")
            conn_pool = Rack("Connection\nPool")
        
        # Result Processing
        with Cluster("Result Processing"):
            result_proc = Python("Result\nProcessor")
            orm_mapper = Python("ORM\nMapper")
            instances = Python("Model\nInstances")
        
        db = PostgreSQL("SQLite")
        
        # Define flow
        select_stmt >> where_clause >> join_clause >> order_clause
        order_clause >> compiler
        compiler >> sql_cache
        compiler >> executor
        executor >> conn_pool >> db
        db >> result_proc >> orm_mapper >> instances

def generate_sqlalchemy_relationship_mapping():
    """Generate SQLAlchemy relationship mapping diagram"""
    
    with Diagram("SQLAlchemy Model Relationships",
                show=False,
                filename="../../assets/shorts/sqlalchemy_relationships",
                direction="LR",
                graph_attr={"fontsize": "12", "bgcolor": "white"}):
        
        with Cluster("User Model"):
            user = Python("User\n- id: int\n- email: str\n- role: str")
        
        with Cluster("Page Model"):
            page = Python("Page\n- id: int\n- slug: str\n- title: JSON\n- author_id: FK")
        
        with Cluster("ContentBlock Model"):
            content = Python("ContentBlock\n- id: int\n- page_id: FK\n- content: JSON")
        
        with Cluster("Booking Model"):
            booking = Python("Booking\n- id: int\n- user_id: FK\n- date: datetime")
        
        # Relationships
        user >> Edge(label="1:N\nauthor", style="bold") >> page
        page >> Edge(label="1:N\ncontent_blocks", style="bold") >> content
        user >> Edge(label="1:N\nbookings", style="bold") >> booking

if __name__ == "__main__":
    print("Generating SQLAlchemy diagrams...")
    generate_sqlalchemy_architecture()
    print("✓ Generated architecture diagram")
    
    generate_sqlalchemy_session_lifecycle()
    print("✓ Generated session lifecycle diagram")
    
    generate_sqlalchemy_query_flow()
    print("✓ Generated query flow diagram")
    
    generate_sqlalchemy_relationship_mapping()
    print("✓ Generated relationship mapping diagram")
    
    print("\nAll diagrams generated successfully in docs/diagrams/assets/shorts/")
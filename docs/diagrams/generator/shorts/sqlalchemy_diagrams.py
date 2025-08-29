#!/usr/bin/env python3
"""
SQLAlchemy Diagram Generator for Magnetiq v2 Documentation
Generates architecture and flow diagrams for SQLAlchemy short documentation
All diagrams use horizontal layout (LR) for better page width optimization
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.programming.framework import FastAPI
from diagrams.programming.language import Python
from diagrams.onprem.database import PostgreSQL
from diagrams.generic.storage import Storage
from diagrams.generic.compute import Rack
from diagrams.programming.flowchart import Decision, StartEnd, Action
import os

# Ensure output directory exists
os.makedirs("../../assets/shorts", exist_ok=True)

def generate_sqlalchemy_architecture():
    """Generate horizontal SQLAlchemy architecture diagram for Magnetiq v2"""
    
    with Diagram("SQLAlchemy Architecture in Magnetiq v2", 
                show=False, 
                filename="../../assets/shorts/sqlalchemy_architecture",
                direction="LR",  # Horizontal layout
                graph_attr={
                    "fontsize": "12", 
                    "bgcolor": "white", 
                    "pad": "0.3",
                    "ranksep": "0.75",
                    "nodesep": "0.5",
                    "splines": "ortho"
                }):
        
        # Column 1: Frontend
        with Cluster("Frontend"):
            client = FastAPI("React\n8036")
        
        # Column 2: API
        with Cluster("API"):
            api = FastAPI("FastAPI\n3036")
            
        # Column 3: Business Logic
        with Cluster("Services"):
            content_svc = Python("Content")
            auth_svc = Python("Auth")
            book_a_meeting_svc = Python("BookAMeeting")
            
        # Column 4: ORM Layer
        with Cluster("SQLAlchemy 2.0"):
            models = Python("Models")
            session = Rack("Async\nSession")
            engine = Rack("Engine")
            
        # Column 5: Database & Migrations
        with Cluster("Data Layer"):
            db = PostgreSQL("SQLite\nWAL")
            alembic = Storage("Alembic")
        
        # Horizontal connections
        client >> api
        api >> Edge(label="DI") >> [content_svc, auth_svc, book_a_meeting_svc]
        [content_svc, auth_svc, book_a_meeting_svc] >> models
        models >> session >> engine >> db
        alembic >> Edge(style="dashed") >> db

def generate_sqlalchemy_session_lifecycle():
    """Generate horizontal async session lifecycle diagram"""
    
    with Diagram("SQLAlchemy Async Session Lifecycle",
                show=False,
                filename="../../assets/shorts/sqlalchemy_session_lifecycle",
                direction="LR",  # Horizontal flow
                graph_attr={
                    "fontsize": "11", 
                    "bgcolor": "white",
                    "ranksep": "0.5",
                    "nodesep": "0.3"
                }):
        
        # Linear horizontal flow
        start = StartEnd("Request")
        acquire = Python("get_db()")
        session_start = Rack("Begin\nSession")
        operations = Python("Execute\nQueries")
        commit = Decision("Success?")
        cleanup = Rack("Close")
        end = StartEnd("Response")
        
        # Horizontal flow with branches
        start >> acquire >> session_start >> operations >> commit
        commit >> Edge(label="Yes", color="green") >> cleanup >> end
        commit >> Edge(label="No", color="red", style="dashed") >> cleanup

def generate_sqlalchemy_query_flow():
    """Generate horizontal query processing flow diagram"""
    
    with Diagram("SQLAlchemy Query Processing Pipeline",
                show=False,
                filename="../../assets/shorts/sqlalchemy_query_flow",
                direction="LR",  # Horizontal pipeline
                graph_attr={
                    "fontsize": "11", 
                    "bgcolor": "white",
                    "ranksep": "0.6",
                    "pad": "0.2"
                }):
        
        # Query Construction Row
        with Cluster("Build"):
            select_stmt = Python("select()")
            where = Python("where()")
            join = Python("join()")
        
        # Compilation Row
        with Cluster("Compile"):
            compiler = Rack("SQL\nCompiler")
            cache = Storage("Cache")
        
        # Execution Row
        with Cluster("Execute"):
            executor = Rack("Async\nExecutor")
            pool = Rack("Pool")
        
        # Result Row
        with Cluster("Result"):
            processor = Python("Process")
            mapper = Python("Map ORM")
        
        # Database
        db = PostgreSQL("SQLite")
        
        # Horizontal flow with caching branch
        select_stmt >> where >> join >> compiler
        compiler >> cache
        compiler >> executor >> pool >> db >> processor >> mapper

def generate_sqlalchemy_relationship_mapping():
    """Generate horizontal model relationships diagram"""
    
    with Diagram("SQLAlchemy Model Relationships",
                show=False,
                filename="../../assets/shorts/sqlalchemy_relationships",
                direction="LR",  # Horizontal relationships
                graph_attr={
                    "fontsize": "10", 
                    "bgcolor": "white",
                    "ranksep": "1.0",
                    "nodesep": "0.5"
                }):
        
        # Models arranged horizontally
        with Cluster("Authentication"):
            user = Python("User\nid, email\nrole")
        
        with Cluster("Content"):
            page = Python("Page\nid, slug\ntitle")
            content = Python("Content\nBlock\nid, type")
        
        with Cluster("Business"):
            book_a_meeting = Python("BookAMeeting\nid, date\nstatus")
            webinar = Python("Webinar\nid, topic")
        
        # Horizontal relationships
        user >> Edge(label="1:N author", style="bold") >> page
        page >> Edge(label="1:N blocks", style="bold") >> content
        user >> Edge(label="1:N book_a_meetings", style="bold") >> book_a_meeting
        user >> Edge(label="N:M attendees", style="bold") >> webinar

def generate_sqlalchemy_data_flow():
    """Generate horizontal data flow through SQLAlchemy layers"""
    
    with Diagram("SQLAlchemy Data Flow Layers",
                show=False,
                filename="../../assets/shorts/sqlalchemy_data_flow",
                direction="LR",  # Horizontal layers
                graph_attr={
                    "fontsize": "11",
                    "bgcolor": "white",
                    "pad": "0.3",
                    "ranksep": "0.8"
                }):
        
        # Request flow through layers
        with Cluster("HTTP"):
            request = FastAPI("Request")
            response = FastAPI("Response")
        
        with Cluster("Application"):
            endpoint = Python("Endpoint")
            service = Python("Service")
        
        with Cluster("ORM"):
            query = Python("Query")
            models = Python("Models")
        
        with Cluster("Core"):
            sql = Rack("SQL")
            conn = Rack("Connection")
        
        with Cluster("Storage"):
            db = PostgreSQL("SQLite")
        
        # Bidirectional flow
        request >> endpoint >> service >> query >> models >> sql >> conn >> db
        db >> Edge(style="dashed") >> conn >> Edge(style="dashed") >> sql
        sql >> Edge(style="dashed") >> models >> Edge(style="dashed") >> query
        query >> Edge(style="dashed") >> service >> Edge(style="dashed") >> endpoint >> response

def generate_sqlalchemy_transaction_scope():
    """Generate horizontal transaction scope diagram"""
    
    with Diagram("SQLAlchemy Transaction Boundaries",
                show=False,
                filename="../../assets/shorts/sqlalchemy_transaction_scope",
                direction="LR",  # Horizontal transaction flow
                graph_attr={
                    "fontsize": "11",
                    "bgcolor": "white",
                    "ranksep": "0.6"
                }):
        
        # Transaction phases
        api_call = FastAPI("API Call")
        
        with Cluster("Transaction Scope"):
            begin = Action("BEGIN")
            work = Python("Business\nLogic")
            validate = Decision("Valid?")
            commit = Action("COMMIT")
            rollback = Action("ROLLBACK")
        
        result = FastAPI("Response")
        
        # Horizontal flow with commit/rollback paths
        api_call >> begin >> work >> validate
        validate >> Edge(label="Yes", color="green") >> commit >> result
        validate >> Edge(label="No", color="red") >> rollback >> result

if __name__ == "__main__":
    print("Generating SQLAlchemy diagrams with horizontal layouts...")
    
    generate_sqlalchemy_architecture()
    print("✓ Generated horizontal architecture diagram")
    
    generate_sqlalchemy_session_lifecycle()
    print("✓ Generated horizontal session lifecycle diagram")
    
    generate_sqlalchemy_query_flow()
    print("✓ Generated horizontal query flow diagram")
    
    generate_sqlalchemy_relationship_mapping()
    print("✓ Generated horizontal relationship mapping diagram")
    
    generate_sqlalchemy_data_flow()
    print("✓ Generated horizontal data flow diagram")
    
    generate_sqlalchemy_transaction_scope()
    print("✓ Generated horizontal transaction scope diagram")
    
    print("\nAll diagrams generated successfully with horizontal layouts in docs/diagrams/assets/shorts/")
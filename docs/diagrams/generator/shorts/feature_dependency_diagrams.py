#!/usr/bin/env python3
"""
Feature Dependency Diagram Generator for Magnetiq v2 Documentation
Generates feature dependency trees, service layer maps, and external dependency chains
All diagrams use horizontal layout (LR) for better page width optimization
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.programming.framework import FastAPI
from diagrams.programming.language import Python
from diagrams.onprem.database import PostgreSQL
from diagrams.generic.storage import Storage
from diagrams.generic.compute import Rack
from diagrams.programming.flowchart import Decision, StartEnd, Action
from diagrams.onprem.network import Internet
from diagrams.saas.social import Twitter
# Using generic icons instead of SaaS-specific ones
from diagrams.generic.blank import Blank
import os
import sys

# Add common styles to path
sys.path.append('../common')
from styles import apply_magnetiq_theme, get_cluster_style, MAGNETIQ_COLORS

# Ensure output directory exists
os.makedirs("../../assets/shorts", exist_ok=True)

def generate_feature_dependency_tree():
    """Generate horizontal feature dependency tree for Magnetiq v2"""
    
    with Diagram("Feature Dependency Tree - Magnetiq v2", 
                show=False, 
                filename="../../assets/shorts/feature_dependency_tree",
                direction="LR",  # Horizontal layout
                graph_attr={
                    "fontsize": "12", 
                    "bgcolor": "white", 
                    "pad": "0.3",
                    "ranksep": "1.2",
                    "nodesep": "0.6",
                    "splines": "ortho"
                }):
        
        # Core Infrastructure Layer
        with Cluster("Core Infrastructure", graph_attr=get_cluster_style("database")):
            database = PostgreSQL("SQLite\nDatabase")
            auth = Python("Authentication\nJWT + RBAC")
            health = Rack("Health\nChecks")
        
        # Content Management Layer
        with Cluster("Content Management", graph_attr=get_cluster_style("component")):
            content_api = FastAPI("Content API")
            media_upload = Storage("Media\nUpload")
            cms = Python("Page\nBuilder")
        
        # Business Features Layer
        with Cluster("Business Features", graph_attr=get_cluster_style("layer")):
            webinars = Python("Webinar\nManagement")
            whitepapers = Python("Whitepaper\nDownloads")
            book_a_meetings = Python("BookAMeeting\nSystem")
        
        # Communication Services Layer
        with Cluster("Communication Services", graph_attr=get_cluster_style("component")):
            email_campaigns = Storage("Email\nCampaigns")
            social_linkedin = Rack("LinkedIn\nIntegration")
            social_twitter = Twitter("Twitter/X\nIntegration")
        
        # External Dependencies
        with Cluster("External Dependencies", graph_attr=get_cluster_style("default")):
            smtp_service = Storage("SMTP\n(Brevo)")
            linkedin_api = Rack("LinkedIn\nAPI")
            twitter_api = Twitter("Twitter\nAPI")
            filesystem = Storage("File\nSystem")
        
        # Core dependency relationships
        auth >> Edge(label="secures", color=MAGNETIQ_COLORS["primary"]) >> content_api
        database >> Edge(label="stores", color=MAGNETIQ_COLORS["primary"]) >> [auth, content_api]
        
        # Content management dependencies
        content_api >> Edge(label="enables", color=MAGNETIQ_COLORS["accent"]) >> [webinars, whitepapers, book_a_meetings]
        media_upload >> Edge(label="supports", color=MAGNETIQ_COLORS["accent"]) >> cms
        auth >> Edge(label="protects", color=MAGNETIQ_COLORS["primary"]) >> media_upload
        
        # Business feature interconnections
        webinars >> Edge(label="triggers", color=MAGNETIQ_COLORS["secondary"]) >> email_campaigns
        whitepapers >> Edge(label="triggers", color=MAGNETIQ_COLORS["secondary"]) >> email_campaigns
        book_a_meetings >> Edge(label="notifies", color=MAGNETIQ_COLORS["secondary"]) >> [email_campaigns, social_linkedin]
        
        # External service dependencies
        email_campaigns >> Edge(label="requires", color=MAGNETIQ_COLORS["warning"], style="dashed") >> smtp_service
        social_linkedin >> Edge(label="requires", color=MAGNETIQ_COLORS["warning"], style="dashed") >> linkedin_api
        social_twitter >> Edge(label="requires", color=MAGNETIQ_COLORS["warning"], style="dashed") >> twitter_api
        media_upload >> Edge(label="requires", color=MAGNETIQ_COLORS["warning"], style="dashed") >> filesystem
        
        # Health monitoring
        health >> Edge(label="monitors", color=MAGNETIQ_COLORS["info"], style="dotted") >> [database, smtp_service, linkedin_api, twitter_api]

def generate_fastapi_service_dependencies():
    """Generate horizontal FastAPI service dependency map"""
    
    with Diagram("FastAPI Service Dependencies",
                show=False,
                filename="../../assets/shorts/fastapi_service_dependencies",
                direction="LR",  # Horizontal flow
                graph_attr={
                    "fontsize": "11", 
                    "bgcolor": "white",
                    "ranksep": "1.0",
                    "nodesep": "0.5"
                }):
        
        # API Layer
        with Cluster("API Endpoints"):
            auth_routes = FastAPI("/auth/*")
            content_routes = FastAPI("/content/*")
            business_routes = FastAPI("/business/*")
            comm_routes = FastAPI("/communication/*")
            admin_routes = FastAPI("/admin/*")
        
        # Service Layer
        with Cluster("Services"):
            auth_service = Python("AuthService")
            content_service = Python("ContentService") 
            book_a_meeting_service = Python("BookAMeetingService")
            email_service = Python("EmailService")
            social_service = Python("SocialService")
        
        # Dependency Injection
        with Cluster("Dependencies"):
            db_session = PostgreSQL("DB Session")
            current_user = Rack("Current User")
            permissions = Rack("Permissions")
            config = Storage("Config")
        
        # Shared Utilities
        with Cluster("Utilities"):
            validators = Python("Validators")
            serializers = Python("Serializers")
            exceptions = Python("Exceptions")
            logging = Rack("Logging")
        
        # Route to service dependencies
        auth_routes >> auth_service
        content_routes >> content_service
        business_routes >> book_a_meeting_service
        comm_routes >> [email_service, social_service]
        admin_routes >> [auth_service, content_service]
        
        # Service dependencies on shared components
        [auth_service, content_service, book_a_meeting_service] >> db_session
        [content_service, book_a_meeting_service, email_service, social_service] >> current_user
        [content_service, book_a_meeting_service, admin_routes] >> permissions
        [email_service, social_service] >> config
        
        # Utility dependencies
        auth_service >> validators
        content_service >> validators  
        book_a_meeting_service >> validators
        email_service >> validators
        social_service >> validators
        
        auth_service >> serializers
        content_service >> serializers
        book_a_meeting_service >> serializers
        
        auth_service >> exceptions >> logging
        content_service >> exceptions >> logging
        book_a_meeting_service >> exceptions >> logging
        email_service >> exceptions >> logging
        social_service >> exceptions >> logging

def generate_external_dependency_health_tree():
    """Generate horizontal external dependency health monitoring tree"""
    
    with Diagram("External Dependency Health Tree",
                show=False,
                filename="../../assets/shorts/external_dependency_health",
                direction="LR",  # Horizontal monitoring flow
                graph_attr={
                    "fontsize": "11",
                    "bgcolor": "white",
                    "ranksep": "1.0",
                    "pad": "0.3"
                }):
        
        # Health Check Entry Point
        with Cluster("Health Monitor"):
            health_endpoint = FastAPI("/health/detailed")
            health_service = Rack("Health\nService")
        
        # Core System Health
        with Cluster("Core Dependencies"):
            db_health = PostgreSQL("Database\nConnectivity")
            fs_health = Storage("File System\nAccess")
            memory_health = Rack("Memory\nUsage")
        
        # External Service Health
        with Cluster("External Services"):
            smtp_health = Storage("SMTP\nService")
            linkedin_health = Rack("LinkedIn\nAPI")
            twitter_health = Twitter("Twitter\nAPI")
        
        # Feature Health Status  
        with Cluster("Feature Availability"):
            email_feature = Python("Email\nCampaigns")
            social_feature = Python("Social\nPosting")
            content_feature = Python("Content\nManagement")
        
        # Health Status Results
        with Cluster("Health Status"):
            healthy = Action("Healthy")
            degraded = Decision("Degraded")
            unhealthy = Action("Unhealthy")
        
        # Health monitoring flow
        health_endpoint >> health_service
        health_service >> [db_health, fs_health, memory_health, smtp_health, linkedin_health, twitter_health]
        
        # Feature dependency on external services
        smtp_health >> email_feature
        [linkedin_health, twitter_health] >> social_feature
        [db_health, fs_health] >> content_feature
        
        # Health status determination
        [db_health, fs_health, memory_health] >> Edge(label="critical", color=MAGNETIQ_COLORS["error"]) >> unhealthy
        [smtp_health, linkedin_health, twitter_health] >> Edge(label="optional", color=MAGNETIQ_COLORS["warning"]) >> degraded
        [email_feature, social_feature, content_feature] >> Edge(label="all ok", color=MAGNETIQ_COLORS["accent"]) >> healthy

def generate_deployment_dependency_chain():
    """Generate horizontal deployment dependency chain"""
    
    with Diagram("Deployment Dependency Chain",
                show=False,
                filename="../../assets/shorts/deployment_dependencies",
                direction="LR",  # Horizontal deployment flow
                graph_attr={
                    "fontsize": "11",
                    "bgcolor": "white",
                    "ranksep": "0.8"
                }):
        
        # Infrastructure Prerequisites
        with Cluster("Infrastructure"):
            server = Rack("Server")
            python = Python("Python 3.11+")
            sqlite = PostgreSQL("SQLite")
        
        # Configuration Dependencies
        with Cluster("Configuration"):
            env_vars = Storage("Environment\nVariables")
            secrets = Storage("Secrets\nManagement")
            config_files = Storage("Config\nFiles")
        
        # Database Dependencies
        with Cluster("Database Setup"):
            migrations = Storage("Alembic\nMigrations")
            seed_data = PostgreSQL("Seed\nData")
            indexes = PostgreSQL("Indexes")
        
        # Application Dependencies
        with Cluster("Application"):
            packages = Python("Python\nPackages")
            fastapi_app = FastAPI("FastAPI\nApplication")
            uvicorn = Rack("Uvicorn\nServer")
        
        # Service Dependencies
        with Cluster("Services"):
            health_checks = Rack("Health\nChecks")
            logging_service = Rack("Logging")
            monitoring = Rack("Monitoring")
        
        # Frontend Dependencies (if applicable)
        with Cluster("Frontend"):
            static_files = Storage("Static\nFiles")
            frontend_app = FastAPI("Frontend\nApp")
        
        # Deployment flow
        server >> [python, sqlite, env_vars]
        [env_vars, secrets] >> config_files
        [python, config_files] >> packages
        [sqlite, config_files] >> migrations >> seed_data >> indexes
        [packages, migrations] >> fastapi_app
        fastapi_app >> uvicorn
        uvicorn >> [health_checks, logging_service, monitoring]
        
        # Optional frontend
        [static_files, fastapi_app] >> Edge(style="dashed") >> frontend_app

if __name__ == "__main__":
    print("Generating Feature Dependency diagrams with horizontal layouts...")
    
    generate_feature_dependency_tree()
    print("✓ Generated horizontal feature dependency tree")
    
    generate_fastapi_service_dependencies()
    print("✓ Generated horizontal FastAPI service dependencies")
    
    generate_external_dependency_health_tree()
    print("✓ Generated horizontal external dependency health tree")
    
    generate_deployment_dependency_chain()
    print("✓ Generated horizontal deployment dependency chain")
    
    print("\nAll feature dependency diagrams generated successfully in docs/diagrams/assets/shorts/")
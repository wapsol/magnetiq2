#!/usr/bin/env python3
"""
Enhanced Dependency Diagram Generator for Magnetiq v2 Documentation
Extends existing diagrams with cascade behavior, detailed service dependencies, and data flow maps
All diagrams use horizontal layout (LR) for better page width optimization
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.programming.framework import FastAPI
from diagrams.programming.language import Python
from diagrams.onprem.database import PostgreSQL
from diagrams.generic.storage import Storage
from diagrams.generic.compute import Rack
from diagrams.programming.flowchart import Decision, StartEnd, Action, InputOutput
from diagrams.onprem.network import Internet
from diagrams.saas.social import Twitter
# Using generic icons instead of SaaS-specific ones
import os
import sys

# Add common styles to path
sys.path.append('../common')

# Ensure output directory exists
os.makedirs("../../assets/shorts", exist_ok=True)

def generate_enhanced_model_relationships_with_cascades():
    """Generate horizontal model relationships with cascade behavior visualization"""
    
    with Diagram("SQLAlchemy Model Dependencies with Cascades",
                show=False,
                filename="../../assets/shorts/model_dependencies_cascades",
                direction="LR",  # Horizontal relationships
                graph_attr={
                    "fontsize": "10", 
                    "bgcolor": "white",
                    "ranksep": "1.2",
                    "nodesep": "0.6"
                }):
        
        # Authentication Domain
        with Cluster("Authentication Domain"):
            user = Python("User\nid, email, role\nhashed_password")
            session = Storage("UserSession\ntoken, expires")
            
        # Content Domain  
        with Cluster("Content Domain"):
            page = Python("Page\nid, slug, title\nstatus, content")
            content_block = Python("ContentBlock\nid, type, data\norder, page_id")
            media = Storage("Media\nid, filename\npath, page_id")
            
        # Business Domain
        with Cluster("Business Domain"):
            webinar = Python("Webinar\nid, title, date\nmax_attendees")
            webinar_registration = Python("Registration\nid, user_id\nwebinar_id")
            whitepaper = Python("Whitepaper\nid, title, file\ndescription")
            download = Python("Download\nid, user_id\nwhitepaper_id")
            booking = Python("Booking\nid, user_id\ndate, status")
            
        # Communication Domain
        with Cluster("Communication Domain"):
            email_campaign = Storage("EmailCampaign\nid, subject\ncontent, status")
            email_recipient = Python("Recipient\nid, email, user_id\ncampaign_id")
            social_post = Python("SocialPost\nid, content\nplatform, status")
        
        # Primary relationships with cascade behavior
        user >> Edge(label="1:N\nCASCADE", color="red", style="bold") >> session
        user >> Edge(label="1:N\nSET NULL", color="orange") >> page
        page >> Edge(label="1:N\nCASCADE", color="red", style="bold") >> content_block
        page >> Edge(label="1:N\nCASCADE", color="red", style="bold") >> media
        
        # Business relationships
        user >> Edge(label="1:N\nCASCADE", color="red", style="bold") >> webinar_registration
        webinar >> Edge(label="1:N\nCASCADE", color="red", style="bold") >> webinar_registration
        user >> Edge(label="1:N\nRESTRICT", color="blue") >> download  
        whitepaper >> Edge(label="1:N\nCASCADE", color="red", style="bold") >> download
        user >> Edge(label="1:N\nSET NULL", color="orange") >> booking
        
        # Communication relationships
        user >> Edge(label="1:N\nSET NULL", color="orange") >> email_recipient
        email_campaign >> Edge(label="1:N\nCASCADE", color="red", style="bold") >> email_recipient

def generate_service_layer_detailed_dependencies():
    """Generate detailed service layer dependency map with injection patterns"""
    
    with Diagram("Detailed Service Layer Dependencies",
                show=False,
                filename="../../assets/shorts/service_layer_dependencies",
                direction="LR",  # Horizontal service flow
                graph_attr={
                    "fontsize": "10", 
                    "bgcolor": "white",
                    "ranksep": "1.0",
                    "nodesep": "0.4"
                }):
        
        # API Layer with detailed endpoints
        with Cluster("API Endpoints"):
            auth_login = FastAPI("POST /auth/login")
            auth_refresh = FastAPI("POST /auth/refresh")
            content_list = FastAPI("GET /content/pages")
            content_create = FastAPI("POST /content/pages")
            webinar_register = FastAPI("POST /business/webinars/{id}/register")
            email_send = FastAPI("POST /communication/email/campaigns/{id}/send")
        
        # Service Layer with detailed services
        with Cluster("Service Layer"):
            auth_service = Python("AuthService\nauthenticate()\nrefresh_token()")
            content_service = Python("ContentService\nget_pages()\ncreate_page()")
            webinar_service = Python("WebinarService\nregister_user()\nsend_confirmation()")
            email_service = Python("EmailService\nsend_campaign()\ntrack_delivery()")
            user_service = Python("UserService\nget_user()\nupdate_profile()")
        
        # Repository Layer
        with Cluster("Repository Layer"):
            user_repo = PostgreSQL("UserRepository\nfind_by_email()\nsave()")
            content_repo = PostgreSQL("ContentRepository\nfind_all()\ncreate()")
            webinar_repo = PostgreSQL("WebinarRepository\nfind_by_id()\nadd_attendee()")
            email_repo = PostgreSQL("EmailRepository\nget_recipients()\nlog_delivery()")
        
        # Dependency Injection Components
        with Cluster("Dependencies (FastAPI Depends)"):
            db_session = PostgreSQL("get_db()")
            current_user = Rack("get_current_user()")
            permissions = Rack("require_permission()")
            rate_limit = Rack("rate_limiter()")
            validation = Python("validate_request()")
        
        # Cross-cutting Services
        with Cluster("Cross-cutting Services"):
            logger = Rack("LoggingService")
            metrics = Rack("MetricsService") 
            cache = Storage("CacheService")
            notification = Storage("NotificationService")
        
        # API to Service mappings
        [auth_login, auth_refresh] >> auth_service
        [content_list, content_create] >> content_service
        webinar_register >> webinar_service
        email_send >> email_service
        
        # Service to Repository mappings
        auth_service >> user_repo
        content_service >> content_repo
        webinar_service >> [webinar_repo, user_repo]
        email_service >> [email_repo, user_repo]
        
        # Service cross-dependencies
        webinar_service >> Edge(label="uses", style="dashed") >> [email_service, notification]
        email_service >> Edge(label="uses", style="dashed") >> user_service
        
        # Dependency injection relationships
        [content_create, webinar_register, email_send] >> current_user
        [content_create, webinar_register] >> permissions
        [auth_login, content_list, webinar_register] >> rate_limit
        [auth_service, content_service, webinar_service, email_service] >> db_session
        [content_create, webinar_register] >> validation
        
        # Cross-cutting service usage
        [auth_service, content_service, webinar_service, email_service] >> logger
        [auth_service, content_service, webinar_service] >> metrics
        content_service >> cache

def generate_request_lifecycle_dependency_flow():
    """Generate request lifecycle with all dependency touchpoints"""
    
    with Diagram("Request Lifecycle Dependency Flow",
                show=False,
                filename="../../assets/shorts/request_lifecycle_dependencies",
                direction="LR",  # Horizontal request flow
                graph_attr={
                    "fontsize": "10",
                    "bgcolor": "white",
                    "ranksep": "0.8",
                    "pad": "0.2"
                }):
        
        # Request Entry
        client_request = StartEnd("Client\nRequest")
        
        # Middleware Layer
        with Cluster("Middleware Stack"):
            cors = Rack("CORS")
            rate_limiter = Rack("Rate\nLimiter")
            auth_middleware = Rack("Auth\nMiddleware")
            logging_middleware = Rack("Logging")
        
        # FastAPI Processing
        with Cluster("FastAPI Processing"):
            route_matching = Action("Route\nMatching")
            dependency_injection = Decision("Dependency\nInjection")
            request_validation = Action("Request\nValidation")
        
        # Dependency Resolution
        with Cluster("Dependency Resolution"):
            db_dependency = PostgreSQL("Database\nSession")
            user_dependency = Rack("Current\nUser")
            permission_check = Decision("Permission\nCheck")
        
        # Business Logic
        with Cluster("Business Logic"):
            service_call = Python("Service\nMethod")
            repository_call = PostgreSQL("Repository\nQuery")
            external_api = Internet("External\nAPI Call")
        
        # Response Processing
        with Cluster("Response Processing"):
            serialization = Action("Response\nSerialization") 
            response_middleware = Rack("Response\nMiddleware")
            client_response = StartEnd("Client\nResponse")
        
        # Linear flow with dependency branches
        client_request >> cors >> rate_limiter >> auth_middleware >> logging_middleware
        logging_middleware >> route_matching >> dependency_injection >> request_validation
        
        # Dependency resolution branches
        dependency_injection >> db_dependency
        dependency_injection >> user_dependency >> permission_check
        
        # Business logic execution
        [request_validation, db_dependency, permission_check] >> service_call
        service_call >> repository_call
        service_call >> Edge(style="dashed") >> external_api
        
        # Response flow
        [repository_call, external_api] >> serialization >> response_middleware >> client_response
        
        # Error paths
        permission_check >> Edge(label="403", color="red", style="dashed") >> serialization
        external_api >> Edge(label="timeout", color="red", style="dashed") >> serialization

def generate_data_flow_dependency_map():
    """Generate comprehensive data flow through all system layers"""
    
    with Diagram("Data Flow Dependency Map",
                show=False,
                filename="../../assets/shorts/data_flow_dependencies",
                direction="LR",  # Horizontal data flow
                graph_attr={
                    "fontsize": "10",
                    "bgcolor": "white",
                    "ranksep": "1.0"
                }):
        
        # Data Sources
        with Cluster("Data Sources"):
            user_input = InputOutput("User\nInput")
            external_apis = Internet("External\nAPIs")
            scheduled_jobs = Rack("Scheduled\nJobs")
        
        # Input Processing
        with Cluster("Input Processing"):
            validation = Python("Input\nValidation")
            sanitization = Python("Data\nSanitization") 
            transformation = Python("Data\nTransformation")
        
        # Business Processing
        with Cluster("Business Processing"):
            auth_processing = Python("Authentication\nProcessing")
            content_processing = Python("Content\nProcessing")
            business_logic = Python("Business\nLogic")
            communication_processing = Storage("Communication\nProcessing")
        
        # Data Persistence
        with Cluster("Data Persistence"):
            database_write = PostgreSQL("Database\nWrites")
            file_storage = Storage("File\nStorage")
            cache_write = Storage("Cache\nWrites")
        
        # Data Distribution
        with Cluster("Data Distribution"):
            api_response = FastAPI("API\nResponses")
            notifications = Storage("Notifications")
            external_webhooks = Internet("External\nWebhooks")
            scheduled_outputs = Rack("Scheduled\nOutputs")
        
        # Data flow connections
        [user_input, external_apis, scheduled_jobs] >> validation >> sanitization >> transformation
        
        # Processing distribution
        transformation >> [auth_processing, content_processing, business_logic, communication_processing]
        
        # Persistence layer
        [auth_processing, content_processing, business_logic] >> database_write
        content_processing >> file_storage
        [auth_processing, content_processing] >> cache_write
        
        # Output distribution
        [database_write, file_storage, cache_write] >> api_response
        communication_processing >> [notifications, external_webhooks]
        business_logic >> scheduled_outputs
        
        # Feedback loops
        api_response >> Edge(label="feedback", style="dashed", color="blue") >> user_input
        external_webhooks >> Edge(label="webhook response", style="dashed", color="blue") >> external_apis

if __name__ == "__main__":
    print("Generating Enhanced Dependency diagrams with horizontal layouts...")
    
    generate_enhanced_model_relationships_with_cascades()
    print("✓ Generated enhanced model relationships with cascades")
    
    generate_service_layer_detailed_dependencies()
    print("✓ Generated detailed service layer dependencies")
    
    generate_request_lifecycle_dependency_flow()
    print("✓ Generated request lifecycle dependency flow")
    
    generate_data_flow_dependency_map()
    print("✓ Generated data flow dependency map")
    
    print("\nAll enhanced dependency diagrams generated successfully in docs/diagrams/assets/shorts/")
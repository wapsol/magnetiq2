#!/usr/bin/env python3
"""
Operational Dependency Diagram Generator for Magnetiq v2 Documentation
Generates health check trees, deployment dependencies, and monitoring diagrams
All diagrams use horizontal layout (LR) for better page width optimization
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.programming.framework import FastAPI
from diagrams.programming.language import Python
from diagrams.onprem.database import PostgreSQL
from diagrams.generic.storage import Storage
from diagrams.generic.compute import Rack
from diagrams.programming.flowchart import Decision, StartEnd, Action, InputOutput
from diagrams.onprem.network import Internet, Nginx
from diagrams.saas.social import Twitter
# Using generic icons instead of SaaS-specific ones
from diagrams.onprem.monitoring import Grafana, Prometheus
from diagrams.onprem.inmemory import Redis
from diagrams.generic.blank import Blank
import os
import sys

# Add common styles to path  
sys.path.append('../common')

# Ensure output directory exists
os.makedirs("../../assets/shorts", exist_ok=True)

def generate_comprehensive_health_check_tree():
    """Generate comprehensive health check dependency tree"""
    
    with Diagram("Comprehensive Health Check Dependency Tree",
                show=False,
                filename="../../assets/shorts/comprehensive_health_check_tree",
                direction="LR",  # Horizontal monitoring flow
                graph_attr={
                    "fontsize": "10",
                    "bgcolor": "white",
                    "ranksep": "1.2",
                    "nodesep": "0.5",
                    "pad": "0.3"
                }):
        
        # Health Check Endpoints
        with Cluster("Health Endpoints"):
            basic_health = FastAPI("/health")
            detailed_health = FastAPI("/health/detailed") 
            readiness_probe = FastAPI("/health/ready")
            liveness_probe = FastAPI("/health/live")
        
        # Core System Health Checks
        with Cluster("Core System Health"):
            app_health = Python("Application\nStatus")
            db_connectivity = PostgreSQL("Database\nConnectivity")
            db_query = PostgreSQL("Database\nQuery Test")
            filesystem = Storage("File System\nAccess")
            memory_usage = Rack("Memory\nUsage")
            disk_space = Storage("Disk\nSpace")
        
        # External Service Health Checks
        with Cluster("External Services"):
            smtp_connectivity = Storage("SMTP\nConnectivity")
            smtp_auth = Storage("SMTP\nAuthentication")
            linkedin_api = Rack("LinkedIn\nAPI Health")
            twitter_api = Twitter("Twitter\nAPI Health")
            internet_connectivity = Internet("Internet\nConnectivity")
        
        # Feature Health Status
        with Cluster("Feature Health"):
            auth_feature = Python("Authentication\nFeature")
            content_feature = Python("Content\nManagement")
            email_feature = Storage("Email\nCampaigns")
            social_feature = Python("Social\nPosting")
            booking_feature = Python("Booking\nSystem")
            media_upload = Storage("Media\nUpload")
        
        # Health Status Aggregation
        with Cluster("Health Status"):
            healthy_status = Action("HEALTHY\nAll systems operational")
            degraded_status = Decision("DEGRADED\nNon-critical issues")
            unhealthy_status = Action("UNHEALTHY\nCritical failures")
        
        # Monitoring & Alerting
        with Cluster("Monitoring"):
            health_monitor = Rack("Health\nMonitor")
            alerting = Rack("Alert\nSystem")
            dashboard = Grafana("Health\nDashboard")
        
        # Health check orchestration
        [basic_health, detailed_health, readiness_probe, liveness_probe] >> health_monitor
        
        # Core system dependencies
        health_monitor >> [app_health, db_connectivity, filesystem, memory_usage, disk_space]
        db_connectivity >> db_query
        
        # External service dependencies  
        health_monitor >> [smtp_connectivity, linkedin_api, twitter_api, internet_connectivity]
        smtp_connectivity >> smtp_auth
        
        # Feature dependency mapping
        [app_health, db_query] >> auth_feature
        [db_query, filesystem] >> content_feature
        [smtp_auth, auth_feature] >> email_feature
        [linkedin_api, twitter_api, auth_feature] >> social_feature
        [db_query, auth_feature] >> booking_feature
        [filesystem, auth_feature] >> media_upload
        
        # Health status determination - Critical dependencies
        [app_health, db_connectivity, filesystem] >> Edge(label="critical", color="red", style="bold") >> unhealthy_status
        
        # Health status determination - Optional dependencies  
        [smtp_connectivity, linkedin_api, twitter_api] >> Edge(label="degraded", color="orange") >> degraded_status
        
        # Health status determination - All good
        [auth_feature, content_feature, email_feature, social_feature, booking_feature] >> Edge(label="operational", color="green") >> healthy_status
        
        # Monitoring and alerting
        [healthy_status, degraded_status, unhealthy_status] >> dashboard
        [degraded_status, unhealthy_status] >> alerting

def generate_deployment_dependency_chain():
    """Generate comprehensive deployment dependency chain"""
    
    with Diagram("Deployment Dependency Chain",
                show=False,
                filename="../../assets/shorts/deployment_dependency_chain",
                direction="LR",  # Horizontal deployment flow
                graph_attr={
                    "fontsize": "10",
                    "bgcolor": "white",
                    "ranksep": "1.0",
                    "nodesep": "0.4"
                }):
        
        # Infrastructure Prerequisites
        with Cluster("Infrastructure Layer"):
            server = Rack("Server\nInstance")
            os_setup = Rack("OS\nConfiguration")
            network = Internet("Network\nConnectivity")
            ssl_cert = Storage("SSL\nCertificates")
        
        # System Dependencies
        with Cluster("System Dependencies"):
            python_runtime = Python("Python 3.11+\nRuntime")
            system_packages = Storage("System\nPackages")
            user_account = Rack("Service\nUser")
            directories = Storage("Directory\nStructure")
        
        # Application Dependencies
        with Cluster("Application Dependencies"):
            python_packages = Python("Python\nPackages")
            pip_install = Python("pip install\n-r requirements.txt")
            virtual_env = Python("Virtual\nEnvironment")
        
        # Configuration Management
        with Cluster("Configuration"):
            env_variables = Storage("Environment\nVariables")
            config_files = Storage("Configuration\nFiles")
            secrets_mgmt = Storage("Secrets\nManagement")
            logging_config = Storage("Logging\nConfiguration")
        
        # Database Setup
        with Cluster("Database Layer"):
            sqlite_file = PostgreSQL("SQLite\nDatabase File")
            migrations = Storage("Alembic\nMigrations")
            seed_data = PostgreSQL("Initial\nSeed Data")
            db_permissions = PostgreSQL("Database\nPermissions")
        
        # Application Layer
        with Cluster("Application Layer"):
            fastapi_app = FastAPI("FastAPI\nApplication")
            uvicorn_server = Rack("Uvicorn\nASGI Server")
            gunicorn_workers = Rack("Gunicorn\nWorkers")
        
        # Reverse Proxy Layer
        with Cluster("Web Server"):
            nginx = Nginx("Nginx\nReverse Proxy")
            static_files = Storage("Static\nFile Serving")
            load_balancing = Rack("Load\nBalancing")
        
        # Monitoring & Operations
        with Cluster("Operations"):
            health_checks = FastAPI("Health\nChecks")
            logging_service = Storage("Log\nAggregation")
            monitoring = Prometheus("System\nMonitoring")
            process_manager = Rack("Process\nManager")
        
        # Infrastructure flow
        server >> os_setup
        server >> network 
        server >> ssl_cert
        os_setup >> python_runtime
        os_setup >> system_packages
        network >> user_account
        user_account >> directories
        
        # Application setup flow
        python_runtime >> virtual_env
        directories >> virtual_env
        virtual_env >> python_packages >> pip_install
        
        # Configuration flow
        directories >> env_variables
        secrets_mgmt >> env_variables
        directories >> config_files
        secrets_mgmt >> config_files
        directories >> logging_config
        
        # Database setup flow
        directories >> sqlite_file
        python_packages >> sqlite_file
        sqlite_file >> migrations
        pip_install >> migrations
        migrations >> seed_data >> db_permissions
        
        # Application startup flow
        pip_install >> fastapi_app
        config_files >> fastapi_app
        db_permissions >> fastapi_app
        fastapi_app >> uvicorn_server >> gunicorn_workers
        
        # Web server flow
        gunicorn_workers >> nginx
        ssl_cert >> nginx
        static_files >> nginx
        nginx >> load_balancing
        
        # Operations flow
        fastapi_app >> health_checks
        logging_config >> logging_service
        gunicorn_workers >> process_manager
        uvicorn_server >> process_manager
        process_manager >> monitoring

def generate_failure_cascade_analysis():
    """Generate failure cascade analysis diagram"""
    
    with Diagram("Dependency Failure Cascade Analysis",
                show=False,
                filename="../../assets/shorts/failure_cascade_analysis",
                direction="LR",  # Horizontal cascade flow
                graph_attr={
                    "fontsize": "10",
                    "bgcolor": "white",
                    "ranksep": "1.0",
                    "pad": "0.2"
                }):
        
        # Initial Failure Points
        with Cluster("Potential Failure Points"):
            db_failure = PostgreSQL("Database\nFailure")
            smtp_failure = Storage("SMTP\nFailure")
            linkedin_failure = Rack("LinkedIn API\nFailure")
            filesystem_failure = Storage("File System\nFailure")
            network_failure = Internet("Network\nFailure")
        
        # Primary Impact
        with Cluster("Primary Impact"):
            auth_down = Action("Authentication\nDown")
            email_down = Action("Email Campaigns\nDown")
            social_down = Action("Social Posting\nDown")
            uploads_down = Action("Media Uploads\nDown")
            api_timeout = Action("API Timeouts")
        
        # Secondary Impact
        with Cluster("Secondary Impact"):
            user_registration_blocked = Action("User Registration\nBlocked")
            content_management_limited = Action("Content Management\nLimited")
            booking_system_degraded = Decision("Booking System\nDegraded")
            notifications_failed = Action("Notifications\nFailed")
        
        # Business Impact
        with Cluster("Business Impact"):
            lead_generation_stopped = Action("Lead Generation\nStopped")
            customer_communication_broken = Action("Customer Comm\nBroken")
            content_workflow_interrupted = Action("Content Workflow\nInterrupted")
            revenue_impact = Action("Revenue\nImpact")
        
        # Recovery Strategies
        with Cluster("Recovery Strategies"):
            graceful_degradation = Decision("Graceful\nDegradation")
            circuit_breaker = Action("Circuit\nBreaker")
            fallback_service = Action("Fallback\nService")
            manual_recovery = Action("Manual\nRecovery")
        
        # Cascade relationships
        db_failure >> auth_down >> [user_registration_blocked, content_management_limited]
        smtp_failure >> email_down >> [notifications_failed, customer_communication_broken]
        linkedin_failure >> social_down >> lead_generation_stopped
        filesystem_failure >> uploads_down >> content_workflow_interrupted
        network_failure >> api_timeout >> [email_down, social_down]
        
        # Business impact chains
        [user_registration_blocked, notifications_failed] >> lead_generation_stopped
        [customer_communication_broken, content_workflow_interrupted] >> revenue_impact
        
        # Recovery activation
        [auth_down, email_down, social_down, uploads_down] >> graceful_degradation
        api_timeout >> circuit_breaker
        [smtp_failure, linkedin_failure] >> fallback_service
        db_failure >> manual_recovery

def generate_monitoring_dependency_map():
    """Generate monitoring and alerting dependency map"""
    
    with Diagram("Monitoring Dependency Map",
                show=False,
                filename="../../assets/shorts/monitoring_dependencies",
                direction="LR",  # Horizontal monitoring flow
                graph_attr={
                    "fontsize": "10",
                    "bgcolor": "white",
                    "ranksep": "0.8"
                }):
        
        # Application Metrics Sources
        with Cluster("Metrics Sources"):
            app_metrics = FastAPI("Application\nMetrics")
            db_metrics = PostgreSQL("Database\nMetrics")
            system_metrics = Rack("System\nMetrics")
            external_metrics = Internet("External API\nMetrics")
        
        # Health Check Integration
        with Cluster("Health Checks"):
            basic_health = FastAPI("/health")
            detailed_health = FastAPI("/health/detailed")
            custom_checks = Python("Custom\nHealth Checks")
        
        # Monitoring Infrastructure
        with Cluster("Monitoring Stack"):
            metrics_collector = Prometheus("Metrics\nCollector")
            time_series_db = Storage("Time Series\nDatabase")
            alerting_engine = Rack("Alerting\nEngine")
        
        # Visualization & Alerting
        with Cluster("Visualization"):
            monitoring_dashboard = Grafana("Monitoring\nDashboard")
            health_dashboard = Grafana("Health\nDashboard")
            alert_notifications = Storage("Alert\nNotifications")
        
        # Alert Routing
        with Cluster("Alert Routing"):
            critical_alerts = Action("Critical\nAlerts")
            warning_alerts = Decision("Warning\nAlerts")
            info_alerts = Action("Info\nAlerts")
        
        # Response Teams
        with Cluster("Response"):
            on_call_engineer = Rack("On-Call\nEngineer")
            dev_team = Rack("Development\nTeam")
            ops_team = Rack("Operations\nTeam")
        
        # Metrics collection flow
        [app_metrics, db_metrics, system_metrics, external_metrics] >> metrics_collector
        [basic_health, detailed_health, custom_checks] >> metrics_collector
        metrics_collector >> time_series_db
        
        # Monitoring and alerting flow
        time_series_db >> [monitoring_dashboard, health_dashboard, alerting_engine]
        alerting_engine >> alert_notifications
        
        # Alert classification and routing
        alert_notifications >> [critical_alerts, warning_alerts, info_alerts]
        critical_alerts >> on_call_engineer
        warning_alerts >> dev_team
        info_alerts >> ops_team
        
        # Feedback loops
        [on_call_engineer, dev_team, ops_team] >> Edge(label="response", style="dashed", color="blue") >> custom_checks

if __name__ == "__main__":
    print("Generating Operational Dependency diagrams with horizontal layouts...")
    
    generate_comprehensive_health_check_tree()
    print("✓ Generated comprehensive health check tree")
    
    generate_deployment_dependency_chain()
    print("✓ Generated deployment dependency chain")
    
    generate_failure_cascade_analysis()
    print("✓ Generated failure cascade analysis")
    
    generate_monitoring_dependency_map()
    print("✓ Generated monitoring dependency map")
    
    print("\nAll operational dependency diagrams generated successfully in docs/diagrams/assets/shorts/")
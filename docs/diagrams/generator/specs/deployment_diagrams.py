#!/usr/bin/env python3
"""
Deployment Diagram Generator for Magnetiq v2 Documentation
Generates architecture and process diagrams for deployment specification
All diagrams use horizontal layout (LR) for better page width optimization
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.programming.framework import FastAPI, React
from diagrams.onprem.container import Docker
from diagrams.onprem.database import PostgreSQL as Database
from diagrams.onprem.network import Nginx
from diagrams.generic.storage import Storage
from diagrams.generic.compute import Rack
from diagrams.programming.flowchart import Decision, StartEnd, Action
from diagrams.onprem.client import Client, Users
from diagrams.onprem.security import Vault
from diagrams.generic.device import Mobile, Tablet
import os

# Ensure output directory exists
os.makedirs("../../assets/specs", exist_ok=True)

def generate_deployment_architecture():
    """Generate horizontal deployment architecture diagram"""
    
    with Diagram("Magnetiq v2 Deployment Architecture", 
                show=False, 
                filename="../../assets/specs/deployment_architecture",
                direction="LR",
                graph_attr={
                    "fontsize": "12", 
                    "bgcolor": "white", 
                    "pad": "0.3",
                    "ranksep": "1.0",
                    "nodesep": "0.6"
                }):
        
        # Client devices
        with Cluster("Clients"):
            web = Client("Web Browser")
            mobile = Mobile("Mobile")
            tablet = Tablet("Tablet")
        
        # Load balancer / SSL termination
        with Cluster("Web Server"):
            nginx = Nginx("Nginx\nPort 80/443")
        
        # Application containers
        with Cluster("Application Layer"):
            frontend = React("React SPA\nPort 8036")
            backend = FastAPI("FastAPI\nPort 3036")
        
        # Data layer
        with Cluster("Data Layer"):
            db = Database("SQLite\nWAL Mode")
            media = Storage("Media Files")
            backups = Storage("Backups")
        
        # Container orchestration
        with Cluster("Container Platform"):
            docker = Docker("Docker\nCompose")
        
        # Connections
        [web, mobile, tablet] >> Edge(label="HTTPS") >> nginx
        nginx >> Edge(label="Static Files") >> frontend
        nginx >> Edge(label="API Proxy") >> backend
        backend >> Edge(label="SQL") >> db
        backend >> Edge(label="File I/O") >> media
        docker >> Edge(style="dashed") >> [frontend, backend, nginx]
        db >> Edge(style="dashed", label="Backup") >> backups

def generate_development_deployment():
    """Generate development environment deployment diagram"""
    
    with Diagram("Development Environment Setup",
                show=False,
                filename="../../assets/specs/development_deployment",
                direction="LR",
                graph_attr={
                    "fontsize": "11", 
                    "bgcolor": "white",
                    "ranksep": "0.8",
                    "nodesep": "0.4"
                }):
        
        # Developer environment
        with Cluster("Developer Machine"):
            dev = Client("Developer")
            vscode = Rack("VS Code")
        
        # Docker development stack
        with Cluster("Docker Dev Stack"):
            nginx_dev = Nginx("Nginx\n:80")
            frontend_dev = React("React Dev\n:8036")
            backend_dev = FastAPI("FastAPI Dev\n:3036")
            
        # Development data
        with Cluster("Dev Data"):
            db_dev = Database("SQLite Dev")
            volumes = Storage("Docker\nVolumes")
        
        # Hot reload connections
        dev >> vscode
        vscode >> Edge(label="Hot Reload") >> [frontend_dev, backend_dev]
        nginx_dev >> frontend_dev
        nginx_dev >> backend_dev
        backend_dev >> db_dev
        volumes >> Edge(style="dashed") >> [frontend_dev, backend_dev, db_dev]

def generate_production_deployment():
    """Generate production environment deployment diagram"""
    
    with Diagram("Production Environment Architecture",
                show=False,
                filename="../../assets/specs/production_deployment",
                direction="LR",
                graph_attr={
                    "fontsize": "11",
                    "bgcolor": "white", 
                    "ranksep": "1.0",
                    "nodesep": "0.5"
                }):
        
        # Internet and SSL
        with Cluster("Internet"):
            internet = Client("Users")
            ssl = Vault("Let's Encrypt\nSSL")
        
        # Production web server
        with Cluster("Web Layer"):
            nginx_prod = Nginx("Nginx\nSSL + Gzip")
            
        # Production applications
        with Cluster("App Layer"):
            frontend_prod = React("React\nStatic Build")
            backend_prod = FastAPI("FastAPI\nProduction")
            
        # Production data with backups
        with Cluster("Data Layer"):
            db_prod = Database("SQLite\nProd DB")
            media_prod = Storage("Media\nStorage")
            backup_prod = Storage("Daily\nBackups")
            
        # Monitoring
        with Cluster("Operations"):
            health = Rack("Health\nChecks")
            logs = Storage("Log\nRotation")
        
        # Production flow
        internet >> ssl >> nginx_prod
        nginx_prod >> Edge(label="Static") >> frontend_prod
        nginx_prod >> Edge(label="API") >> backend_prod
        backend_prod >> db_prod
        backend_prod >> media_prod
        
        # Monitoring connections
        health >> Edge(style="dashed") >> [nginx_prod, backend_prod, db_prod]
        [nginx_prod, backend_prod] >> Edge(style="dashed") >> logs
        db_prod >> Edge(style="dashed", label="Daily") >> backup_prod

def generate_deployment_process_flow():
    """Generate deployment process workflow diagram"""
    
    with Diagram("Deployment Process Workflow",
                show=False,
                filename="../../assets/specs/deployment_process_flow",
                direction="LR",
                graph_attr={
                    "fontsize": "10",
                    "bgcolor": "white",
                    "ranksep": "0.6"
                }):
        
        # Development phase
        with Cluster("Development"):
            code = Action("Code\nChanges")
            test_local = Decision("Local\nTests?")
            commit = Action("Git\nCommit")
        
        # Build phase
        with Cluster("Build"):
            build_images = Action("Build\nDocker Images")
            test_images = Decision("Image\nTests?")
        
        # Deployment phase
        with Cluster("Deploy"):
            backup_db = Action("Backup\nDatabase")
            deploy_prod = Action("Deploy to\nProduction")
            health_check = Decision("Health\nCheck?")
            
        # Recovery phase
        rollback = Action("Rollback")
        success = StartEnd("Success")
        
        # Process flow
        code >> test_local
        test_local >> Edge(label="Pass") >> commit
        test_local >> Edge(label="Fail", color="red") >> code
        commit >> build_images >> test_images
        test_images >> Edge(label="Pass") >> backup_db
        test_images >> Edge(label="Fail", color="red") >> build_images
        backup_db >> deploy_prod >> health_check
        health_check >> Edge(label="Pass", color="green") >> success
        health_check >> Edge(label="Fail", color="red") >> rollback >> code

def generate_container_architecture():
    """Generate Docker container architecture diagram"""
    
    with Diagram("Docker Container Architecture",
                show=False,
                filename="../../assets/specs/container_architecture",
                direction="LR",
                graph_attr={
                    "fontsize": "11",
                    "bgcolor": "white",
                    "ranksep": "0.8",
                    "pad": "0.3"
                }):
        
        # Host system
        with Cluster("Host OS"):
            docker_daemon = Docker("Docker\nDaemon")
            
        # Container network
        with Cluster("Docker Network"):
            network = Rack("magnetiq-network\nBridge")
            
        # Frontend container
        with Cluster("Frontend Container"):
            react_container = React("React\nStatic Build")
            node_runtime = Rack("Node.js\nServe")
            
        # Backend container  
        with Cluster("Backend Container"):
            fastapi_container = FastAPI("FastAPI\nApp")
            python_runtime = Rack("Python 3.11\nUvicorn")
            
        # Nginx container
        with Cluster("Nginx Container"):
            nginx_container = Nginx("Nginx\nReverse Proxy")
            
        # Persistent volumes
        with Cluster("Persistent Storage"):
            db_volume = Storage("SQLite\nVolume")
            media_volume = Storage("Media\nVolume")
            config_volume = Storage("Config\nVolume")
        
        # Container orchestration
        docker_daemon >> network
        network >> [nginx_container, react_container, fastapi_container]
        
        # Runtime connections
        react_container >> node_runtime
        fastapi_container >> python_runtime
        
        # Volume mounts
        fastapi_container >> Edge(style="dashed") >> db_volume
        fastapi_container >> Edge(style="dashed") >> media_volume
        nginx_container >> Edge(style="dashed") >> config_volume

def generate_ssl_certificate_flow():
    """Generate SSL certificate management flow"""
    
    with Diagram("SSL Certificate Management",
                show=False,
                filename="../../assets/specs/ssl_certificate_flow",
                direction="LR",
                graph_attr={
                    "fontsize": "10",
                    "bgcolor": "white",
                    "ranksep": "0.5"
                }):
        
        # Certificate authority
        with Cluster("Let's Encrypt"):
            letsencrypt = Vault("Certificate\nAuthority")
            
        # Certificate management
        with Cluster("Certbot"):
            certbot = Rack("Certbot\nClient")
            acme_challenge = Action("ACME\nChallenge")
            
        # Web server
        with Cluster("Nginx"):
            nginx_ssl = Nginx("SSL\nTermination")
            cert_files = Storage("SSL\nCertificates")
            
        # Renewal process
        cron = Rack("Cron Job\nRenewal")
        restart = Action("Nginx\nRestart")
        
        # Certificate flow
        certbot >> acme_challenge >> letsencrypt
        letsencrypt >> Edge(label="Certificate") >> cert_files
        cert_files >> nginx_ssl
        
        # Renewal flow
        cron >> Edge(label="Weekly") >> certbot
        certbot >> Edge(label="New Cert") >> restart >> nginx_ssl

def generate_database_management_flow():
    """Generate database management and backup flow"""
    
    with Diagram("Database Management & Backup",
                show=False,
                filename="../../assets/specs/database_management_flow",
                direction="LR",
                graph_attr={
                    "fontsize": "10",
                    "bgcolor": "white",
                    "ranksep": "0.7"
                }):
        
        # Application layer
        with Cluster("Application"):
            fastapi_db = FastAPI("FastAPI\nBackend")
            
        # Database operations
        with Cluster("Database Layer"):
            sqlite_db = Database("SQLite\nWAL Mode")
            vacuum = Action("VACUUM\nAnalyze")
            
        # Backup system
        with Cluster("Backup System"):
            daily_backup = Action("Daily\nBackup")
            backup_storage = Storage("Backup\nFiles")
            cleanup = Action("Cleanup\nOld Backups")
            
        # Monitoring
        with Cluster("Monitoring"):
            integrity_check = Decision("DB\nIntegrity?")
            size_check = Decision("Size\nOK?")
            alerts = Action("Send\nAlerts")
            
        # Database flow
        fastapi_db >> sqlite_db
        sqlite_db >> Edge(label="Weekly") >> vacuum
        sqlite_db >> Edge(label="Daily") >> daily_backup >> backup_storage
        backup_storage >> Edge(label="Weekly") >> cleanup
        
        # Monitoring flow
        sqlite_db >> integrity_check
        sqlite_db >> size_check
        integrity_check >> Edge(label="Fail", color="red") >> alerts
        size_check >> Edge(label="Exceed", color="orange") >> alerts

if __name__ == "__main__":
    print("Generating Magnetiq v2 deployment diagrams...")
    
    generate_deployment_architecture()
    print("✓ Generated deployment architecture diagram")
    
    generate_development_deployment() 
    print("✓ Generated development deployment diagram")
    
    generate_production_deployment()
    print("✓ Generated production deployment diagram")
    
    generate_deployment_process_flow()
    print("✓ Generated deployment process flow")
    
    generate_container_architecture()
    print("✓ Generated container architecture diagram")
    
    generate_ssl_certificate_flow()
    print("✓ Generated SSL certificate flow diagram")
    
    generate_database_management_flow()
    print("✓ Generated database management flow diagram")
    
    print("\nAll deployment diagrams generated successfully in docs/diagrams/assets/specs/")
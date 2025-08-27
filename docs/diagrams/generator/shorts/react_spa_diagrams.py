#!/usr/bin/env python3
"""
React SPA Diagram Generator for Magnetiq v2 Documentation
Generates architecture and flow diagrams for React Single Page Application
All diagrams use horizontal layout (LR) for better page width optimization
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.programming.framework import React, FastAPI
from diagrams.onprem.network import Nginx
from diagrams.onprem.client import Client
from diagrams.generic.storage import Storage
from diagrams.generic.compute import Rack
from diagrams.programming.flowchart import Decision, StartEnd, Action
from diagrams.onprem.container import Docker
from diagrams.programming.language import JavaScript, TypeScript
import os

# Ensure output directory exists
os.makedirs("../../assets/shorts", exist_ok=True)

def generate_react_spa_architecture():
    """Generate React SPA architecture diagram for Magnetiq v2"""
    
    with Diagram("React SPA Architecture in Magnetiq v2", 
                show=False, 
                filename="../../assets/shorts/react_spa_architecture",
                direction="LR",
                graph_attr={
                    "fontsize": "12", 
                    "bgcolor": "white", 
                    "pad": "0.3",
                    "ranksep": "0.8",
                    "nodesep": "0.5"
                }):
        
        # Client side
        with Cluster("Client Browser"):
            browser = Client("Web Browser")
            
        # Build tools
        with Cluster("Development"):
            vite = Rack("Vite\nBuild Tool")
            typescript = TypeScript("TypeScript\nCompiler")
            
        # React application layers
        with Cluster("React SPA"):
            router = React("React Router\nSPA Navigation")
            components = React("Components\nTree")
            state = Rack("Redux Toolkit\nState")
            
        # API communication
        with Cluster("Data Layer"):
            rtk_query = Rack("RTK Query\nAPI Client")
            api = FastAPI("FastAPI\nBackend")
            
        # Build artifacts
        with Cluster("Static Assets"):
            bundle = Storage("JS Bundle\nMinified")
            assets = Storage("Static\nAssets")
            
        # Deployment
        with Cluster("Deployment"):
            nginx = Nginx("Nginx\nStatic Serve")
            docker = Docker("Docker\nContainer")
        
        # Development flow
        vite >> typescript >> components
        
        # Runtime flow
        browser >> nginx >> [bundle, assets]
        browser >> router >> components
        components >> state
        components >> rtk_query >> api
        
        # Build flow
        [components, state] >> bundle
        docker >> nginx

def generate_react_component_hierarchy():
    """Generate React component hierarchy diagram"""
    
    with Diagram("React Component Hierarchy",
                show=False,
                filename="../../assets/shorts/react_component_hierarchy",
                direction="LR",
                graph_attr={
                    "fontsize": "11", 
                    "bgcolor": "white",
                    "ranksep": "0.6",
                    "nodesep": "0.4"
                }):
        
        # Root application
        with Cluster("App Layer"):
            app = React("App.tsx\nRoot")
            router = React("Router\nProvider")
            
        # Layout components
        with Cluster("Layout"):
            layout = React("Layout\nWrapper")
            header = React("Header")
            sidebar = React("Sidebar")
            
        # Page components
        with Cluster("Pages"):
            public_page = React("Public\nPages")
            admin_page = React("Admin\nPages")
            auth_page = React("Auth\nPages")
            
        # Shared components
        with Cluster("Shared"):
            ui_components = React("UI\nComponents")
            forms = React("Forms")
            modals = React("Modals")
        
        # Component tree
        app >> router >> layout
        layout >> header
        layout >> sidebar
        router >> public_page
        router >> admin_page  
        router >> auth_page
        public_page >> ui_components
        admin_page >> forms
        auth_page >> modals

def generate_spa_routing_flow():
    """Generate SPA routing and navigation flow"""
    
    with Diagram("SPA Routing & Navigation Flow",
                show=False,
                filename="../../assets/shorts/spa_routing_flow",
                direction="LR",
                graph_attr={
                    "fontsize": "10",
                    "bgcolor": "white",
                    "ranksep": "0.5"
                }):
        
        # User interaction
        user_click = StartEnd("User\nNavigation")
        
        # Routing decision
        with Cluster("React Router"):
            route_match = Decision("Route\nMatch?")
            history_api = Rack("History\nAPI")
            
        # Route types
        with Cluster("Route Types"):
            public_route = React("Public\nRoute")
            protected_route = React("Protected\nRoute")
            admin_route = React("Admin\nRoute")
            
        # Authentication check
        auth_check = Decision("Authenticated?")
        role_check = Decision("Admin\nRole?")
        
        # Fallback
        not_found = React("404\nPage")
        login_redirect = Action("Redirect\nLogin")
        
        # Navigation flow
        user_click >> history_api >> route_match
        route_match >> Edge(label="Public") >> public_route
        route_match >> Edge(label="Protected") >> auth_check
        route_match >> Edge(label="Admin") >> role_check
        route_match >> Edge(label="No Match", color="red") >> not_found
        
        auth_check >> Edge(label="Yes", color="green") >> protected_route
        auth_check >> Edge(label="No", color="red") >> login_redirect
        
        role_check >> Edge(label="Yes", color="green") >> admin_route
        role_check >> Edge(label="No", color="red") >> login_redirect

def generate_state_management_flow():
    """Generate Redux Toolkit state management flow"""
    
    with Diagram("Redux Toolkit State Management",
                show=False,
                filename="../../assets/shorts/state_management_flow",
                direction="LR",
                graph_attr={
                    "fontsize": "11",
                    "bgcolor": "white",
                    "ranksep": "0.7",
                    "pad": "0.2"
                }):
        
        # Components
        with Cluster("React Components"):
            component = React("Component")
            hooks = Rack("useSelector\nuseDispatch")
            
        # Redux store
        with Cluster("Redux Store"):
            store = Rack("Store")
            reducers = Rack("Slices\nReducers")
            middleware = Rack("Middleware")
            
        # API integration
        with Cluster("RTK Query"):
            api_slice = Rack("API Slice")
            cache = Storage("Query\nCache")
            mutations = Rack("Mutations")
            
        # Actions flow
        actions = Action("Actions\nDispatched")
        
        # State flow
        component >> hooks >> store
        store >> reducers
        actions >> middleware >> reducers
        
        # API flow
        component >> api_slice
        api_slice >> cache
        api_slice >> mutations
        api_slice >> actions

def generate_build_deployment_pipeline():
    """Generate build and deployment pipeline"""
    
    with Diagram("Build & Deployment Pipeline",
                show=False,
                filename="../../assets/shorts/build_deployment_pipeline",
                direction="LR",
                graph_attr={
                    "fontsize": "10",
                    "bgcolor": "white",
                    "ranksep": "0.6"
                }):
        
        # Source code
        with Cluster("Source Code"):
            tsx_files = TypeScript("TSX/TS\nFiles")
            css_files = Storage("CSS\nStyles")
            assets = Storage("Static\nAssets")
            
        # Build tools
        with Cluster("Build Process"):
            vite_build = Rack("Vite\nBuilder")
            typescript_compile = TypeScript("TS\nCompiler")
            bundler = Rack("Module\nBundler")
            
        # Output artifacts
        with Cluster("Build Output"):
            js_bundle = Storage("Bundled\nJS/CSS")
            optimized_assets = Storage("Optimized\nAssets")
            manifest = Storage("Asset\nManifest")
            
        # Deployment
        with Cluster("Deployment"):
            docker_build = Docker("Docker\nBuild")
            nginx_serve = Nginx("Nginx\nServe")
            
        # Pipeline flow
        tsx_files >> vite_build
        css_files >> vite_build
        assets >> vite_build
        vite_build >> typescript_compile >> bundler
        bundler >> js_bundle
        bundler >> optimized_assets
        bundler >> manifest
        js_bundle >> docker_build
        optimized_assets >> docker_build
        docker_build >> nginx_serve

def generate_spa_lifecycle():
    """Generate SPA application lifecycle"""
    
    with Diagram("SPA Application Lifecycle",
                show=False,
                filename="../../assets/shorts/spa_lifecycle",
                direction="LR",
                graph_attr={
                    "fontsize": "10",
                    "bgcolor": "white",
                    "ranksep": "0.5"
                }):
        
        # Initial load
        initial_load = StartEnd("Page\nLoad")
        
        # Bootstrap phase
        with Cluster("Bootstrap"):
            html_parse = Action("HTML\nParse")
            js_load = Action("JS Bundle\nLoad")
            react_mount = Action("React\nMount")
            
        # Runtime phase
        with Cluster("Runtime"):
            route_init = Action("Initial\nRoute")
            component_render = Action("Component\nRender")
            api_calls = Action("API\nCalls")
            
        # User interactions
        with Cluster("User Interactions"):
            navigation = Action("Navigation")
            state_updates = Action("State\nUpdates")
            re_render = Action("Re-render")
            
        # Cleanup
        unmount = StartEnd("Page\nUnload")
        
        # Lifecycle flow
        initial_load >> html_parse >> js_load >> react_mount
        react_mount >> route_init >> component_render >> api_calls
        component_render >> navigation >> state_updates >> re_render
        re_render >> component_render
        navigation >> unmount

if __name__ == "__main__":
    print("Generating React SPA diagrams...")
    
    generate_react_spa_architecture()
    print("✓ Generated React SPA architecture diagram")
    
    generate_react_component_hierarchy()
    print("✓ Generated component hierarchy diagram")
    
    generate_spa_routing_flow()
    print("✓ Generated SPA routing flow diagram")
    
    generate_state_management_flow()
    print("✓ Generated state management flow diagram")
    
    generate_build_deployment_pipeline()
    print("✓ Generated build deployment pipeline diagram")
    
    generate_spa_lifecycle()
    print("✓ Generated SPA lifecycle diagram")
    
    print("\nAll React SPA diagrams generated successfully in docs/diagrams/assets/shorts/")
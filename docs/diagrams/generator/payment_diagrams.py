#!/usr/bin/env python3
"""
Generate payment processing integration diagrams for Magnetiq v2 specification.
"""

import os
from pathlib import Path
from diagrams import Diagram, Cluster, Edge
from diagrams.programming.framework import FastAPI, React
from diagrams.onprem.database import PostgreSQL as Database
from diagrams.generic.blank import Blank
from diagrams.onprem.security import Vault
from diagrams.onprem.monitoring import Grafana
from diagrams.generic.storage import Storage
from diagrams.generic.compute import Rack
from diagrams.generic.network import Firewall
from diagrams.programming.language import Python
from diagrams.onprem.client import Users
from diagrams.programming.flowchart import Action

# Ensure output directory exists
output_dir = Path("docs/diagrams/spec_v2/integrations")
output_dir.mkdir(parents=True, exist_ok=True)

def generate_payment_processing_workflow():
    """Generate payment processing workflow diagram."""
    with Diagram(
        "Payment Processing Workflow", 
        show=False, 
        filename=str(output_dir / "payment_processing_workflow"),
        direction="LR",
        graph_attr={"fontsize": "16", "bgcolor": "white"}
    ):
        # Customer flow
        customer = Users("Customer")
        
        # Payment flow stages
        with Cluster("Payment Gateway"):
            checkout = Action("Stripe Checkout")
            payment_intent = Action("Payment Intent")
        
        with Cluster("Platform Processing"):
            escrow = Vault("Escrow Account")
            fee_calc = Python("Fee Calculation")
            fraud_check = Firewall("Fraud Detection")
        
        with Cluster("Service Delivery"):
            service = Rack("30-for-30 Consultation")
            confirmation = Python("Delivery Confirmation")
        
        with Cluster("Payout System"):
            payout = Action("Consultant Payout")
            platform_fee = Database("Platform Revenue")
        
        # Flow connections
        customer >> Edge(label="€30 payment") >> checkout
        checkout >> payment_intent
        payment_intent >> fraud_check
        fraud_check >> Edge(label="Risk assessment") >> escrow
        escrow >> Edge(label="Payment held") >> service
        service >> confirmation
        confirmation >> Edge(label="Service delivered") >> fee_calc
        fee_calc >> Edge(label="€25.50") >> payout
        fee_calc >> Edge(label="€4.50") >> platform_fee

def generate_revenue_distribution():
    """Generate revenue distribution model diagram."""
    with Diagram(
        "Revenue Distribution Model", 
        show=False, 
        filename=str(output_dir / "revenue_distribution"),
        direction="LR",
        graph_attr={"fontsize": "16", "bgcolor": "white"}
    ):
        # Input
        customer_payment = Users("Customer\n€30.00")
        
        # Processing
        with Cluster("Platform Fee Calculation"):
            fee_processor = Python("Fee Calculator")
            
        # Distribution
        with Cluster("Revenue Distribution"):
            platform_fee = Database("Platform Fee\n€4.50 (15%)")
            consultant_payout = Action("Consultant Payout\n€25.50 (85%)")
        
        # Operational costs (from platform fee)
        with Cluster("Platform Operations"):
            stripe_fees = Action("Processing Fees\n~€1.00")
            platform_revenue = Database("Platform Revenue\n~€3.50")
        
        # Flow
        customer_payment >> fee_processor
        fee_processor >> Edge(label="15%") >> platform_fee
        fee_processor >> Edge(label="85%") >> consultant_payout
        platform_fee >> Edge(label="Processing") >> stripe_fees
        platform_fee >> Edge(label="Net Revenue") >> platform_revenue

def generate_kyc_verification_flow():
    """Generate KYC verification process diagram."""
    with Diagram(
        "KYC Verification Process", 
        show=False, 
        filename=str(output_dir / "kyc_verification_flow"),
        direction="LR",
        graph_attr={"fontsize": "16", "bgcolor": "white"}
    ):
        # Consultant onboarding
        consultant = Users("Consultant")
        
        with Cluster("Document Collection"):
            identity_doc = Blank("Identity\nDocument")
            address_proof = Blank("Address\nProof")
            tax_info = Blank("Tax\nInformation")
        
        with Cluster("Verification System"):
            doc_encryption = Vault("Document\nEncryption")
            kyc_processor = Python("KYC Processor")
            manual_review = Users("Compliance\nTeam")
        
        with Cluster("Account Setup"):
            stripe_account = Action("Stripe Express\nAccount")
            bank_setup = Database("Bank Account\nSetup")
            payout_enable = Action("Payouts\nEnabled")
        
        # Flow
        consultant >> Edge(label="Upload docs") >> identity_doc
        consultant >> Edge(label="Upload docs") >> address_proof  
        consultant >> Edge(label="Upload docs") >> tax_info
        
        identity_doc >> doc_encryption
        address_proof >> doc_encryption
        tax_info >> doc_encryption
        
        doc_encryption >> kyc_processor
        kyc_processor >> Edge(label="Review required") >> manual_review
        manual_review >> Edge(label="Approved") >> stripe_account
        stripe_account >> bank_setup
        bank_setup >> payout_enable

def generate_fraud_detection_pipeline():
    """Generate fraud detection pipeline diagram."""
    with Diagram(
        "Fraud Detection Pipeline", 
        show=False, 
        filename=str(output_dir / "fraud_detection_pipeline"),
        direction="LR",
        graph_attr={"fontsize": "16", "bgcolor": "white"}
    ):
        # Input sources
        payment_request = Users("Payment\nRequest")
        
        with Cluster("Risk Assessment"):
            velocity_check = Python("Velocity\nCheck")
            amount_analysis = Python("Amount\nAnalysis")
            ip_reputation = Firewall("IP\nReputation")
            device_fingerprint = Python("Device\nFingerprint")
        
        with Cluster("Decision Engine"):
            risk_scorer = Python("Risk\nScorer")
            ml_model = Python("ML Fraud\nModel")
            rules_engine = Python("Rules\nEngine")
        
        with Cluster("Actions"):
            approve = Action("Approve\nPayment")
            review = Users("Manual\nReview")
            block = Firewall("Block\nPayment")
        
        # Monitoring
        monitoring = Grafana("Fraud\nMonitoring")
        
        # Flow
        payment_request >> velocity_check
        payment_request >> amount_analysis
        payment_request >> ip_reputation
        payment_request >> device_fingerprint
        
        velocity_check >> risk_scorer
        amount_analysis >> risk_scorer
        ip_reputation >> risk_scorer
        device_fingerprint >> risk_scorer
        
        risk_scorer >> ml_model
        risk_scorer >> rules_engine
        
        ml_model >> Edge(label="Low risk") >> approve
        ml_model >> Edge(label="Medium risk") >> review
        rules_engine >> Edge(label="High risk") >> block
        
        approve >> monitoring
        review >> monitoring
        block >> monitoring

def generate_multi_currency_flow():
    """Generate multi-currency support diagram."""
    with Diagram(
        "Multi-Currency Flow", 
        show=False, 
        filename=str(output_dir / "multi_currency_flow"),
        direction="LR",
        graph_attr={"fontsize": "16", "bgcolor": "white"}
    ):
        # Input
        customer_location = Users("Customer\nLocation")
        
        with Cluster("Currency Detection"):
            geo_detect = Python("Geolocation\nDetection")
            currency_map = Database("Currency\nMapping")
        
        with Cluster("Exchange Rate System"):
            rate_api = Blank("Exchange Rate\nAPI")
            rate_cache = Database("Rate Cache\n(1hr TTL)")
            converter = Python("Currency\nConverter")
        
        with Cluster("Localized Pricing"):
            price_calc = Python("Price\nCalculator")
            local_display = React("Localized\nDisplay")
        
        with Cluster("Payment Processing"):
            stripe_payment = Action("Stripe\nPayment")
            settlement = Database("Settlement\nCurrency")
        
        # Flow
        customer_location >> geo_detect
        geo_detect >> currency_map
        currency_map >> rate_api
        rate_api >> rate_cache
        rate_cache >> converter
        converter >> price_calc
        price_calc >> local_display
        local_display >> stripe_payment
        stripe_payment >> settlement

def generate_consultant_onboarding_flow():
    """Generate consultant onboarding journey diagram."""
    with Diagram(
        "Consultant Onboarding Flow", 
        show=False, 
        filename=str(output_dir / "consultant_onboarding_flow"),
        direction="LR",
        graph_attr={"fontsize": "16", "bgcolor": "white"}
    ):
        # Start
        consultant = Users("New\nConsultant")
        
        with Cluster("Initial Setup"):
            registration = React("Registration\nForm")
            stripe_account = Action("Create Express\nAccount")
        
        with Cluster("KYC Process"):
            doc_upload = React("Document\nUpload")
            kyc_verify = Python("KYC\nVerification")
            compliance_review = Users("Compliance\nReview")
        
        with Cluster("Financial Setup"):
            bank_account = Database("Bank Account\nSetup")
            micro_deposits = Action("Micro-deposit\nVerification")
            payout_config = Python("Payout\nConfiguration")
        
        with Cluster("Platform Activation"):
            profile_complete = React("Profile\nCompletion")
            booking_enable = Python("Enable\nBookings")
            first_payment = Action("Ready for\nPayments")
        
        # Flow
        consultant >> registration
        registration >> stripe_account
        stripe_account >> doc_upload
        doc_upload >> kyc_verify
        kyc_verify >> Edge(label="Needs review") >> compliance_review
        compliance_review >> Edge(label="Approved") >> bank_account
        bank_account >> micro_deposits
        micro_deposits >> payout_config
        payout_config >> profile_complete
        profile_complete >> booking_enable
        booking_enable >> first_payment

def generate_payment_system_architecture():
    """Generate payment system architecture diagram."""
    with Diagram(
        "Payment System Architecture", 
        show=False, 
        filename=str(output_dir / "payment_system_architecture"),
        direction="LR",
        graph_attr={"fontsize": "16", "bgcolor": "white"}
    ):
        # Frontend
        with Cluster("Frontend Layer"):
            customer_ui = React("Customer\nCheckout")
            admin_panel = React("Admin\nPanel")
        
        # Backend services
        with Cluster("Backend Services"):
            payment_api = FastAPI("Payment\nAPI")
            fraud_service = Python("Fraud\nService")
            kyc_service = Python("KYC\nService")
            escrow_service = Python("Escrow\nService")
        
        # Data layer
        with Cluster("Data Layer"):
            payment_db = Database("Payment\nDatabase")
            encrypted_docs = Vault("Encrypted\nDocuments")
            audit_logs = Database("Audit\nLogs")
        
        # External services
        with Cluster("External Services"):
            stripe_connect = Action("Stripe\nConnect")
            currency_api = Blank("Currency\nAPI")
            fraud_api = Firewall("Fraud\nAPI")
        
        # Monitoring
        monitoring = Grafana("Payment\nMonitoring")
        
        # Connections
        customer_ui >> payment_api
        admin_panel >> payment_api
        
        payment_api >> fraud_service
        payment_api >> kyc_service  
        payment_api >> escrow_service
        
        fraud_service >> payment_db
        kyc_service >> encrypted_docs
        escrow_service >> payment_db
        
        payment_api >> stripe_connect
        fraud_service >> fraud_api
        payment_api >> currency_api
        
        payment_api >> audit_logs
        payment_db >> monitoring
        stripe_connect >> monitoring

def generate_all_payment_diagrams():
    """Generate all payment processing diagrams."""
    print("Generating payment processing diagrams...")
    
    diagrams = [
        ("Payment Processing Workflow", generate_payment_processing_workflow),
        ("Revenue Distribution", generate_revenue_distribution),
        ("KYC Verification Flow", generate_kyc_verification_flow),
        ("Fraud Detection Pipeline", generate_fraud_detection_pipeline),
        ("Multi-Currency Flow", generate_multi_currency_flow),
        ("Consultant Onboarding Flow", generate_consultant_onboarding_flow),
        ("Payment System Architecture", generate_payment_system_architecture),
    ]
    
    for name, generator in diagrams:
        try:
            generator()
            print(f"✅ Generated {name}")
        except Exception as e:
            print(f"❌ Failed to generate {name}: {e}")
    
    print(f"\nAll diagrams saved to: {output_dir}")

if __name__ == "__main__":
    generate_all_payment_diagrams()
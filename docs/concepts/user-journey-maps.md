# Magnetiq v2 - User Journey Maps & Conversion Paths

## Overview

This specification documents comprehensive user journey maps for all personas across the Magnetiq platform, identifying conversion paths, decision points, friction areas, and optimization opportunities. Each journey is mapped from initial discovery through conversion and beyond, with specific focus on CTA effectiveness and user experience optimization.

→ **Implements**: [Conversion Optimization Strategy](./conversion-optimization.md)
← **Supports**: [CTA Component Optimization](./cta-components.md), [Friction Reduction Strategies](./friction-reduction-strategies.md)
⚡ **Dependencies**: [User Personas](../spec_v2/users/), [Analytics Framework](../spec_v2/backend/analytics.md), [Frontend Features](../spec_v2/frontend/public/)

## Quick Links
→ **Conversion Strategy**: [Master Optimization Plan](./conversion-optimization.md)
→ **CTA Components**: [Standardized CTA Patterns](./cta-components.md)
→ **Friction Reduction**: [Optimization Tactics](./friction-reduction-strategies.md)
→ **User Personas**: [Detailed Persona Specifications](../spec_v2/users/)
→ **Analytics Integration**: [Journey Tracking](../spec_v2/backend/analytics.md#journey-analytics)

## Journey Mapping Framework

### Journey Structure Definition

#### Universal Journey Phases
```tsx
interface UserJourneyPhase {
  awareness: {
    touchpoints: string[];
    emotions: EmotionalState[];
    goals: string[];
    painPoints: string[];
    ctaOpportunities: CTAOpportunity[];
  };
  interest: {
    actions: UserAction[];
    information: InformationNeed[];
    evaluation: EvaluationCriteria[];
    trustFactors: TrustSignal[];
  };
  consideration: {
    comparison: ComparisonBehavior[];
    riskConcerns: Risk[];
    socialProof: SocialProofElement[];
    decisionFactors: DecisionDriver[];
  };
  conversion: {
    triggers: ConversionTrigger[];
    barriers: ConversionBarrier[];
    process: ConversionStep[];
    confirmation: ConfirmationElement[];
  };
  retention: {
    onboarding: OnboardingStep[];
    value: ValueRealization[];
    expansion: UpsellOpportunity[];
    advocacy: AdvocacyPath[];
  };
}
```

#### Journey Analytics Framework
```tsx
interface JourneyAnalytics {
  quantitative: {
    trafficSources: SourceAttribution;
    conversionRates: ConversionMetrics;
    dropOffPoints: AbandonmentAnalysis;
    timeToConvert: TimeMetrics;
    pathAnalysis: UserPathData;
  };
  qualitative: {
    userFeedback: FeedbackData;
    painPointSeverity: PainPointRating;
    emotionalJourney: EmotionalMapping;
    satisfactionScores: SatisfactionMetrics;
  };
  behavioral: {
    clickstreams: ClickstreamData;
    scrollDepth: EngagementMetrics;
    sessionRecordings: BehavioralInsights;
    heatmaps: InteractionPatterns;
  };
}
```

## B2B Client Journey Maps

### B2B Buyer Financial Persona Journey

#### Discovery to Consultation Booking
```
AWARENESS → INTEREST → CONSIDERATION → CONVERSION → RETENTION

┌─ Discovery ─┐   ┌─ Research ─┐   ┌─ Evaluation ─┐   ┌─ Booking ─┐   ┌─ Follow-up ─┐
│             │   │            │   │             │   │           │   │            │
│ • Search    │ → │ • Content  │ → │ • Compare   │ → │ • Select  │ → │ • Session  │
│ • LinkedIn  │   │ • Experts  │   │ • Reviews   │   │ • Book    │   │ • Results  │
│ • Referral  │   │ • Case     │   │ • Pricing   │   │ • Pay     │   │ • Upsell   │
│             │   │   Studies  │   │ • ROI       │   │           │   │            │
└─────────────┘   └────────────┘   └─────────────┘   └───────────┘   └────────────┘

Pain Points:      Questions:        Concerns:         Barriers:       Opportunities:
• ROI unclear     • Worth cost?     • Expertise fit   • Payment       • More sessions
• Time cost       • Right expert?   • Time value      • Process       • Team booking
• Budget proof    • Success rate?   • Outcome risk    • Scheduling    • Long-term
```

##### Detailed Financial Buyer Journey
```tsx
interface FinancialBuyerJourney {
  phase1_awareness: {
    triggers: [
      "Budget planning season",
      "Performance gap identified",
      "Competitive pressure",
      "Board request for expertise"
    ];
    channels: [
      "LinkedIn thought leadership",
      "Google search for solutions",
      "Industry report mentions",
      "Peer recommendations"
    ];
    emotions: ["cautious", "analytical", "skeptical"];
    ctaPreferences: "learn-more-focused";
  };
  
  phase2_interest: {
    content: [
      "ROI calculators and models",
      "Cost-benefit case studies",
      "Industry-specific examples",
      "Pricing transparency"
    ];
    evaluation: [
      "Compare consultant rates",
      "Review success metrics",
      "Analyze time investment",
      "Assess risk factors"
    ];
    ctaOptimization: "value-demonstration";
  };
  
  phase3_consideration: {
    decisions: [
      "Budget allocation approval",
      "Consultant selection criteria",
      "Timeline feasibility",
      "Success measurement plan"
    ];
    concerns: [
      "Unclear deliverables",
      "No guarantee of results",
      "Consultant availability",
      "Integration with team"
    ];
    ctaStrategy: "risk-mitigation-focused";
  };
  
  phase4_conversion: {
    triggers: [
      "Clear ROI projection",
      "Specific expertise match",
      "Transparent pricing",
      "Risk mitigation assurance"
    ];
    process: [
      "Consultant selection",
      "Budget approval workflow",
      "Booking scheduling",
      "Payment authorization"
    ];
    ctaOptimal: "book-consultation-direct";
  };
}
```

### B2B Buyer Owner Persona Journey

#### Strategic Decision to Implementation
```
STRATEGIC NEED → SOLUTION RESEARCH → EXPERT EVALUATION → ENGAGEMENT → EXPANSION

Executive Challenge    Expert Discovery     Leadership Match     Strategic Session    Program Development
       ↓                     ↓                   ↓                   ↓                    ↓
• Market pressure       • Industry leaders   • Track record      • Strategic align    • Team engagements
• Growth strategy       • Thought leaders    • Vision match      • Implementation    • Ongoing advisory
• Innovation need       • Success stories    • Cultural fit      • Quick wins        • Board presentation
```

##### Detailed Owner Journey Map
```tsx
interface OwnerBuyerJourney {
  phase1_strategic_need: {
    context: [
      "Board pressure for results",
      "Market disruption threat", 
      "Growth plateau reached",
      "Competitive disadvantage"
    ];
    timeframe: "immediate-to-quarterly";
    decisionStyle: "intuitive-but-informed";
    ctaPreference: "executive-summary-focused";
  };
  
  phase2_expert_discovery: {
    channels: [
      "LinkedIn executive content",
      "Industry conference speakers",
      "Peer network referrals",
      "Thought leadership articles"
    ];
    evaluation: [
      "Industry recognition",
      "Previous C-level clients",
      "Transformation results",
      "Cultural alignment"
    ];
    ctaStrategy: "authority-demonstration";
  };
  
  phase3_leadership_evaluation: {
    criteria: [
      "Strategic thinking capability",
      "Change management experience", 
      "Industry-specific insights",
      "Executive communication style"
    ];
    riskFactors: [
      "Consultant-dependency risk",
      "Team acceptance concerns",
      "Implementation complexity",
      "Timeline feasibility"
    ];
    ctaApproach: "executive-consultation-offer";
  };
  
  phase4_strategic_engagement: {
    expectations: [
      "Clear strategic roadmap",
      "Actionable implementation plan",
      "Team capability assessment",
      "Change management guidance"
    ];
    success_metrics: [
      "Strategic clarity achieved",
      "Team alignment improved",
      "Implementation timeline",
      "Measurable outcomes"
    ];
    ctaExpansion: "ongoing-advisory-relationship";
  };
}
```

### B2B Buyer Technical Persona Journey

#### Technical Challenge to Solution Implementation
```
TECHNICAL PROBLEM → SOLUTION RESEARCH → EXPERT VALIDATION → CONSULTATION → IMPLEMENTATION

Problem Identified   Technology Research   Expert Evaluation    Technical Session    Solution Deploy
       ↓                     ↓                   ↓                   ↓                   ↓
• System limitation   • Best practices     • Technical depth    • Architecture      • Implementation
• Architecture gap    • Implementation     • Tool expertise     • Code review       • Team training
• Technology choice   • Case studies       • Problem solving    • Solution design   • Ongoing support
```

##### Detailed Technical Journey Map
```tsx
interface TechnicalBuyerJourney {
  phase1_problem_identification: {
    triggers: [
      "Performance bottlenecks",
      "Scalability challenges", 
      "Security vulnerabilities",
      "Technology debt accumulation"
    ];
    urgency: "project-timeline-driven";
    approach: "solution-focused";
    ctaPreference: "technical-demo-access";
  };
  
  phase2_solution_research: {
    resources: [
      "Technical documentation",
      "Architecture case studies",
      "Implementation guides",
      "Performance benchmarks"
    ];
    evaluation: [
      "Technical feasibility",
      "Resource requirements",
      "Integration complexity",
      "Maintenance overhead"
    ];
    ctaStrategy: "proof-of-concept-focused";
  };
  
  phase3_expert_validation: {
    criteria: [
      "Deep technical expertise",
      "Relevant implementation experience",
      "Problem-solving approach",
      "Communication clarity"
    ];
    concerns: [
      "Solution complexity",
      "Team capability gaps",
      "Implementation timeline",
      "Technical risks"
    ];
    ctaApproach: "technical-consultation";
  };
  
  phase4_implementation_support: {
    deliverables: [
      "Technical architecture",
      "Implementation roadmap",
      "Code review feedback",
      "Best practices guidance"
    ];
    success_criteria: [
      "Problem resolution",
      "Performance improvement",
      "Team knowledge transfer",
      "Sustainable solution"
    ];
    ctaExpansion: "ongoing-technical-advisory";
  };
}
```

## Consultant Journey Maps

### Consultant Discovery to Platform Activation

#### LinkedIn-First Onboarding Journey
```
DISCOVERY → INTEREST → SIGNUP → ACTIVATION → MONETIZATION

Platform Discovery   Value Assessment    Quick Registration   Profile Completion   First Booking
       ↓                    ↓                   ↓                   ↓                   ↓
• LinkedIn outreach   • Earning potential  • LinkedIn import    • Admin review      • Client match
• Organic search      • Time investment    • Basic setup        • Profile polish    • Session delivery
• Referral program    • Platform quality   • Zero friction      • KYC completion    • Payment received
```

##### Detailed Consultant Journey
```tsx
interface ConsultantJourney {
  phase1_discovery: {
    channels: [
      "LinkedIn direct outreach",
      "Consultant referral program",
      "Organic search for monetization",
      "Industry network mentions"
    ];
    mindset: "skeptical-but-interested";
    concerns: [
      "Platform legitimacy",
      "Effort vs. reward ratio",
      "Time commitment required",
      "Quality of client base"
    ];
    ctaStrategy: "low-commitment-exploration";
  };
  
  phase2_interest: {
    information_needs: [
      "Revenue potential calculation",
      "Success stories from peers",
      "Platform fee structure",
      "Client quality indicators"
    ];
    evaluation_criteria: [
      "Earning opportunity size",
      "Platform professional quality",
      "Time investment required",
      "Brand alignment potential"
    ];
    ctaOptimization: "earning-potential-focused";
  };
  
  phase3_simplified_signup: {
    process: [
      "LinkedIn profile discovery",
      "One-click import authorization",
      "Minimal additional information",
      "Instant profile generation"
    ];
    friction_elimination: [
      "No complex forms",
      "No immediate KYC requirement",
      "No payment setup pressure",
      "No extensive onboarding"
    ];
    ctaDesign: "join-in-2-minutes";
  };
  
  phase4_admin_activation: {
    workflow: [
      "Admin profile review",
      "Quality enhancement",
      "KYC process initiation",
      "Payment setup assistance"
    ];
    consultant_experience: [
      "Professional profile creation",
      "Platform readiness notification",
      "First client opportunity alert",
      "Success optimization guidance"
    ];
    ctaProgression: "complete-profile-activation";
  };
  
  phase5_monetization_success: {
    milestones: [
      "First consultation booked",
      "Positive client feedback received",
      "Payment processed successfully",
      "Repeat bookings achieved"
    ];
    expansion_opportunities: [
      "Content creation (whitepapers)",
      "Webinar speaking opportunities",
      "Premium consultant tier",
      "Referral program participation"
    ];
    ctaEvolution: "maximize-earning-potential";
  };
}
```

## Content-Driven Journey Maps

### Whitepaper Download to Consultation Journey

#### Lead Generation to Conversion Path
```
CONTENT DISCOVERY → DOWNLOAD → NURTURING → CONSULTATION → RELATIONSHIP

Search/Social      Whitepaper Access   Expert Connection   Booking Process    Ongoing Engagement
      ↓                    ↓                   ↓                   ↓                   ↓
• Problem search    • Value exchange     • Author introduction • Consultant match  • Follow-up sessions
• LinkedIn share    • Progressive form   • Related content     • Scheduling ease   • Content updates
• Expert content    • Instant access     • Consultation offer  • Payment process   • Expert relationship
```

##### Content Journey Optimization
```tsx
interface ContentJourney {
  phase1_content_discovery: {
    sources: [
      "SEO-optimized search results",
      "LinkedIn consultant sharing",
      "Email announcement campaigns",
      "Cross-content recommendations"
    ];
    intent: "information-seeking";
    barriers: [
      "Content quality uncertainty",
      "Author credibility questions",
      "Time investment concerns",
      "Relevance doubts"
    ];
    ctaStrategy: "value-preview-focused";
  };
  
  phase2_download_conversion: {
    form_optimization: [
      "Progressive profiling approach",
      "Minimal initial fields",
      "Social proof integration",
      "Value reinforcement messaging"
    ];
    trust_building: [
      "Author credentials display",
      "Download count indicators", 
      "Related expert showcase",
      "Content quality preview"
    ];
    ctaDesign: "instant-access-emphasis";
  };
  
  phase3_post_download_nurturing: {
    sequence: [
      "Immediate access confirmation",
      "Author introduction message",
      "Related content suggestions",
      "Consultation opportunity presentation"
    ];
    personalization: [
      "Content relevance matching",
      "Expert recommendation algorithm",
      "Industry-specific messaging",
      "Engagement behavior adaptation"
    ];
    ctaProgression: "expert-consultation-offer";
  };
  
  phase4_consultation_conversion: {
    transition: [
      "Expert credibility established",
      "Content value demonstrated",
      "Consultation relevance clear",
      "Process simplicity emphasized"
    ];
    optimization: [
      "Seamless booking integration",
      "Expert availability display",
      "Consultation outcome preview",
      "Risk mitigation messaging"
    ];
    ctaFinal: "book-with-expert";
  };
}
```

### Webinar Registration to Engagement Journey

#### Event-Driven Conversion Path
```
WEBINAR DISCOVERY → REGISTRATION → ATTENDANCE → ENGAGEMENT → CONVERSION

Event Awareness     Sign-up Process    Live Participation   Interactive Session   Follow-up Action
      ↓                    ↓                   ↓                   ↓                   ↓
• Topic interest     • Quick registration • Expert presentation • Q&A participation  • Consultation booking
• Speaker expertise  • Calendar integration • Content value     • Direct engagement  • Content download  
• Network promotion  • Reminder sequence   • Community building • Personal connection • Expert follow-up
```

##### Webinar Journey Optimization
```tsx
interface WebinarJourney {
  phase1_event_discovery: {
    promotion: [
      "Topic-targeted social campaigns",
      "Expert network amplification",
      "Email announcement sequences",
      "Content marketing integration"
    ];
    appeal_factors: [
      "Timely topic relevance",
      "Expert speaker authority",
      "Interactive format promise",
      "Exclusive access positioning"
    ];
    ctaStrategy: "reserve-spot-urgency";
  };
  
  phase2_registration_optimization: {
    process: [
      "Streamlined registration form",
      "Social calendar integration",
      "Automatic reminder setup",
      "Pre-event content delivery"
    ];
    conversion_factors: [
      "Clear value proposition",
      "Speaker credibility emphasis",
      "Limited availability messaging",
      "Zero-commitment positioning"
    ];
    ctaDesign: "secure-seat-focus";
  };
  
  phase3_attendance_maximization: {
    engagement_sequence: [
      "Registration confirmation",
      "Pre-event valuable content",
      "Day-of reminder series",
      "Last-chance attendance push"
    ];
    value_reinforcement: [
      "Speaker preparation insights",
      "Exclusive content previews",
      "Community participation benefits",
      "Learning outcome promises"
    ];
    ctaEvolution: "join-live-session";
  };
  
  phase4_post_webinar_conversion: {
    opportunities: [
      "Private consultant Q&A offer",
      "Extended discussion booking",
      "Related content access",
      "Expert network introduction"
    ];
    conversion_optimization: [
      "Hot-lead immediate follow-up",
      "Personalized consultation offer",
      "Value-added resource sharing",
      "Relationship building focus"
    ];
    ctaStrategy: "continue-conversation";
  };
}
```

## Cross-Journey Optimization Patterns

### Multi-Touch Attribution Mapping

#### Customer Journey Complexity
```tsx
interface MultiTouchJourney {
  touchpoint_sequence: [
    { source: "linkedin", content: "thought-leadership", action: "profile_view" },
    { source: "google", content: "whitepaper", action: "download" },
    { source: "email", content: "webinar-invite", action: "registration" },
    { source: "webinar", content: "expert-session", action: "engagement" },
    { source: "direct", content: "consultant-profile", action: "booking" }
  ];
  
  attribution_model: {
    firstTouch: "awareness-credit";
    lastTouch: "conversion-credit";  
    timeDecay: "recent-interaction-weight";
    position: "first-last-emphasis";
    datadriven: "machine-learning-attribution";
  };
  
  optimization_insights: {
    assist_channels: "nurturing-touchpoint-value";
    conversion_paths: "high-performing-sequences";
    drop_off_analysis: "journey-abandonment-points";
    cross_device: "user-journey-continuity";
  };
}
```

### Journey Personalization Engine

#### Dynamic Path Optimization
```tsx
interface PersonalizedJourneyEngine {
  segmentation: {
    behavioral: [
      "content-consumer",
      "solution-seeker", 
      "price-sensitive",
      "authority-driven"
    ];
    demographic: [
      "company-size",
      "industry-vertical",
      "role-seniority",
      "geographic-region"
    ];
    psychographic: [
      "risk-tolerance",
      "decision-speed",
      "information-depth",
      "social-influence"
    ];
  };
  
  dynamic_adaptation: {
    content_recommendation: "ai-powered-relevance";
    cta_personalization: "behavioral-optimization";
    timing_optimization: "engagement-pattern-matching";
    channel_preference: "interaction-history-based";
  };
  
  optimization_mechanisms: {
    realtime_adjustment: "session-behavior-adaptation";
    predictive_modeling: "conversion-probability-scoring";
    automated_testing: "dynamic-multivariate-optimization";
    feedback_integration: "user-preference-learning";
  };
}
```

## Friction Point Identification

### Common Journey Friction Areas

#### Universal Friction Points
```tsx
interface CommonFrictionPoints {
  technical: {
    page_load_speed: "conversion-killer";
    mobile_optimization: "thumb-friendly-critical";
    form_complexity: "field-reduction-priority";
    payment_process: "checkout-abandonment-risk";
  };
  
  content: {
    value_clarity: "benefit-communication-gap";
    trust_signals: "credibility-establishment-need";
    information_overload: "decision-paralysis-risk";
    social_proof: "peer-validation-absence";
  };
  
  process: {
    registration_complexity: "signup-abandonment-factor";
    scheduling_difficulty: "booking-process-friction";
    confirmation_clarity: "next-steps-uncertainty";
    support_accessibility: "help-availability-gap";
  };
  
  psychological: {
    commitment_anxiety: "decision-reversal-fear";
    price_sensitivity: "value-justification-need";
    expertise_uncertainty: "consultant-fit-concern";
    outcome_risk: "results-guarantee-desire";
  };
}
```

### Journey-Specific Friction Analysis

#### B2B Decision-Making Complexity
```tsx
interface B2BFrictionFactors {
  organizational: {
    approval_process: "multi-stakeholder-coordination";
    budget_constraints: "cost-justification-requirements";
    timing_challenges: "procurement-cycle-alignment";
    internal_resistance: "change-management-obstacles";
  };
  
  risk_management: {
    vendor_assessment: "due-diligence-requirements";
    outcome_predictability: "roi-demonstration-need";
    contract_negotiation: "terms-agreement-complexity";
    relationship_management: "long-term-partnership-evaluation";
  };
  
  decision_factors: {
    consensus_building: "stakeholder-alignment-need";
    competitive_analysis: "alternative-evaluation-time";
    implementation_planning: "resource-allocation-assessment";
    success_measurement: "kpi-definition-requirements";
  };
}
```

## Journey Optimization Recommendations

### Immediate Optimization Opportunities

#### High-Impact, Low-Effort Improvements
```tsx
interface QuickWinOptimizations {
  cta_improvements: [
    "action-oriented-language",
    "urgency-without-pressure",
    "benefit-focused-messaging",
    "risk-mitigation-emphasis"
  ];
  
  trust_signal_enhancement: [
    "social-proof-integration",
    "expert-credential-display",
    "success-story-placement",
    "testimonial-optimization"
  ];
  
  form_optimization: [
    "field-reduction-analysis",
    "progressive-profiling-implementation", 
    "autofill-capability-addition",
    "error-prevention-improvement"
  ];
  
  mobile_experience: [
    "thumb-zone-cta-placement",
    "loading-speed-optimization",
    "touch-target-size-increase",
    "scrolling-friction-reduction"
  ];
}
```

### Advanced Journey Enhancements

#### Sophisticated Optimization Strategies
```tsx
interface AdvancedOptimizations {
  ai_personalization: {
    content_recommendation: "behavioral-prediction-engine";
    expert_matching: "compatibility-algorithm";
    timing_optimization: "engagement-pattern-analysis";
    message_customization: "psychographic-adaptation";
  };
  
  predictive_analytics: {
    conversion_probability: "lead-scoring-enhancement";
    churn_prevention: "abandonment-intervention";
    upsell_timing: "expansion-opportunity-detection";
    lifetime_value: "relationship-investment-optimization";
  };
  
  omnichannel_optimization: {
    cross_device: "journey-continuity-assurance";
    channel_orchestration: "touchpoint-coordination";
    message_consistency: "brand-experience-alignment";
    attribution_accuracy: "contribution-measurement-improvement";
  };
}
```

## Success Measurement Framework

### Journey Performance Metrics

#### Conversion Funnel Analytics
```tsx
interface JourneyMetrics {
  awareness_stage: {
    traffic_volume: "visitor-acquisition-rate";
    source_quality: "traffic-source-conversion-potential";
    content_engagement: "time-depth-interaction-quality";
    bounce_rate: "initial-interest-retention";
  };
  
  interest_stage: {
    content_consumption: "resource-engagement-depth";
    expert_exploration: "consultant-profile-interaction";
    comparison_behavior: "evaluation-activity-level";
    return_visits: "consideration-process-engagement";
  };
  
  consideration_stage: {
    evaluation_depth: "detailed-information-consumption";
    social_proof_interaction: "trust-signal-engagement";
    comparison_completion: "option-evaluation-thoroughness";
    decision_timeline: "consideration-phase-duration";
  };
  
  conversion_stage: {
    conversion_rate: "visitor-to-customer-percentage";
    process_completion: "conversion-funnel-efficiency";
    abandonment_recovery: "exit-intent-capture-success";
    payment_completion: "transaction-finalization-rate";
  };
  
  retention_stage: {
    onboarding_completion: "new-customer-activation-success";
    repeat_engagement: "subsequent-interaction-frequency";
    expansion_conversion: "upsell-cross-sell-success";
    advocacy_development: "referral-generation-rate";
  };
}
```

## Cross-References Summary

### Core Dependencies  
← **User Research Foundation**: [User Personas](../spec_v2/users/)
→ **Analytics Infrastructure**: [Journey Analytics](../spec_v2/backend/analytics.md#journey-tracking)
⚡ **Frontend Implementation**: [Public Features](../spec_v2/frontend/public/)

### Optimization Integration
↔️ **Conversion Strategy**: [Master Optimization Plan](./conversion-optimization.md)
↔️ **CTA Components**: [Component Optimization](./cta-components.md)
↔️ **Friction Reduction**: [Optimization Tactics](./friction-reduction-strategies.md)

### Feature Applications
← **Booking Journey**: [Book-a-Meeting Flow](../spec_v2/frontend/public/features/book-a-meeting.md)
← **Consultant Journey**: [Signup Process](../spec_v2/frontend/public/features/consultant-signup.md)
← **Content Journey**: [Whitepaper Downloads](../spec_v2/frontend/public/features/whitepapers.md)
← **Event Journey**: [Webinar Registration](../spec_v2/frontend/public/features/webinars.md)

This comprehensive user journey mapping provides the foundation for systematic optimization of all conversion paths, enabling data-driven improvements that reduce friction and increase conversion rates across all user personas and interaction scenarios.
import { 
  RocketLaunchIcon, 
  ShieldCheckIcon, 
  LightBulbIcon, 
  ChartBarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { 
  PageTemplate, 
  HeroTemplate, 
  SectionTemplate, 
  FeatureTemplate, 
  TestimonialTemplate, 
  CTATemplate,
  PricingTemplate,
  StatsTemplate,
  FAQTemplate
} from '../../components/templates'

const TemplateShowcasePage = () => {
  const features = [
    {
      icon: <RocketLaunchIcon className="h-6 w-6" />,
      title: 'Rapid Development',
      description: 'Build and deploy applications in record time with our streamlined development process and pre-built components.',
    },
    {
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      title: 'Enterprise Security',
      description: 'Industry-leading security measures to protect your data and ensure compliance with global standards.',
    },
    {
      icon: <LightBulbIcon className="h-6 w-6" />,
      title: 'Innovation Focus',
      description: 'Stay ahead of the curve with cutting-edge technology solutions and forward-thinking approaches.',
    },
    {
      icon: <ChartBarIcon className="h-6 w-6" />,
      title: 'Data-Driven Insights',
      description: 'Make informed decisions with comprehensive analytics and real-time performance monitoring.',
    },
    {
      icon: <UserGroupIcon className="h-6 w-6" />,
      title: 'Team Collaboration',
      description: 'Enhanced collaboration tools that bring teams together for maximum productivity and efficiency.',
    },
    {
      icon: <GlobeAltIcon className="h-6 w-6" />,
      title: 'Global Scale',
      description: 'Built to scale globally with multi-region deployment and enterprise-grade infrastructure.',
    },
  ]

  const testimonials = [
    {
      content: "voltAIc Systems transformed our entire digital infrastructure. The results were immediate and impressive. Our team productivity increased by 300% in just the first quarter.",
      author: {
        name: "Sarah Chen",
        title: "CTO",
        company: "TechCorp Industries"
      },
      rating: 5
    },
    {
      content: "The level of expertise and attention to detail is unmatched. They delivered exactly what we needed, on time and within budget. Highly recommended for any enterprise.",
      author: {
        name: "Marcus Rodriguez",
        title: "Head of Digital Strategy",
        company: "Global Solutions Ltd"
      },
      rating: 5
    },
    {
      content: "Working with voltAIc Systems was a game-changer. Their innovative approach and deep technical knowledge helped us achieve goals we thought were impossible.",
      author: {
        name: "Emily Watson",
        title: "VP of Engineering",
        company: "Innovation Labs"
      },
      rating: 5
    }
  ]

  const stats = [
    {
      value: '99.9%',
      label: 'Uptime Guarantee',
      description: 'Enterprise-grade reliability',
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      trend: { direction: 'up' as const, value: '+0.1%', label: 'vs last month' }
    },
    {
      value: '2.5s',
      label: 'Average Load Time',
      description: 'Lightning fast performance',
      icon: <RocketLaunchIcon className="h-6 w-6" />,
      trend: { direction: 'down' as const, value: '-0.3s', label: 'improved' }
    },
    {
      value: '50k+',
      label: 'Active Users',
      description: 'Growing community',
      icon: <UserGroupIcon className="h-6 w-6" />,
      trend: { direction: 'up' as const, value: '+12%', label: 'this month' }
    },
    {
      value: '24/7',
      label: 'Support Available',
      description: 'Always here to help',
      icon: <ChartBarIcon className="h-6 w-6" />
    }
  ]

  const pricingTiers = [
    {
      name: 'Starter',
      price: { amount: 29, period: 'month' },
      description: 'Perfect for small teams and startups',
      features: [
        { name: 'Up to 5 users', included: true },
        { name: '10GB storage', included: true },
        { name: 'Basic analytics', included: true },
        { name: 'Email support', included: true },
        { name: 'Advanced integrations', included: false },
        { name: 'Priority support', included: false }
      ],
      ctaText: 'Start Free Trial',
      ctaHref: '#'
    },
    {
      name: 'Professional',
      price: { amount: 79, period: 'month' },
      description: 'Best for growing businesses',
      features: [
        { name: 'Up to 25 users', included: true },
        { name: '100GB storage', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'Priority email support', included: true },
        { name: 'Advanced integrations', included: true },
        { name: '24/7 phone support', included: false }
      ],
      highlighted: true,
      ctaText: 'Start Free Trial',
      ctaHref: '#',
      badge: 'Most Popular'
    },
    {
      name: 'Enterprise',
      price: { amount: 199, period: 'month' },
      description: 'For large organizations',
      features: [
        { name: 'Unlimited users', included: true },
        { name: '1TB storage', included: true },
        { name: 'Custom analytics', included: true },
        { name: '24/7 phone support', included: true },
        { name: 'Custom integrations', included: true },
        { name: 'Dedicated success manager', included: true }
      ],
      ctaText: 'Contact Sales',
      ctaHref: '#'
    }
  ]

  const faqs = [
    {
      question: 'How easy is it to get started with the template system?',
      answer: 'Our template system is designed for developers of all skill levels. You can get started in minutes with our comprehensive documentation and example implementations.'
    },
    {
      question: 'Can I customize the templates to match my brand?',
      answer: 'Absolutely! All templates are fully customizable with Tailwind CSS classes. You can easily adjust colors, fonts, spacing, and layouts to match your brand identity.'
    },
    {
      question: 'Are the templates responsive and mobile-friendly?',
      answer: 'Yes, all our templates are built with a mobile-first approach and are fully responsive across all device sizes and screen resolutions.'
    },
    {
      question: 'Do you provide TypeScript support?',
      answer: 'Yes, all our templates are built with TypeScript and include full type definitions for better development experience and code reliability.'
    },
    {
      question: 'What kind of support do you offer?',
      answer: 'We offer comprehensive documentation, code examples, and community support. Premium users also get direct access to our development team.'
    },
    {
      question: 'Can I use these templates in commercial projects?',
      answer: 'Yes, our templates come with a commercial license that allows you to use them in both personal and commercial projects without restrictions.'
    }
  ]

  return (
    <PageTemplate headerVariant="transparent">
      {/* Hero Section */}
      <HeroTemplate
        badge={{ text: "🚀 New Template System", variant: "primary" }}
        title="Beautiful Templates for Modern Web Applications"
        subtitle="Template Showcase"
        description="Discover our comprehensive template system designed for rapid development and stunning user experiences. From hero sections to complex layouts, we've got you covered."
        primaryAction={{
          text: "Get Started",
          onClick: () => console.log('Get Started clicked')
        }}
        secondaryAction={{
          text: "View Documentation",
          onClick: () => console.log('Documentation clicked')
        }}
        backgroundVariant="pattern"
        size="xlarge"
      />

      {/* Features Section */}
      <SectionTemplate
        title="Powerful Features"
        subtitle="Why Choose Our Templates"
        description="Our template system combines flexibility with consistency, allowing you to build beautiful applications faster than ever before."
        size="large"
        background="white"
      >
        <FeatureTemplate
          features={features}
          layout="grid"
          columns={3}
          iconStyle="circle"
          showHover={true}
        />
      </SectionTemplate>

      {/* Card Layout Features */}
      <SectionTemplate
        title="Card-based Features"
        description="Same features, different presentation style with elevated cards for enhanced visual hierarchy."
        size="medium"
        background="gray"
      >
        <FeatureTemplate
          features={features.slice(0, 3)}
          layout="cards"
          columns={3}
          iconStyle="square"
          showHover={true}
        />
      </SectionTemplate>

      {/* List Layout Features */}
      <SectionTemplate
        title="List-based Features"
        description="Clean, minimal presentation perfect for detailed feature descriptions."
        size="medium"
        background="white"
        containerSize="narrow"
      >
        <FeatureTemplate
          features={features.slice(0, 4)}
          layout="list"
          iconStyle="circle"
          showHover={false}
        />
      </SectionTemplate>

      {/* Testimonials Section */}
      <SectionTemplate
        title="What Our Clients Say"
        subtitle="Client Success Stories"
        description="Don't just take our word for it. Here's what industry leaders have to say about working with us."
        size="large"
        background="primary"
      >
        <TestimonialTemplate
          testimonials={testimonials}
          layout="grid"
          columns={3}
          showRating={true}
          showQuotes={true}
          variant="card"
          background="primary"
        />
      </SectionTemplate>

      {/* Featured Testimonial */}
      <SectionTemplate
        title="Featured Success Story"
        size="medium"
        background="white"
        containerSize="narrow"
      >
        <TestimonialTemplate
          testimonials={[testimonials[0]]}
          layout="single"
          showRating={true}
          showQuotes={true}
          variant="featured"
          background="white"
        />
      </SectionTemplate>

      {/* CTA Section - Default */}
      <CTATemplate
        title="Ready to Get Started?"
        description="Join thousands of satisfied customers who have transformed their businesses with our solutions."
        primaryAction={{
          text: "Start Free Trial",
          onClick: () => console.log('Free trial clicked')
        }}
        secondaryAction={{
          text: "Schedule Demo",
          onClick: () => console.log('Demo clicked')
        }}
        variant="centered"
        background="gradient"
        size="large"
        pattern={true}
        icon={<SparklesIcon className="h-12 w-12 text-white/80" />}
      />

      {/* CTA Section - Split */}
      <CTATemplate
        title="Need Custom Solutions?"
        description="Our enterprise team is ready to work with you on custom implementations tailored to your specific needs."
        primaryAction={{
          text: "Contact Sales",
          onClick: () => console.log('Contact sales clicked')
        }}
        secondaryAction={{
          text: "View Pricing",
          onClick: () => console.log('Pricing clicked')
        }}
        variant="split"
        background="dark"
        size="medium"
        icon={<ArrowTrendingUpIcon className="h-8 w-8 text-primary-400" />}
      />

      {/* CTA Section - Minimal */}
      <CTATemplate
        title="Stay Updated"
        description="Get the latest updates on new features and industry insights."
        primaryAction={{
          text: "Subscribe to Newsletter",
          onClick: () => console.log('Newsletter clicked')
        }}
        variant="minimal"
        background="gray"
        size="small"
      />

      {/* Stats Section */}
      <SectionTemplate
        title="Performance Metrics"
        subtitle="By the Numbers"
        description="See how our template system delivers exceptional performance and user satisfaction."
        size="large"
        background="white"
      >
        <StatsTemplate
          stats={stats}
          layout="grid"
          columns={4}
          variant="simple"
          background="white"
          size="medium"
          showTrends={true}
        />
      </SectionTemplate>

      {/* Inline Stats */}
      <SectionTemplate
        title="Quick Stats Overview"
        description="Essential metrics at a glance with inline layout."
        size="medium"
        background="primary"
      >
        <StatsTemplate
          stats={stats.slice(0, 3)}
          layout="inline"
          variant="simple"
          background="primary"
          size="large"
          showTrends={false}
        />
      </SectionTemplate>

      {/* Pricing Section */}
      <SectionTemplate
        title="Choose Your Plan"
        subtitle="Flexible Pricing"
        description="Select the perfect plan for your team's needs with transparent, predictable pricing."
        size="large"
        background="gray"
      >
        <PricingTemplate
          title="Simple, Transparent Pricing"
          tiers={pricingTiers}
        />
      </SectionTemplate>

      {/* FAQ Section - Single Column */}
      <SectionTemplate
        title="Frequently Asked Questions"
        subtitle="Got Questions?"
        description="Find answers to common questions about our template system and get started quickly."
        size="large"
        background="white"
      >
        <FAQTemplate
          faqs={faqs}
          layout="single"
          variant="cards"
          allowMultiple={true}
        />
      </SectionTemplate>

      {/* FAQ Section - Two Column */}
      <SectionTemplate
        title="FAQ - Two Column Layout"
        description="Same questions, different presentation with side-by-side layout for better space utilization."
        size="medium"
        background="gray"
      >
        <FAQTemplate
          faqs={faqs}
          layout="two-column"
          variant="bordered"
          allowMultiple={false}
        />
      </SectionTemplate>
    </PageTemplate>
  )
}

export default TemplateShowcasePage
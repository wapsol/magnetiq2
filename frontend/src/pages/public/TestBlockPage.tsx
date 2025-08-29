import React from 'react'
import { ContentRenderer } from '../../components/content'
import { ProcessedPageContent } from '../../types/content'
import PageTemplate from '../../components/templates/PageTemplate'

const TestBlockPage: React.FC = () => {
  // Mock block-based content for testing
  const mockBlockContent: ProcessedPageContent = {
    format: 'blocks',
    blocks: {
      en: [
        {
          _type: 'hero',
          title: 'Welcome to voltAIc Systems',
          subtitle: 'AI Consulting Excellence',
          description: 'Transform your business with cutting-edge AI solutions. We provide expert consulting, custom development, and strategic guidance to help you leverage the power of artificial intelligence.',
          primary_action: {
            text: 'Book Consultation',
            href: '/booking',
            variant: 'primary'
          },
          secondary_action: {
            text: 'View Our Services',
            href: '/services',
            variant: 'outline'
          },
          background_variant: 'gradient',
          size: 'large',
          alignment: 'center',
          badge: {
            text: '🚀 Now Available',
            variant: 'primary'
          }
        },
        {
          _type: 'features',
          title: 'Our AI Solutions',
          subtitle: 'Comprehensive Services',
          items: [
            {
              title: 'AI Strategy Consulting',
              description: 'Develop comprehensive AI roadmaps aligned with your business objectives and technical capabilities.',
              icon: 'brain'
            },
            {
              title: 'Custom AI Development',
              description: 'Build tailored AI solutions using the latest machine learning and deep learning technologies.',
              icon: 'code'
            },
            {
              title: 'AI Integration Services',
              description: 'Seamlessly integrate AI capabilities into your existing systems and workflows.',
              icon: 'integration'
            }
          ],
          layout: 'grid',
          columns: 3,
          show_icons: true
        },
        {
          _type: 'richtext',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'At voltAIc Systems, we believe that ',
              marks: []
            },
            {
              _type: 'span',
              text: 'artificial intelligence',
              marks: ['strong']
            },
            {
              _type: 'span',
              text: ' should be accessible to every business. Our team of experts combines deep technical knowledge with practical business insight to deliver AI solutions that drive real results.',
              marks: []
            }
          ]
        },
        {
          _type: 'stats',
          title: 'Our Impact',
          stats: [
            {
              label: 'Projects Completed',
              value: '150+',
              description: 'Successful AI implementations'
            },
            {
              label: 'Client Satisfaction',
              value: '98%',
              description: 'Customer satisfaction rate'
            },
            {
              label: 'ROI Increase',
              value: '300%',
              description: 'Average ROI improvement'
            },
            {
              label: 'Years Experience',
              value: '10+',
              description: 'Combined team experience'
            }
          ],
          layout: 'horizontal',
          columns: 4
        },
        {
          _type: 'cta',
          title: 'Ready to Transform Your Business?',
          description: 'Join hundreds of companies that have successfully implemented AI with voltAIc Systems.',
          primary_action: {
            text: 'Get Started Today',
            href: '/booking',
            variant: 'primary'
          },
          secondary_action: {
            text: 'Download Whitepaper',
            href: '/whitepapers',
            variant: 'outline'
          },
          background_variant: 'primary',
          size: 'medium'
        }
      ]
    },
    meta: {
      block_count: { en: 5 },
      supported_languages: ['en']
    }
  }

  return (
    <PageTemplate>
      <ContentRenderer 
        content={mockBlockContent}
        language="en"
        className="test-block-page"
      />
    </PageTemplate>
  )
}

export default TestBlockPage
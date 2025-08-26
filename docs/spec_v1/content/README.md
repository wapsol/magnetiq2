# Content Structure

This directory contains the website content organized for better maintainability and content management.

## Structure

```
content/
├── interfaces.ts        # TypeScript interfaces for content types
├── navigation.ts       # Navigation menu content
├── hero.ts            # Hero section content
├── features.ts        # Features section content
├── cta.ts             # Call-to-action content
├── footer.ts          # Footer content
├── about.ts           # About page content
├── contact.ts         # Contact page content
├── services.ts        # Services page content
├── products.ts        # Products/Software page content
├── support.ts         # Support page content
├── webinar.ts         # Webinar page content
├── notFound.ts        # 404 page content
└── index.ts           # Main export file
```

## Benefits

- **Reduced Risk**: Content writers can now edit specific sections without affecting other parts
- **Better Organization**: Content is logically grouped by page/section
- **Easier Maintenance**: Smaller files are easier to navigate and edit
- **Team Collaboration**: Multiple people can work on different content areas simultaneously

## Usage

Content is still imported the same way:

```typescript
import { defaultContent } from '@/content';
// or
import { SiteContent, FeatureItem } from '@/content';
```

## Content Writer Guidelines

- **About page content**: Edit `about.ts`
- **Services content**: Edit `services.ts`
- **Product/Software content**: Edit `products.ts`
- **Support content**: Edit `support.ts`
- **Navigation menus**: Edit `navigation.ts`
- **Homepage hero/features**: Edit `hero.ts` and `features.ts`
- **Footer links/info**: Edit `footer.ts`
# PageMeta Component Usage Guide

The `PageMeta` component has been enhanced with Open Graph and Twitter Card support for better SEO and social media sharing.

## Component Props

```typescript
interface PageMetaProps {
  title: string;           // Required: Page title
  description: string;     // Required: Page description (150-160 chars recommended)
  keywords?: string;       // Optional: Comma-separated keywords
  image?: string;          // Optional: Social sharing image (defaults to logo)
  url?: string;            // Optional: Current page URL path (e.g., '/about')
  type?: 'website' | 'article'; // Optional: Page type (defaults to 'website')
}
```

## Basic Usage

```tsx
import { PageMeta } from '../components/PageMeta';

export function AboutPage() {
  return (
    <>
      <PageMeta
        title="About Us"
        description="Learn about FreeMikvahCal, the free mikvah calendar helping families track halachic dates with privacy and ease."
      />
      {/* Your page content */}
    </>
  );
}
```

## Advanced Usage with All Props

```tsx
<PageMeta
  title="Mikvah Information"
  description="Comprehensive guide to taharat hamishpacha and family purity practices. Learn about mikvah, niddah, and halachic dates."
  keywords="mikvah, niddah, taharat hamishpacha, family purity, halacha"
  url="/information"
  image="/images/information-preview.png"
  type="article"
/>
```

## SEO Best Practices

### Title Guidelines
- **Length**: 50-60 characters (Google shows ~60 chars)
- **Format**: Primary Keyword - Secondary Keyword | Brand
- **Examples**:
  - ✅ "Free Mikvah Calendar | FreeMikvahCal"
  - ✅ "About Us | FreeMikvahCal"
  - ❌ "Page" (too short, not descriptive)
  - ❌ "Welcome to the best free mikvah calendar tracking application for Jewish families" (too long)

### Description Guidelines
- **Length**: 150-160 characters
- **Include**: Primary keyword, value proposition, call to action
- **Examples**:
  - ✅ "Track your mikvah calendar privately and automatically. Get reminders for forbidden days and onah beinonis. 100% free, forever."
  - ❌ "This is our about page." (too short)
  - ❌ Very long description that exceeds 160 characters and will be truncated by Google anyway

### Keywords Guidelines
- **Count**: 5-10 relevant keywords
- **Format**: Comma-separated
- **Mix**: Brand terms, descriptive terms, long-tail keywords
- **Example**: "mikvah calendar, niddah tracker, family purity, taharat hamishpacha, jewish calendar, halachic dates"

## Example Implementations for Each Page

### Homepage
```tsx
<PageMeta
  title="FreeMikvahCal - Free Mikvah Calendar & Niddah Tracker"
  description="Free, private mikvah calendar for tracking halachic dates. Automatically calculate forbidden days, onah beinonis, and receive reminders customized to your minhagim."
  keywords="mikvah calendar, niddah tracker, family purity, taharat hamishpacha, halachic calendar, jewish calendar, onah beinonis"
  url="/"
/>
```

### About Page
```tsx
<PageMeta
  title="About FreeMikvahCal"
  description="Learn about FreeMikvahCal's mission to make family purity accessible to all Jewish families. Discover how our free mikvah calendar helps thousands of women."
  keywords="about mikvah calendar, family purity app, jewish calendar app, taharat hamishpacha"
  url="/about"
/>
```

### Information Page
```tsx
<PageMeta
  title="Mikvah & Niddah Information"
  description="Educational resources about taharat hamishpacha, mikvah customs, and halachic dates. Learn about onah beinonis, forbidden days, and different minhagim."
  keywords="mikvah information, niddah laws, taharat hamishpacha guide, onah beinonis, halachic dates"
  url="/information"
  type="article"
/>
```

### Login Page
```tsx
<PageMeta
  title="Login"
  description="Sign in to your FreeMikvahCal account to access your private mikvah calendar and track your halachic dates."
  url="/login"
/>
```

### Register Page
```tsx
<PageMeta
  title="Create Free Account"
  description="Sign up for FreeMikvahCal. Create your free account to start tracking your mikvah calendar with complete privacy. No payment required."
  keywords="mikvah calendar signup, free niddah tracker, family purity app registration"
  url="/register"
/>
```

### Privacy Policy
```tsx
<PageMeta
  title="Privacy Policy"
  description="Learn how FreeMikvahCal protects your privacy. We never share your personal information or tracking data. Read our complete privacy policy."
  url="/privacy-policy"
/>
```

### Terms of Service
```tsx
<PageMeta
  title="Terms of Service"
  description="Terms and conditions for using FreeMikvahCal's mikvah calendar service. Review our terms of service agreement."
  url="/terms-of-service"
/>
```

### Accessibility Statement
```tsx
<PageMeta
  title="Accessibility Statement"
  description="FreeMikvahCal is committed to making our mikvah calendar accessible to all users. Learn about our accessibility features and standards."
  url="/accessibility"
/>
```

## Social Media Image Guidelines

### Image Requirements
- **Size**: Minimum 1200x630px (Facebook/Twitter)
- **Format**: JPG or PNG
- **File size**: Under 5MB
- **Aspect ratio**: 1.91:1 (landscape)

### Using Custom Images
```tsx
<PageMeta
  title="Your Page Title"
  description="Your description"
  image="/images/social-preview.png"
  url="/your-page"
/>
```

### Default Behavior
If no image is specified, uses the site logo: `/flower-icon-512-noBg.png`

## Automatic Enhancements

The PageMeta component automatically:
1. ✅ Adds "| FreeMikvahCal" to titles (if not already present)
2. ✅ Converts relative URLs to absolute URLs
3. ✅ Converts relative images to absolute URLs
4. ✅ Adds canonical URLs to prevent duplicate content
5. ✅ Includes Open Graph tags for social sharing
6. ✅ Includes Twitter Card tags
7. ✅ Sets proper page type (website or article)

## Testing Your Meta Tags

### View in Browser
1. Right-click on page → "View Page Source"
2. Look in `<head>` section for meta tags
3. Verify all tags are present and correct

### Social Media Preview Tools
Test how your pages will appear when shared:

- **Facebook**: https://developers.facebook.com/tools/debug/
- **Twitter**: https://cards-dev.twitter.com/validator
- **LinkedIn**: https://www.linkedin.com/post-inspector/

### SEO Preview Tools
- **SERP Preview**: https://www.highervisibility.com/seo/tools/serp-snippet-optimizer/
- **Meta Tags**: https://metatags.io/

## Common Mistakes to Avoid

❌ **Don't**:
- Use the same title/description on multiple pages
- Stuff keywords unnaturally
- Exceed character limits
- Forget to add PageMeta to new pages
- Use relative URLs for canonical links
- Use small or low-quality images for social sharing

✅ **Do**:
- Make each page's meta tags unique
- Write for humans first, search engines second
- Include primary keywords naturally
- Update meta tags when page content changes
- Use descriptive, compelling titles
- Test social sharing on all platforms

## Need Help?

- Check `SEO_GUIDE.md` for comprehensive SEO documentation
- Use browser dev tools to inspect generated meta tags
- Test with social media preview tools before deploying

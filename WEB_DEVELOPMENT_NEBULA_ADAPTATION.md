# Web Development Nebula Framework Adaptation

**⚠️ UPDATED:** November 2024 - Constellations, Star Systems, Star Gates terminology + Docker API support

## Overview
This document adapts the Nebula Context Engineering Protocol for **all types of web development** - from simple landing pages to complex full-stack applications, covering static sites, SPAs, SSR, and everything in between.

### Integration Options
- **MCP Server:** Local IDE integration (Cursor, VSCode) via Model Context Protocol
- **Docker API:** REST API access for remote/centralized deployment
- **Hybrid:** Use both - MCP for local development, API for team collaboration
- **Central KG:** Connect to PostgreSQL-backed Knowledge Graph for cross-project learning

---

## Web Project Types Supported

### 1. **Static Websites**
- Landing pages
- Portfolio sites
- Documentation sites
- Company websites
- **Tools:** Astro, 11ty, Hugo, Jekyll
- **Hosting:** Netlify, Vercel, GitHub Pages, Cloudflare Pages

### 2. **Single Page Applications (SPA)**
- Web apps with client-side routing
- Dashboard applications
- Admin panels
- **Tools:** React, Vue, Angular, Svelte
- **Hosting:** Netlify, Vercel, AWS S3 + CloudFront

### 3. **Server-Side Rendered (SSR)**
- SEO-optimized web apps
- E-commerce sites
- Content-heavy sites
- **Tools:** Next.js, Nuxt, SvelteKit, Remix
- **Hosting:** Vercel, Netlify, AWS, Docker

### 4. **Full-Stack Applications**
- Complete web applications with backend
- API + frontend integration
- Database-driven sites
- **Tools:** Next.js, Remix, SvelteKit, Astro + API
- **Hosting:** Vercel, Railway, Render, AWS, DigitalOcean

### 5. **Content Management (CMS)**
- WordPress sites
- Headless CMS sites
- Blog platforms
- **Tools:** WordPress, Strapi, Sanity, Contentful
- **Hosting:** WP Engine, Netlify, Vercel

---

## Website Project Constellations

### Constellation 0: Planning & Setup (→ 0.1.0.0)

**Strategic Overview:**
Define website type, choose tech stack, and establish development environment.

**Star Systems:**
- **0.1:** Project Definition
  - Website type (static, SPA, SSR, full-stack, CMS)
  - Target audience and goals
  - Content structure planning
  - SEO requirements
  - Performance targets

- **0.2:** Tech Stack Selection
  - **Static Sites:** Astro (recommended), 11ty, Hugo
  - **React-based:** Next.js (recommended), Vite + React
  - **Vue-based:** Nuxt (recommended), Vite + Vue
  - **Svelte-based:** SvelteKit (recommended)
  - **Traditional:** HTML/CSS/JS with bundler
  - **CMS:** WordPress, Strapi, or headless CMS

- **0.3:** Environment Setup
  - Node.js installation (18+ recommended)
  - Git repository initialization
  - Package manager (npm, yarn, pnpm)
  - Code editor configuration
  - **Initialize project memory (via MCP server or Docker API)**

**Star Gate 0:** Environment ready, project scaffolded, dev server runs

---

### Constellation 1: Design & Structure (→ 0.2.0.0)

**Strategic Overview:**
Establish visual design system, site structure, and core HTML/CSS foundation.

**Star Systems:**
- **1.1:** Design System
  - Color palette definition
  - Typography system
  - Spacing scale
  - Component inventory
  - Responsive breakpoints
  - **Tools:** Figma, Adobe XD, or Penpot

- **1.2:** Site Structure
  ```
  website/
  ├── src/
  │   ├── pages/           # Page components
  │   ├── components/      # Reusable components
  │   ├── layouts/         # Page layouts
  │   ├── styles/          # CSS/SCSS files
  │   ├── assets/          # Images, fonts
  │   └── lib/             # Utilities
  ├── public/              # Static assets
  └── content/             # Markdown content (if applicable)
  ```

- **1.3:** Core Styles
  - CSS reset/normalize
  - Global styles
  - CSS custom properties (variables)
  - **Styling Approach:**
    - **Tailwind CSS** (recommended for speed)
    - **CSS Modules** (component scoping)
    - **Sass/SCSS** (traditional)
    - **CSS-in-JS** (styled-components, Emotion)

**Star Gate 1:** Design system documented, site structure established, basic styling works

---

### Constellation 2: Core Pages & Navigation (→ 0.3.0.0)

**Strategic Overview:**
Build essential pages, navigation system, and responsive layout.

**Star Systems:**
- **2.1:** Essential Pages
  - Homepage
  - About page
  - Contact page
  - 404 error page
  - Privacy policy / Terms of service

- **2.2:** Navigation System
  - Header/navbar component
  - Footer component
  - Mobile menu (hamburger)
  - Breadcrumbs (if applicable)
  - Search functionality (if needed)

- **2.3:** Responsive Design
  - Mobile-first approach
  - Tablet breakpoint (768px)
  - Desktop breakpoint (1024px)
  - Large desktop (1440px+)
  - Touch-friendly interactions
  - **Test on:** Chrome DevTools, real devices

**Star Gate 2:** All core pages complete, navigation works on all devices, responsive verified

---

### Constellation 3: Content & Features (→ 0.4.0.0)

**Strategic Overview:**
Implement content management, dynamic features, and interactivity.

**Star Systems:**
- **3.1:** Content Management
  - **Static Sites:**
    - Markdown/MDX content
    - Content collections
    - Frontmatter parsing
  - **CMS-based:**
    - WordPress setup
    - Headless CMS integration (Strapi, Sanity)
    - Content API configuration

- **3.2:** Dynamic Features
  - Blog/News section (if needed)
  - Portfolio/Case studies
  - Product catalog (if e-commerce)
  - Team members section
  - Testimonials/Reviews

- **3.3:** Forms & Interactions
  - Contact form
  - Newsletter signup
  - Form validation
  - **Form Handling:**
    - **Formspree** (easy)
    - **Netlify Forms** (if on Netlify)
    - **Custom API** (full-stack)
    - **EmailJS** (client-side)
  - Loading states
  - Success/error messages

**Star Gate 3:** Content displays correctly, forms work and validate, dynamic features functional

---

### Constellation 4: SEO & Performance (→ 0.5.0.0)

**Strategic Overview:**
Optimize for search engines, improve performance, and ensure fast load times.

**Star Systems:**
- **4.1:** SEO Optimization
  - Meta tags (title, description)
  - Open Graph tags (social sharing)
  - Twitter Card tags
  - Canonical URLs
  - Structured data (JSON-LD)
  - Sitemap.xml generation
  - Robots.txt
  - **Tools:** Next SEO, Astro SEO

- **4.2:** Performance Optimization
  - Image optimization
    - **Next.js:** next/image
    - **Astro:** Built-in image optimization
    - **Manual:** WebP/AVIF formats, lazy loading
  - Font optimization
    - **Next.js:** next/font
    - **Manual:** Font subsetting, preload
  - CSS optimization
    - Minification
    - Critical CSS
    - Unused CSS removal
  - JavaScript optimization
    - Code splitting
    - Tree shaking
    - Lazy loading

- **4.3:** Performance Testing
  - Lighthouse audit (target: 90+)
  - Core Web Vitals
    - LCP (Largest Contentful Paint) < 2.5s
    - FID (First Input Delay) < 100ms
    - CLS (Cumulative Layout Shift) < 0.1
  - PageSpeed Insights
  - WebPageTest

**Star Gate 4:** Lighthouse 90+, Core Web Vitals green, images optimized, load time < 3s

---

### Constellation 5: Integrations & Analytics (→ 0.6.0.0)

**Strategic Overview:**
Add third-party integrations, analytics, and monitoring.

**Star Systems:**
- **5.1:** Analytics & Tracking
  - **Privacy-Friendly:**
    - Plausible (recommended)
    - Fathom Analytics
    - Umami
  - **Traditional:**
    - Google Analytics 4
    - Matomo (self-hosted)
  - Event tracking
  - Conversion tracking

- **5.2:** Third-Party Services
  - Email marketing (Mailchimp, ConvertKit)
  - Live chat (Intercom, Crisp)
  - Social media widgets
  - Payment processing (Stripe, if e-commerce)
  - CDN (Cloudflare, Fastly)

- **5.3:** Monitoring & Errors
  - Error tracking (Sentry)
  - Uptime monitoring (UptimeRobot)
  - Performance monitoring
  - User feedback tools (Hotjar, Microsoft Clarity)

**Star Gate 5:** Analytics working, integrations tested, monitoring active

---

### Constellation 6: Security & Accessibility (→ 0.7.0.0)

**Strategic Overview:**
Ensure website is secure, accessible, and GDPR-compliant.

**Star Systems:**
- **6.1:** Security
  - HTTPS/SSL certificate
  - Security headers (CSP, HSTS, X-Frame-Options)
  - Environment variables protection
  - API keys security
  - Form spam protection (reCAPTCHA, Turnstile)
  - Rate limiting (if applicable)

- **6.2:** Accessibility (WCAG 2.1 AA)
  - Semantic HTML
  - ARIA labels where needed
  - Keyboard navigation
  - Screen reader testing (NVDA, JAWS)
  - Color contrast (4.5:1 for text)
  - Focus indicators
  - Alt text for images
  - **Tools:** axe DevTools, WAVE

- **6.3:** Legal & Compliance
  - Cookie consent banner (GDPR)
  - Privacy policy page
  - Terms of service
  - GDPR compliance (if EU traffic)
  - CCPA compliance (if California traffic)

**Star Gate 6:** Security headers active, WCAG AA compliant, legal pages complete

---

### Constellation 7: Deployment & Maintenance (→ 1.0.0.0)

**Strategic Overview:**
Deploy to production, set up CI/CD, and establish maintenance procedures.

**Star Systems:**
- **7.1:** Hosting & Deployment
  - **Recommended Hosts:**
    - **Vercel** (Next.js, React, SvelteKit)
    - **Netlify** (All frameworks, great DX)
    - **Cloudflare Pages** (Fast, generous free tier)
    - **GitHub Pages** (Static sites)
    - **Railway/Render** (Full-stack apps)
  - Custom domain setup
  - SSL certificate
  - DNS configuration

- **7.2:** CI/CD Pipeline
  - Automated builds on git push
  - Preview deployments for PRs
  - Automated testing
  - Deployment notifications
  - Rollback strategy

- **7.3:** Maintenance Plan
  - Backup strategy
  - Update schedule (dependencies)
  - Content update workflow
  - Performance monitoring
  - SEO monitoring
  - Link checking

**Star Gate 7:** Live in production, CI/CD working, monitoring active, backups configured

---

## Framework-Specific Guides

### Astro (Recommended for Content Sites)

**Best For:** Blogs, documentation, marketing sites, portfolio sites

**Key Features:**
- Zero JS by default (islands architecture)
- Bring your own framework (React, Vue, Svelte)
- Excellent performance
- Built-in image optimization
- Markdown/MDX support

**Quick Start:**
```bash
npm create astro@latest
cd my-website
npm install
npm run dev
```

**Project Structure:**
```
astro-site/
├── src/
│   ├── pages/           # Routes (file-based)
│   ├── components/      # Astro/React/Vue components
│   ├── layouts/         # Page layouts
│   └── content/         # Markdown content
└── public/              # Static assets
```

**Example Component:**
```astro
---
// Component script (runs at build time)
const { title } = Astro.props;
const posts = await Astro.glob('./posts/*.md');
---

<div>
  <h1>{title}</h1>
  {posts.map(post => (
    <article>
      <h2>{post.frontmatter.title}</h2>
      <p>{post.frontmatter.description}</p>
    </article>
  ))}
</div>
```

---

### Next.js (Recommended for Full-Stack)

**Best For:** Full-stack apps, e-commerce, dashboards, SaaS

**Key Features:**
- React-based
- Server-side rendering
- API routes (backend)
- Image optimization
- File-based routing

**Quick Start:**
```bash
npx create-next-app@latest
cd my-website
npm run dev
```

**See:** [REACT_NEBULA_ADAPTATION.md](./REACT_NEBULA_ADAPTATION.md) for complete Next.js guide

---

### Eleventy (11ty)

**Best For:** Simple static sites, blogs, documentation

**Key Features:**
- Zero config
- Multiple template languages
- Fast builds
- Flexible data cascade

**Quick Start:**
```bash
npm init -y
npm install @11ty/eleventy
npx @11ty/eleventy --serve
```

---

### Hugo

**Best For:** Large static sites, documentation, blogs

**Key Features:**
- Extremely fast builds
- No Node.js required
- Built-in templates
- Powerful content management

**Quick Start:**
```bash
# Install Hugo
brew install hugo  # macOS
# or download from https://gohugo.io/

hugo new site my-website
cd my-website
hugo server
```

---

### SvelteKit

**Best For:** Modern web apps, interactive sites

**Key Features:**
- Svelte-based (less boilerplate)
- Server-side rendering
- API routes
- Excellent performance

**Quick Start:**
```bash
npm create svelte@latest my-website
cd my-website
npm install
npm run dev
```

---

## Common Website Patterns

### Landing Page Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Your site description">
  <title>Your Site Title</title>
  <!-- Open Graph -->
  <meta property="og:title" content="Your Site Title">
  <meta property="og:description" content="Your site description">
  <meta property="og:image" content="/og-image.jpg">
  <meta property="og:url" content="https://yoursite.com">
</head>
<body>
  <!-- Hero Section -->
  <header>
    <nav><!-- Navigation --></nav>
    <section class="hero">
      <h1>Main Headline</h1>
      <p>Subheadline</p>
      <button>Call to Action</button>
    </section>
  </header>

  <!-- Features Section -->
  <section class="features">
    <!-- Feature items -->
  </section>

  <!-- Testimonials -->
  <section class="testimonials">
    <!-- Customer quotes -->
  </section>

  <!-- CTA Section -->
  <section class="cta">
    <h2>Ready to get started?</h2>
    <button>Sign Up Now</button>
  </section>

  <!-- Footer -->
  <footer>
    <!-- Links, copyright, social -->
  </footer>
</body>
</html>
```

---

### Contact Form (Netlify Forms)
```html
<form name="contact" method="POST" data-netlify="true">
  <input type="hidden" name="form-name" value="contact">
  
  <label>
    Name:
    <input type="text" name="name" required>
  </label>
  
  <label>
    Email:
    <input type="email" name="email" required>
  </label>
  
  <label>
    Message:
    <textarea name="message" required></textarea>
  </label>
  
  <button type="submit">Send</button>
</form>
```

---

### SEO Component (React/Next.js)
```typescript
import Head from 'next/head';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export function SEO({ title, description, image, url }: SEOProps) {
  const siteTitle = `${title} | Your Site Name`;
  const ogImage = image || '/default-og-image.jpg';
  const siteUrl = url || 'https://yoursite.com';

  return (
    <Head>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:type" content="website" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Head>
  );
}
```

---

## Performance Checklist

### Images
- [ ] Use WebP/AVIF formats
- [ ] Implement lazy loading
- [ ] Add width/height attributes
- [ ] Use responsive images (srcset)
- [ ] Optimize file sizes (< 200KB)

### CSS
- [ ] Minify CSS
- [ ] Remove unused CSS
- [ ] Use CSS custom properties
- [ ] Implement critical CSS
- [ ] Avoid @import

### JavaScript
- [ ] Minify and bundle
- [ ] Code splitting
- [ ] Defer non-critical scripts
- [ ] Remove unused code
- [ ] Use modern JS (ES6+)

### Fonts
- [ ] Use system fonts when possible
- [ ] Subset custom fonts
- [ ] Preload critical fonts
- [ ] Use font-display: swap

### Hosting
- [ ] Enable HTTP/2
- [ ] Use CDN
- [ ] Enable compression (gzip/brotli)
- [ ] Set cache headers
- [ ] Implement service worker (if PWA)

---

## Recommended Tools

### Development
- **Editor:** VS Code with extensions
- **Preview:** Browser DevTools, Responsively
- **Version Control:** Git + GitHub/GitLab

### Design
- **Design Tool:** Figma (free tier available)
- **Icons:** Heroicons, Lucide, Feather
- **Images:** Unsplash, Pexels (free stock photos)
- **Illustrations:** unDraw, Storyset

### Performance
- **Testing:** Lighthouse, WebPageTest
- **Monitoring:** Vercel Analytics, Cloudflare Web Analytics
- **Optimization:** Squoosh (images), FontSquirrel (fonts)

### SEO
- **Analysis:** Google Search Console, Bing Webmaster
- **Keywords:** Ubersuggest, AnswerThePublic
- **Monitoring:** Ahrefs, SEMrush (or free alternatives)

---

## Deployment Platforms Comparison

| Platform | Best For | Free Tier | Build Time | DX | Recommendations |
|----------|----------|-----------|------------|----|--------------------|
| **Vercel** | Next.js, React | Generous | Fast | ⭐⭐⭐⭐⭐ | Highly recommended |
| **Netlify** | All frameworks | Generous | Fast | ⭐⭐⭐⭐⭐ | Highly recommended |
| **Cloudflare Pages** | Static sites | Generous | Fast | ⭐⭐⭐⭐ | Great for simple sites |
| **GitHub Pages** | Static sites | Free | Fast | ⭐⭐⭐ | Good for docs/portfolios |
| **Railway** | Full-stack | Limited | Medium | ⭐⭐⭐⭐ | Good for databases |
| **Render** | Full-stack | Limited | Slow | ⭐⭐⭐ | Solid alternative |

---

## Nebula Protocol Integration

### Track Website Performance
```typescript
// Log performance metrics to Nebula
const metrics = {
  lighthouse: 95,
  lcp: 1.2,
  fid: 50,
  cls: 0.05
};

await fetch('/api/nebula/metrics', {
  method: 'POST',
  body: JSON.stringify(metrics)
});
```

### Track Deployment
```typescript
// After successful deployment
await fetch('/api/nebula/star-gate', {
  method: 'POST',
  body: JSON.stringify({
    constellation: 'DEPLOYMENT',
    status: 'passed',
    performanceAcceptable: metrics.lighthouse > 90
  })
});
```

---

## Resources

### Learning
- [MDN Web Docs](https://developer.mozilla.org/)
- [web.dev](https://web.dev/)
- [CSS-Tricks](https://css-tricks.com/)
- [Smashing Magazine](https://www.smashingmagazine.com/)

### Frameworks
- [Astro Docs](https://docs.astro.build/)
- [Next.js Docs](https://nextjs.org/docs)
- [11ty Docs](https://www.11ty.dev/docs/)
- [Hugo Docs](https://gohugo.io/documentation/)
- [SvelteKit Docs](https://kit.svelte.dev/docs)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Squoosh](https://squoosh.app/) (image optimization)

---

**Supported:** All modern web frameworks and static site generators  
**Recommended:** Astro (static/content) or Next.js (full-stack)  
**Last Updated:** November 2025


# Project 7: Markdown Blog Generator

## Non-Technical Overview

### What We're Building

A static site generator that converts markdown files into a beautiful blog website. Users write posts in markdown, run one command, and get a complete website with posts, tags, RSS feed, and search.

### Why This Project?

Creating a blog shouldn't require a complex CMS. This project solves:
- Setting up WordPress/CMS complexity
- Security vulnerabilities of dynamic sites
- Hosting costs of database-driven sites
- Slow page load times
- Writing in WYSIWYG editors

### Who Is This For?

- Bloggers wanting simple, fast sites
- Developers documenting projects
- Technical writers creating documentation
- Anyone wanting to own their content
- People who prefer markdown over visual editors

### Core Features (What Users Can Do)

1. **Write in Markdown** - Simple, distraction-free writing
2. **Frontmatter Metadata** - Title, date, tags, categories
3. **Templates** - Customizable Jinja2 themes
4. **Syntax Highlighting** - Code blocks with colors
5. **RSS Feed** - Auto-generated feed for readers
6. **Tags & Categories** - Organize posts
7. **Search** - Find posts by keyword
8. **Dark/Light Theme** - Toggle appearance
9. **Fast Build** - Rebuild site in seconds

### User Experience Flow

```
1. User writes: content/posts/my-first-post.md
2. Adds frontmatter:
   ---
   title: My First Post
   date: 2025-01-15
   tags: [python, tutorial]
   ---
   # My First Post
   Hello world!
3. User types: blog build
4. Tool scans markdown files
5. Renders each to HTML with template
6. Generates index page, RSS feed, tag pages
7. Outputs to: output/
8. Summary: "Built 10 posts in 2 seconds"
9. User types: blog serve
10. Blog opens at http://localhost:8000
```

### Success Criteria (How We Know It Works)

- [ ] Builds 100 posts in under 5 seconds
- [ ] Generated HTML is valid
- [ ] Syntax highlighting works for 10+ languages
- [ ] RSS feed validates (W3C)
- [ ] Search finds all matching posts
- [ ] Links are relative (site works locally)
- [ ] Images display correctly
- [ ] Theme switching works
- [ ] Incremental builds detect changes only

### Technical Constraints

- Must work offline (no CDN dependencies)
- Must generate static files only (no server-side)
- Must support markdown extensions
- Must validate all frontmatter
- Must handle missing images gracefully
- Must preserve directory structure
- Must support custom templates

### Similar Products (For Reference)

- Jekyll (Ruby-based)
- Hugo (Go-based, fast)
- Pelican (Python-based, complex)
- 11ty (JavaScript-based)

### Project Scope

**In Scope:**
- Markdown to HTML conversion
- Frontmatter parsing (YAML)
- Jinja2 templating
- Syntax highlighting (Pygments)
- RSS feed generation
- Tag/category pages
- Search functionality (client-side)
- Asset management (CSS, JS, images)
- Development server
- Dark/light theme toggle

**Out of Scope:**
- Comments (use external service)
- Analytics (use external service)
- Database storage
- Admin panel
- Multi-author support
- Content versioning
- Image optimization
- CDN integration

### Estimated Complexity

**Complexity Level:** Moderate

**Reason:**
- File system traversal and organization
- Template engine integration
- Markdown extension ecosystem
- URL routing and structure
- RSS feed spec compliance
- Asset pipeline management
- Incremental build detection
- Static site best practices

**Estimated Constellations:** 8-10

1. **Setup & Structure** - Project setup, directory structure, config
2. **Markdown Parsing** - Parse markdown, extract frontmatter
3. **Template Engine** - Jinja2 integration, default theme
4. **Post Rendering** - Convert markdown to HTML, apply templates
5. **Index & Archive** - Generate list pages, pagination
6. **Tags & Categories** - Tag/category pages, filtering
7. **RSS Feed** - Generate valid RSS 2.0 feed
8. **Search** - Client-side search (lunr.js or similar)
9. **Development Server** - Live preview, auto-rebuild
10. **Polish & Theming** - Dark mode, responsive design, assets

---

## Key Decisions to Make

1. **Markdown Parser**
   - python-markdown (extensible)
   - mistune (fast, simple)
   - markdown2 (batteries included)

2. **Frontmatter Parser**
   - python-frontmatter (dedicated)
   - PyYAML (manual parsing)
   - TOML (alternative format)

3. **Template Engine**
   - Jinja2 (powerful, popular)
   - Mako (fast, Python-based)
   - String templates (simple)

4. **Syntax Highlighting**
   - Pygments (comprehensive)
   - highlight.js (client-side)
   - Prism.js (client-side, modern)

5. **Search Implementation**
   - Lunr.js (client-side, no server)
   - Pagefind (fast, modern)
   - Simple grep (server-side)

6. **Asset Processing**
   - Copy as-is (simple)
   - Minify CSS/JS (faster loads)
   - Sass/SCSS compilation (powerful)

---

## Directory Structure

```
blog-project/
├── content/
│   ├── posts/
│   │   ├── 2025-01-first-post.md
│   │   └── 2025-02-second-post.md
│   └── pages/
│       ├── about.md
│       └── contact.md
├── themes/
│   └── default/
│       ├── templates/
│       │   ├── base.html
│       │   ├── post.html
│       │   ├── index.html
│       │   └── tag.html
│       └── static/
│           ├── css/
│           ├── js/
│           └── images/
├── output/
│   ├── index.html
│   ├── posts/
│   ├── tags/
│   ├── feed.xml
│   └── assets/
└── config.yaml
```

---

## Frontmatter Format

```yaml
---
title: "My Awesome Post"
date: 2025-01-15
updated: 2025-01-20  # optional
author: "John Doe"  # optional
tags: [python, tutorial, beginner]
categories: [programming]
summary: "A brief summary of this post"  # optional
draft: false  # optional
---
# Post content starts here...
```

---

## RSS Feed Requirements

### Must Include:
- Channel title, description, link
- Item title, link, description
- Publication date (RFC 822 format)
- GUID (unique identifier)
- Categories/tags

### Must Validate:
- W3C Feed Validation Service
- Valid XML structure
- Proper date formatting
- Escaped HTML in descriptions

---

## Search Implementation

### Option 1: Lunr.js (Client-Side)
- Build search index during generation
- Export as JSON
- Load in browser
- Fast, no server required

### Option 2: Simple JavaScript Filter
- Load all post metadata as JSON
- Filter in browser
- Simpler but slower with many posts

### Requirements:
- Search title, content, tags
- Highlight matching terms
- Show excerpts with matches
- Rank by relevance

---

## Performance Optimizations

1. **Incremental Builds**
   - Track file modification times
   - Only rebuild changed posts
   - Update index pages

2. **Template Caching**
   - Compile templates once
   - Reuse for all posts

3. **Asset Optimization**
   - Minify CSS/JS
   - Optimize images
   - Inline critical CSS

4. **Parallel Processing**
   - Render posts concurrently
   - Use multiprocessing for large sites

---

## Success Metrics

After implementation, we should be able to:

- Build 100 posts in under 5 seconds
- Full rebuild of 1000 posts in under 30 seconds
- Incremental rebuild in under 2 seconds
- Generate valid RSS feed (W3C validator)
- Search 100 posts with results in under 100ms
- Support markdown extensions (tables, footnotes, etc.)
- Theme customization without code changes
- Dev server with live reload under 1 second

---

**This overview will be used to generate the initial constellation structure using the Nebula Protocol.**

**Next Steps:**
1. Initialize Nebula Protocol for this project
2. Generate constellations with focus on file processing
3. Create Star Systems for parsing, templates, assets, build process
4. Test with various markdown features
5. Record template patterns to Central KG
6. Validate RSS feed with external tools
7. Performance test with 1000+ posts


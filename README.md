# Luxure Nest — Commercial Real Estate Landing Page System

## Phase 1: Project Architecture & Foundational Landing-Page Template

This repository contains the **Phase 1 foundational architecture** for the **Luxure Nest** commercial real estate landing-page system.

---

## 1. Architectural Principles

1. **Configuration-Driven System**: Content, copy, services, cities, business hubs, and form options are centrally configured in data modules rather than duplicated across six different HTML files.
2. **Single Shared Landing-Page Template**: One semantic, accessible `index.html` serves all six target routes dynamically.
3. **Vanilla Web Technologies Only**: Built exclusively with **HTML5, CSS3, and modern ES6+ JavaScript**. Zero frameworks, zero external UI libraries, zero build pipelines.
4. **Safe URL Parameter Handling**: Untrusted query parameters (e.g. `?loc=...`, UTMs) are strictly sanitized and allowlisted. Never injected via `innerHTML`.
5. **Phase 2 Ready**: Strict contracts for the two-step lead form schema and the 7-column Google Sheet submission payload (`Name`, `Date of Site Visit`, `Time of Site Visit`, `Requirement`, `Company Name`, `Assigned To`, `Status`).

---

## 2. Directory Structure

```text
LuxureNest_Subdomain_Page/
│
├── index.html                  # Foundational semantic landing-page template
├── thank-you.html              # Post-conversion Thank You page template
├── server.js                   # Zero-dependency local Node.js development server
├── package.json                # Project scripts (npm start)
├── _redirects                  # Clean URL rewrites (Netlify / Cloudflare Pages)
├── vercel.json                 # Clean URL rewrites (Vercel)
│
├── css/
│   ├── base.css                # CSS reset, accessibility utilities, design tokens
│   ├── layout.css              # Containers, grids, hero split, header, footer
│   ├── components.css          # Buttons, badges, cards, form slots, expert team
│   └── responsive.css          # Mobile-first breakpoints (mobile, tablet, desktop)
│
├── js/
│   ├── app.js                  # Application orchestrator & Phase 2 integration bridges
│   ├── config.js               # Central configuration hub & schema contracts
│   ├── dynamic-content.js      # Safe DOM update engine (zero innerHTML injection)
│   ├── routing.js              # Clean path, query & hash route detection + fallbacks
│   └── utils.js                # Sanitization, query parsing, defensive DOM utilities
│
├── data/
│   ├── services.js             # Coworking & Office service configurations
│   ├── cities.js               # Gurugram, Noida & Delhi market configurations
│   └── micromarkets.js         # Allowlisted micro-market registry & lookup
│
└── assets/
    ├── logo/
    │   └── luxure-nest-logo.svg # Vector brand logo
    ├── icons/
    │   ├── wifi.svg
    │   ├── building.svg
    │   ├── shield.svg
    │   ├── calendar.svg
    │   └── phone.svg
    └── images/
        ├── workspace-placeholder.svg
        ├── team-avatar-1.svg
        ├── team-avatar-2.svg
        └── team-avatar-3.svg
```

---

## 3. Supported Routes

The architecture supports the six required routes:

- `/coworking/gurugram`
- `/coworking/noida`
- `/coworking/delhi`
- `/office/gurugram`
- `/office/noida`
- `/office/delhi`

### Testing Routes Locally:
- **Clean URLs** (via `node server.js`):
  `http://localhost:3000/coworking/gurugram`
- **Query Parameter fallback** (works even via `file://` or any static server):
  `index.html?service=coworking&city=gurugram`
- **In-Browser Route Switcher**:
  Click any route in the top inspection bar to switch instantaneously.

---

## 4. Design System Tokens (Champagne & Navy)

The visual design system is defined via CSS custom properties in `css/base.css`:
- **Deep Navy / Charcoal**: `--color-brand-navy-dark` (`#070D18`), `--color-brand-navy` (`#0B1325`), `--color-brand-charcoal` (`#141B2D`)
- **Restrained Champagne Gold**: `--color-accent-gold` (`#C5A880`), `--color-accent-bronze` (`#846743`)
- **Architectural Radii**: `--radius-xs` (2px), `--radius-sm` (4px), `--radius-md` (8px)

---

## 5. Running the Project

```bash
# Start the local development server (Node.js built-in, no npm install required)
npm start
# or
node server.js
```

Open `http://localhost:3000` in your browser.

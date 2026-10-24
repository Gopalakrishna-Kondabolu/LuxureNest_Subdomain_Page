# Luxure Nest Landing Page — Development History

## 1. Project Overview

### Company Profile
- **Company Name**: Luxure Nest Commercial Real Estate Pvt. Ltd.
- **Industry**: Commercial Real Estate Advisory (Tenant Representation & Enterprise Leasing)
- **Primary Value Proposition**: Curated, verified Grade-A office spaces and flexible workspaces with end-to-end lease advisory, direct institutional landlord connections, and a strict **100% Zero Brokerage** guarantee for occupiers.

### Geographic Markets Served
1. **Gurugram (Haryana / NCR)**: DLF Cyber City, Golf Course Road, Golf Course Extension Road, Sohna Road, Udyog Vihar, and MG Road.
2. **Noida (Uttar Pradesh / NCR)**: Sector 62, Sector 16 / Film City, Noida Expressway (Sectors 125–135), Sector 142 (Advant corridor), and Sector 18.
3. **Delhi (NCT / NCR)**: Connaught Place (CBD), Barakhamba Road, Aerocity Hospitality District, Nehru Place, Saket District Centre, and Jasola.

### Core Service Offerings
- **Coworking Spaces**: Flexible open desks (hot desks), dedicated assigned desk clusters, and fully furnished private cabins for agile teams.
- **Managed Offices**: Turnkey, bespoke corporate office suites customized, branded, and operationally managed for mid-to-large enterprises.
- **Commercial Office Leasing**: Conventional bare-shell, warm-shell, and fitted office spaces in landmark institutional commercial towers.

### Landing Page Objective
The primary objective of this project is to create a high-performance, conversion-optimized commercial real estate landing-page engine. Designed specifically to capture paid search and advertising traffic across 6 distinct service/city intent segments, it delivers localized landing experiences that drive high-intent corporate inquiries directly into Luxure Nest's lead-qualification pipeline.

---

## 2. Technology Stack

### Core Frontend Stack
- **Structure**: Semantic **HTML5** (strict standards-compliant markup, native form controls, and accessible ARIA attributes).
- **Styling**: **Vanilla CSS3** (custom CSS custom properties/tokens, CSS Grid, Flexbox, media queries; strictly zero CSS frameworks).
- **Behavior & Routing**: **Vanilla JavaScript (ES6+)** (modular IIFE namespaces, modern DOM APIs, Fetch API, and zero external runtime dependencies).

### Intentionally Excluded Technologies
To guarantee sub-second page loads, zero runtime overhead, and long-term architectural maintainability, the following technologies are strictly forbidden on the frontend:
- **No JavaScript Frameworks**: No React, Next.js, Vue, Nuxt, Angular, Svelte, or Alpine.js.
- **No Legacy Libraries**: No jQuery, Zepto, or Prototype.
- **No CSS Frameworks**: No Tailwind CSS, Bootstrap, Bulma, Foundation, or Materialize.
- **No Frontend Build Steps / Transpilers**: No Webpack, Vite, Babel, Rollup, or TypeScript needed for frontend execution.
- **No External CDN Scripts or Fonts**: Zero third-party runtime script dependencies (no external font kits, polyfill CDNs, or tracking scripts embedded in the core templates).

### Development & Deployment Infrastructure
- **Development Server**: Zero-dependency Node.js HTTP server (`server.js`) built with native Node.js core modules (`http`, `fs`, `path`, `url`). Serves static files, rewrites clean path routes to `index.html`, and provides a local mock lead submission endpoint (`/api/submit-lead`).
- **Production Rewrites**: Supported via `_redirects` (Netlify, Cloudflare Pages) and `vercel.json` (Vercel) for clean URL rewrites without client-side hashes.

---

## 3. Original Project Requirements

1. **Minimal, Premium Design Aesthetic**:
   - Executive, architectural color palette: Deep brand navy (`#070D18`, `#0F1E36`), crisp light backgrounds (`#FFFFFF`, `#F8FAFC`), warm champagne gold accents (`#C5A880`, `#D4AF37`), and subtle slate borders (`#E2E8F0`).
   - System typography stack avoiding external render-blocking font downloads.
2. **Commercial Real Estate Alignment**:
   - Tailored specifically for corporate tenants, procurement teams, founders, and enterprise decision-makers.
   - Rigorous avoidance of consumer/residential real estate tropes.
3. **Configuration-Driven Shared Architecture**:
   - All 6 target subdomain routes must be powered by a single shared HTML file (`index.html`).
   - Complete dynamic text, highlights, business hubs, and SEO metadata must be driven by external configuration files without code duplication.
4. **Lead Generation Priority**:
   - The primary lead form must sit prominently in the Hero section above the fold on desktop.
   - Form must collect 10 structured fields and map them to Luxure Nest's CRM workflow.
5. **Google Sheet Destination Compatibility**:
   - Submissions must adhere to a 7-column destination schema: `[Name, Date of Site Visit, Time of Site Visit, Requirement, Company Name, Assigned To, Status]`.
   - Security rule: Private credentials (OAuth/Service Account keys) must NEVER be exposed in frontend client code.
6. **Structured Section Placeholders**:
   - The architecture required 14 defined structural sections established in Phase 1 to prepare for downstream phases (Expert Team, Amenities, Business Hubs, FAQ, Why Luxure Nest, etc.).

---

## 4. Phase 1 — Architecture

Phase 1 established the foundational file organization, configuration resolvers, routing layer, and responsive CSS token system.

### File Tree Structure
```text
LuxureNest_Subdomain_Page/
├── _redirects                  # Netlify / Cloudflare Pages clean route rewrites
├── assets/
│   ├── icons/                  # Vector UI icons (building, calendar, phone, shield, wifi)
│   ├── images/                 # Advisory team avatar placeholders & workspace graphics
│   └── logo/                   # Vector Luxure Nest brand logo (luxure-nest-logo.svg)
├── css/
│   ├── base.css                # CSS reset, typography, spacing, color tokens, accessibility
│   ├── components.css          # Buttons, badges, cards, forms, alerts, spinners
│   ├── layout.css              # Containers, grids, header, footer, hero split layout
│   └── responsive.css          # Breakpoints: Mobile (<640px), Tablet (640-1023px), Desktop
├── data/
│   ├── cities.js               # City metadata, business hubs, overview copy for Gurugram, Noida, Delhi
│   ├── micromarkets.js         # Allowlisted micro-markets registry and safe slug lookup
│   └── services.js             # Service metadata, copy templates, options for Coworking & Office
├── index.html                  # Master landing-page semantic template (all 14 sections)
├── js/
│   ├── app.js                  # Main application orchestrator & DOM ready bootstrap
│   ├── config.js               # Central resolver, fallback handler, lead payload mapper
│   ├── dynamic-content.js      # Safe DOM rendering engine (zero innerHTML injection)
│   ├── form.js                 # Complete Phase 2 single-view form UX, validation, submission
│   ├── routing.js              # Multi-mode URL route detection & attribution parser
│   └── utils.js                # Sanitization, DOM text helpers, safe query string parser
├── package.json                # Project descriptor (zero dependencies, npm start script)
├── README.md                   # Technical setup and architecture documentation
├── server.js                   # Zero-dependency Node.js dev server with /api/submit-lead
├── thank-you.html              # Standalone confirmation page with 3-step advisory timeline
└── vercel.json                 # Vercel deployment rewrite rules for clean URLs
```

### Module Responsibilities
- **`data/services.js`**: Declares copy templates, value highlights, and requirement options for `coworking` and `office`.
- **`data/cities.js`**: Declares market overviews, business hubs, and regional codes for `gurugram`, `noida`, and `delhi`.
- **`data/micromarkets.js`**: Allowlisted registry mapping micro-markets to parent cities.
- **`js/utils.js`**: DOM text insertion (`setText`), safe attribute setting (`setAttr` with `javascript:` protocol blocking), HTML character escaping (`escapeHTML`), query parameter length/character limiting (`getSafeQueryParams`), and logging.
- **`js/config.js`**: Resolves combined page configurations via `resolvePageConfig()`, merges fallback defaults when routes are invalid, and formats lead payload mapping.
- **`js/routing.js`**: Inspects `window.location.pathname`, hash `#/...`, and query strings `?service=...&city=...` to determine the active route.
- **`js/dynamic-content.js`**: Injects resolved configuration into the DOM, updates `<title>`, `<meta>`, canonical links, and delegates form initialization.
- **`js/app.js`**: Bootstraps the application on `DOMContentLoaded` and manages the development route switcher.

---

## 5. Phase 1 — Route System

The routing engine handles the 6 primary business combinations:

| Route Path | Service ID | City ID | Canonical Description |
|---|---|---|---|
| `/coworking/gurugram` | `coworking` | `gurugram` | Gurugram Flexible Coworking Spaces |
| `/coworking/noida` | `coworking` | `noida` | Noida Flexible Coworking Spaces |
| `/coworking/delhi` | `coworking` | `delhi` | Delhi Flexible Coworking Spaces |
| `/office/gurugram` | `office` | `gurugram` | Gurugram Commercial & Managed Offices |
| `/office/noida` | `office` | `noida` | Noida Commercial & Managed Offices |
| `/office/delhi` | `office` | `delhi` | Delhi Commercial & Managed Offices |

### Multi-Mode Route Detection Flow
1. **Clean Pathname Detection**: Evaluates `window.location.pathname` segments (e.g. `/coworking/noida`).
2. **Hash Path Fallback**: Evaluates `window.location.hash` (e.g. `#/office/gurugram`) for static web servers without URL rewrite modules.
3. **Query Parameter Fallback**: Evaluates `?service=coworking&city=delhi` for environments or ad platforms appending query parameters.
4. **Graceful Fallback**: If an invalid route or unsupported combination is accessed (e.g. `/retail/mumbai` or `?service=unknown`), the router automatically falls back to default **Coworking Gurugram** (`/coworking/gurugram`) and triggers a non-disruptive advisory banner (`#route-fallback-banner`).

---

## 6. Phase 1 — Design System

### Design Tokens (`css/base.css`)
- **Brand Navy & Dark Surfaces**:
  - `--color-brand-navy-dark`: `#070D18` (Header, hero backdrop, dark sections)
  - `--color-brand-navy`: `#0F1E36` (Primary brand container, buttons)
  - `--color-brand-navy-light`: `#1E2D4A` (Surface borders, secondary elements)
- **Champagne Gold Accents**:
  - `--color-accent-gold`: `#C5A880` (Primary button CTA, badges, highlights)
  - `--color-accent-gold-hover`: `#B39266` (Hover interaction states)
  - `--color-accent-gold-light`: `#F7F3EE` (Subtle badge backdrops)
- **Neutral & Text Tones**:
  - `--color-text-primary`: `#0F172A` (Headings, primary form labels)
  - `--color-text-secondary`: `#475569` (Body descriptions, subtitles)
  - `--color-text-muted`: `#94A3B8` (Form placeholders, disabled states)
  - `--color-text-inverse`: `#FFFFFF` (White text on dark containers)
- **Layout Boundaries**:
  - `--container-max-width`: `1320px`
  - `--header-height`: `88px`
  - `--container-padding`: `1.5rem` (desktop), `1.25rem` (tablet), `1rem` (mobile)

### Accessibility & Interaction Foundation
- **Skip Navigation Link**: High-visibility `.skip-link` allowing screen-reader and keyboard users to bypass headers directly to `#main-content`.
- **Keyboard Focus Outlines**: Global `:focus-visible` ring (`2px solid #C5A880`, `offset: 2px`).
- **Reduced Motion Support**: `@media (prefers-reduced-motion: reduce)` disables smooth scrolling and animations.

---

## 7. Phase 1 — Dynamic Content

Content is rendered via `LuxureNest.dynamicContent.renderPage()`:
1. **Dynamic SEO & Head Tags**: Replaces document `<title>`, `<meta name="description">`, OpenGraph title/description, and sets the canonical `<link rel="canonical">` to the active service/city path.
2. **Dynamic Hero Section**: Updates hero badge, headline, subtitle, and dynamic highlight bullet list (`✓ Verified plug-and-play flexible workspaces`, etc.).
3. **Dynamic Workspace Options Section**: Injects service cards matching the active service (Coworking: Hot Desks, Dedicated Desks, Private Cabins; Office: Managed Offices, Commercial Leasing, Enterprise Built-to-Suit).
4. **Dynamic Business Hubs Section**: Injects commercial hubs specific to the active city (e.g. DLF Cyber City for Gurugram, Sector 62 for Noida, Connaught Place for Delhi).
5. **Expert Team City Heading**: Injects the active city name into the CRE expert advisory section heading.

---

## 8. Phase 2 — Lead Form

> **CRITICAL ARCHITECTURAL REQUIREMENT**:  
> The form is a **single complete form in one view**. There are strictly **NO Step 1 / Step 2 tabs**, no requirement tabs, no "Next" / "Back" wizard steps, and no intermediate submission states.

The form sits in the Hero section (`.hero-split`), collecting all 10 fields in one clean, two-column grid layout.

### Lead Form Field Specification Table

| # | Field Name | HTML ID | Input Type | Required | Inline Validation Rule | Source Configuration | Google Sheet Mapping |
|---|---|---|---|---|---|---|---|
| 1 | Name | `lead-name` | `text` | Yes | 2–60 chars, letters, spaces, hyphens, dots | User entered | `Name` (Col 1) |
| 2 | Phone Number | `lead-phone` | `tel` | Yes | Indian 10-digit mobile `^(?:\+?91\|0)?[6-9]\d{9}$` | User entered | Preserved in lead record |
| 3 | Work Email | `lead-email` | `email` | Yes | Standard RFC email regex `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` | User entered | Preserved in lead record |
| 4 | Company Name | `lead-company` | `text` | Yes | Minimum 2 characters | User entered | `Company Name` (Col 5) |
| 5 | Service | `lead-service` | `<select>` | Yes | Non-empty selection | `services.js` (`formRequirementOptions`) | `Requirement` (Col 4) |
| 6 | Team Size | `lead-teamsize` | `number` | Yes | Positive integer >= 1 (no zero, decimals, negative) | User entered | Preserved in lead record |
| 7 | Decision Maker | `lead-decision-maker` | `<select>` | Yes | Strictly `Yes` or `No` | Allowlisted options: `['Yes', 'No']` | Preserved in lead record |
| 8 | Preferred Micro-Market | `lead-micromarket` | `<select>` | Yes | Non-empty selection | `micromarkets.js` (`getForCity(cityId)`) | Preserved in lead record |
| 9 | Date of Site Visit | `lead-visit-date` | `date` | Yes | ISO `YYYY-MM-DD`, must be today or future date | User entered (`min` attribute enforced) | `Date of Site Visit` (Col 2) |
| 10 | Time of Site Visit | `lead-visit-time` | `<select>` | Yes | Non-empty selection | `config.js` (`VISIT_TIME_SLOTS`) | `Time of Site Visit` (Col 3) |

---

## 9. Decision Maker Requirement

The **Are you a Decision Maker?** field was established with strict constraints:
- **Element Type**: Native HTML `<select>` dropdown.
- **Allowed Options**: Strictly and exclusively:
  ```html
  <option value="" disabled selected>Select an option</option>
  <option value="Yes">Yes</option>
  <option value="No">No</option>
  ```
- **Validation**: Rejects any value other than `"Yes"` or `"No"`.

---

## 10. Form Submission Flow

```text
User fills 10 fields in single-view form
       ↓
User clicks "Schedule Workspace Tour"
       ↓
isSubmitting check (Prevents duplicate clicks)
       ↓
Client-side Validation (All 10 fields validated in DOM order)
       ├─ [Invalid] → Focus first invalid field, display inline error, halt.
       └─ [Valid]   → Continue
       ↓
Button enters Loading State (Disabled, spinner, text: "Submitting Inquiry...")
       ↓
Payload Construction:
  - 7 Google Sheet columns mapped via mapLeadPayload()
  - Complete lead record preserved (phone, email, team size, attribution, etc.)
       ↓
Dispatch to submissionService.submitLead(payload)
  - POST to /api/submit-lead (or local dev preview fallback)
       ├─ [Server Failure / Network Offline]
       │    └─ Show alert banner, restore CTA button, PRESERVE all entered form data.
       │
       └─ [Confirmed Success (200 OK & success: true)]
            └─ Redirect to /thank-you (or thank-you.html in static environments).
```

---

## 11. Google Sheet Architecture

### Target Destination Schema (7 Columns)
The destination Google Sheet schema defines exactly 7 columns in the following order:
1. `Name`
2. `Date of Site Visit`
3. `Time of Site Visit`
4. `Requirement`
5. `Company Name`
6. `Assigned To`
7. `Status`

### Data Mapping Implementation (`js/config.js`)
```javascript
const googleSheetRow = {
  'Name': formData.fullName,
  'Date of Site Visit': formData.dateOfSiteVisit,
  'Time of Site Visit': formData.timeOfSiteVisit,
  'Requirement': formData.service,
  'Company Name': formData.companyName,
  'Assigned To': '',          // Default: managed by internal CRM workflow
  'Status': 'New Lead'        // Default: internal initial status
};
```

### Complete Lead Record Preservation
To prevent commercial data loss, all additional fields collected by the frontend are packaged into the `completeLeadRecord` object alongside `googleSheetRow`:
- `phone`: User's direct telephone contact
- `workEmail`: User's business email address
- `teamSize`: Required seat/desk capacity
- `isDecisionMaker`: Key qualification indicator (`Yes` / `No`)
- `preferredMicroMarket`: Specific localized micro-market
- `city`: Contextual target city
- `landingMicroMarket`: Advertising micro-market from `?loc=` (if present)
- `attribution`: Marketing parameters (`utm_source`, `utm_medium`, `utm_campaign`, etc.)
- `submittedAt`: ISO 8601 timestamp

### Credential Protection & Security Status
- **Zero Client Credential Exposure**: There are no Google Cloud Service Account JSON keys, private keys, client secrets, or OAuth tokens embedded anywhere in the frontend files.
- **Operational Status**: **Integration-ready / Architecturally prepared**. The frontend submission engine is wired to dispatch to `/api/submit-lead`. A production Google Apps Script Webhook or serverless API route is scheduled for Phase 3 deployment.

---

## 12. Assets

### Available Assets
- **Logo**: Vector SVG logo (`assets/logo/luxure-nest-logo.svg`) updated with the actual Luxure Nest brand emblem and typography.
- **Icons**: Clean inline/linked SVG icons in `assets/icons/`:
  - `phone.svg`: Header contact icon
  - `shield.svg`: Privacy and zero-brokerage trust badges
  - `wifi.svg`: High-speed internet amenity icon
  - `building.svg`: Commercial tower amenity icon
  - `calendar.svg`: Inspection tour schedule icon
- **Team Avatars**: Minimalist SVG circular placeholders in `assets/images/`:
  - `team-avatar-1.svg`
  - `team-avatar-2.svg`
  - `team-avatar-3.svg`
- **Workspace Imagery**: Clean SVG architectural placeholder (`assets/images/workspace-placeholder.svg`).

### Real vs. Placeholder Distinction
- **Real Asset**: Luxure Nest official vector brand logo (`luxure-nest-logo.svg`).
- **Real Asset**: UI interface icons (`phone.svg`, `shield.svg`, etc.).
- **Placeholder**: Team member avatars (represented by abstract vector portraits).
- **Placeholder**: Workspace photography (represented by vector architectural placeholders).

---

## 13. Deployment

### Local Development Server (`server.js`)
- Runs via `node server.js` on port 3000 (configurable via `PORT` environment variable).
- Built strictly with Node.js standard built-in modules (`http`, `fs`, `path`, `url`).
- Handles static asset resolution, MIME typing, clean route rewrites, and mocks `POST /api/submit-lead`.

### Production Deployment Configurations
1. **Netlify / Cloudflare Pages (`_redirects`)**:
   ```text
   /coworking/*    /index.html   200
   /office/*       /index.html   200
   /thank-you      /thank-you.html 200
   ```
2. **Vercel (`vercel.json`)**:
   ```json
   {
     "rewrites": [
       { "source": "/coworking/:city*", "destination": "/index.html" },
       { "source": "/office/:city*", "destination": "/index.html" },
       { "source": "/thank-you", "destination": "/thank-you.html" }
     ]
   }
   ```

---

## 14. Testing Completed

| Test Category | Target Scenarios Tested | Result |
|---|---|---|
| **Route Testing** | Direct navigation to all 6 clean routes (`/coworking/gurugram`, `/coworking/noida`, `/coworking/delhi`, `/office/gurugram`, `/office/noida`, `/office/delhi`) | Pass |
| **Fallback Testing** | Navigating to `/unknown/route` and `?service=invalid&city=fake` | Pass (Falls back to Coworking Gurugram with notice banner) |
| **Attribution Testing** | Navigating with `?loc=cyber-city&utm_source=google_ads` | Pass (Attribution captured, separated from form field) |
| **Security Injection Testing** | Tested `?loc=<script>alert(1)</script>` | Pass (Sanitized to slug, allowlist returned null, zero XSS) |
| **Decision Maker Testing** | Inspected `<select>` DOM options | Pass (Exclusively contains `Yes` and `No`) |
| **Submission Flow Testing** | Complete valid submission on local development server | Pass (Dispatched payload, verified 200 OK, redirected to `/thank-you`) |
| **Visual Inspection** | Verified brand logo sizing in header (68px) and footer (76px) | Pass (Crisp, properly aligned, no distortion) |

---

## 15. Current Project Status

| Area | Status | Notes |
|---|---|---|
| **Technology Stack** | **Complete** | 100% HTML5, CSS3, Vanilla ES6+. Zero unauthorized packages. |
| **Architecture** | **Complete** | Modular IIFE structure, shared single-file template, separation of concerns. |
| **Routing** | **Complete** | Path, hash, and query routing operational with clean rewrites. |
| **Dynamic Content** | **Complete** | Dynamic titles, meta, badges, copy, options, and hubs operational. |
| **Design System** | **Complete** | Executive navy & gold tokens, responsive grids, accessible typography. |
| **Lead Form UX** | **Complete** | Single-view continuous form, exactly 10 fields, no tabs/steps. |
| **Validation** | **Complete** | Inline accessible validation, live clearing, non-destructive. |
| **Google Sheet** | **Integration-Ready** | Payload mapping complete; production webhook endpoint pending deployment. |
| **Thank You Page** | **Complete** | Semantic HTML5 page, timeline steps, noindex robot directive. |
| **Responsive Design**| **Complete** | Verified across mobile (375px), tablet (768px), and desktop (1280px+). |
| **Security** | **Complete** | Zero `innerHTML`, zero client credential exposure, safe query sanitization. |
| **Performance** | **Complete** | Lightweight zero-dependency codebase, system fonts, fast asset delivery. |

---

## 16. Known Limitations

1. **Google Sheet Webhook Endpoint**: The production Google Apps Script Web App / Webhook URL has not yet been deployed; submissions currently communicate with the local Node development server (`/api/submit-lead`) or local dev simulation.
2. **Advisory Team Photography**: The Expert/Team section currently utilizes SVG placeholder avatars rather than real photographs of Luxure Nest commercial advisors.
3. **Workspace Photography**: The property cards currently use clean SVG geometric placeholders rather than real high-resolution interior property photography.
4. **Network of Brands Section**: The operator logo showcase (WeWork, Awfis, Smartworks, etc.) is planned for Phase 3 and is not yet in the DOM.
5. **Legal & Compliance Modals**: Dedicated Privacy Policy and Terms of Service full-text modals/pages have not yet been authored.

---

## 17. Pending Work

### Required (Phase 3 Core Deliverables)
- [ ] Connect production Google Sheet Webhook / Apps Script endpoint.
- [ ] Incorporate high-resolution commercial workspace photography.
- [ ] Incorporate authentic team advisor photographs in the Expert section.
- [ ] Implement the "Network of Brands" operator showcase section.
- [ ] Author full-text Privacy Policy and Terms of Service pages/modals.

### Optional / Enhancements
- [ ] Add lightweight client-side micro-interactions (subtle scroll reveals via pure CSS).
- [ ] Integrate Google Ads conversion tag firing hook inside `trackingBridge.logEvent()`.
- [ ] Implement an optional WhatsApp direct-chat advisory click-to-chat CTA.

---

## 18. Development Timeline

1. **Project Foundation**:
   - Established zero-framework mandate (HTML5, CSS3, Vanilla JS ES6+).
   - Designed executive commercial real estate design system and token architecture (`css/base.css`, `css/layout.css`).
2. **Phase 1 Architecture**:
   - Created configuration registries for 2 services (`coworking`, `office`), 3 cities (`gurugram`, `noida`, `delhi`), and allowlisted micro-markets.
   - Built multi-mode routing engine (`js/routing.js`), dynamic content engine (`js/dynamic-content.js`), and safe DOM utilities (`js/utils.js`).
   - Skeletons established for all 14 semantic sections in `index.html`.
   - Built zero-dependency Node.js dev server (`server.js`) and deployment rewrite files (`_redirects`, `vercel.json`).
3. **Phase 2 Lead Form UX & Refinement**:
   - Replaced multi-step tabs with a **single-view continuous lead form** (no Step 1 / Step 2 tabs).
   - Implemented exact 10-field sequence, `<select>` Service dropdown, Team Size number input, and strict `Yes` / `No` Decision Maker dropdown.
   - Integrated client-side inline validation, duplicate submission lock, and Google Sheet payload mapper.
   - Built standalone confirmation page (`thank-you.html`).
4. **Layout & Brand Visual Polish**:
   - Expanded hero form width (`.hero-split` updated to `0.95fr 1.25fr`, container max-width to `1320px`).
   - Replaced temporary logo mark with official Luxure Nest brand logo (`luxure-nest-logo.svg`), scaling header logo to `68px` and footer logo to `76px`.
   - Resolved local static server preview handling in `form.js` to ensure reliable testing.

---

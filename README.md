# Luxure Nest — Commercial Real Estate & Workspace Subdomain Engine

A high-performance, conversion-engineered landing page architecture for **Luxure Nest**, delivering verified Grade-A commercial offices, enterprise managed suites, and flexible coworking spaces across Delhi NCR with a strict **100% Zero Brokerage** guarantee.

Built with **pure HTML5, Vanilla CSS3, and ES6+ JavaScript** (zero external framework dependencies) to ensure lightning-fast load times, maximum SEO indexability, and clean URL routing across all 6 core business combinations.

---

## 📑 Quick Navigation & Reference Guides

Before deploying or integrating, please refer to these dedicated technical guides in the codebase:

- **🚀 For Deployment & Custom Domains**: Read [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md)
  > Complete walkthrough on deploying to Vercel, Netlify, cPanel/Hostinger, or Node.js, removing dev tools, and pointing your custom domain name with SSL.
- **📊 For Google Sheet Integration**: Read [`google-apps-script/SETUP_GUIDE.md`](./google-apps-script/SETUP_GUIDE.md)
  > Step-by-step instructions for deploying [`google-apps-script/Code.gs`](./google-apps-script/Code.gs) as a Web App to record incoming leads into your Google Sheet.


---

## 🌟 What We Built & Implemented

### 1. Route-Driven Dynamic Architecture (6 URLs from 1 Core Engine)
Instead of creating and maintaining 6 duplicate HTML pages, a single dynamic file ([`index.html`](./index.html)) intelligently resolves and adapts its content based on the clean URL:

| Target Production URL | Service Type | Location | Dynamic Landmark & Local Hubs |
|---|---|---|---|
| `https://yourdomain.com/coworking/gurugram` | Coworking | Gurugram | DLF Cyber City Rapid Metro skyline |
| `https://yourdomain.com/coworking/noida` | Coworking | Noida | Noida Expressway modern architectural skyline |
| `https://yourdomain.com/coworking/delhi` | Coworking | Delhi | Iconic India Gate monument |
| `https://yourdomain.com/office/gurugram` | Managed Office | Gurugram | Enterprise suites & Cyber City / Golf Course Road |
| `https://yourdomain.com/office/noida` | Managed Office | Noida | Modern corporate towers & IT park hubs |
| `https://yourdomain.com/office/delhi` | Managed Office | Delhi | Central Business District & diplomatic enclaves |

### 2. High-Converting Landing Page Sections
- **Dynamic Hero Section**: Dynamic headline (`Delivering best {service} in {location} according to your requirements`), key bullet points (Zero Brokerage, Metro/Airport Connectivity, Whole NCR coverage), and route-aware high-resolution architectural background.
- **Conversion-Optimized Lead Form**: 10 essential fields in a single clean view (no confusing tabs or multi-step friction). Strict validation for Indian phone numbers, work emails, team sizes, decision-maker status (`Yes`/`No`), and dynamic micro-markets based on the active city.
- **Amenities Showcase**: Comprehensive flex workspace amenities (Conference Suites, Private Phone Booths, Reception & Mail Handling, High-Speed Internet, 24/7 Access & Security, Housekeeping, Pantry, Networking Events) with custom theme CTA buttons.
- **Our Network of Brands**: Displays 10 premier flexible workspace operators (WeWork, Awfis, Smartworks, Innov8, IndiQube, CoWrks, Table Space, Executive Centre, Spaces, India Accelerator) with custom theme-bronze interactive arrows (`#8C6D3F`).
- **Advisory Team Showcase**: 7 individual overlapping circular avatars (using modular image placeholders `member-1.jpg`–`member-7.jpg` in [`assets/images/team/`](./assets/images/team/)) with hover effects and centered experience caption.
- **Sleek CTA Ribbon Bar ("Ready to Inspect")**: Deep luxury navy bar with champagne gold borders, elegant serif typography (`Playfair Display`), and uppercase action link (`REQUEST A CALLBACK ↗`).
- **Key Commercial Hubs**: Features authentic exterior architectural photography across all 18 NCR micro-markets (Barakhamba Road, Aerocity, Saket District Centre, Jasola, Expressway 125, Sector 135, Sector 142, DLF Cyber City, Golf Course Road, etc.) with zero image repetition.
- **Why Luxure Nest**: 4-point comparison breakdown with theme-colored numbers (`01`–`04`), bronze slash (`/`), city-specific landmark photography, and a dark navy zero-brokerage promise badge with champagne gold accents.
- **How It Works**: 5-step transparent advisory process (Share Requirements &rarr; Personalized Consultancy &rarr; Site Visit &rarr; Commercial Negotiation &rarr; Notary/Move-in Support) with theme-colored support links.
- **Post-Process CTA Banner**: Bottom conversion banner directing visitors smoothly back to the lead form.

---

## 📊 Google Sheet Integration

Lead submissions are connected directly to your Google Sheet without requiring third-party subscription tools (Zapier/Make).

- **Webhook Script**: [`google-apps-script/Code.gs`](./google-apps-script/Code.gs) handles incoming POST requests, applies `LockService` concurrency protection, auto-initializes headers if the sheet is blank, and maps fields into columns.
- **Active Web App Endpoint**: Configured in [`js/config.js`](./js/config.js#L29) (`SUBMISSION_ENDPOINT`).
- **CORS & Resilience**: [`js/form.js`](./js/form.js) uses `text/plain;charset=utf-8` to eliminate browser CORS preflight errors.
- **Headers Supported**:
  1. `Name`
  2. `Phone Number`
  3. `Work Email`
  4. `Company Name`
  5. `Requirement`
  6. `Team Size`
  7. `Decision Maker`
  8. `Preferred Micro-Market`
  9. `Date of Site Visit`
  10. `Time of Visit`
  11. `Assigned To`
  12. `Status`
  

> 📘 **To set up or re-deploy the Google Sheet script**, follow the step-by-step instructions in [`google-apps-script/SETUP_GUIDE.md`](./google-apps-script/SETUP_GUIDE.md).

---

## 🚀 Deployment Guide Summary

The project is pre-configured with URL rewrite rules for all major hosting platforms:

| Hosting Platform | Rewrite Config File Used | Status |
|---|---|---|
| **Vercel** | [`vercel.json`](./vercel.json) | Included & configured |
| **Netlify / Cloudflare Pages** | [`_redirects`](./_redirects) | Included & configured |
| **Hostinger / cPanel / Apache** | [`.htaccess`](./.htaccess) | Included & configured (forces HTTPS & clean URLs) |
| **Node.js / VPS / Docker** | [`server.js`](./server.js) | Zero-dependency HTTP server with clean routing |

### 🛠️ Pre-Deployment Checklist (What to Remove / Change)
1. **Remove Route Switcher**: In [`index.html`](./index.html#L45-L59), remove lines 45–59 (`<aside class="route-inspector-bar">...<aside>`).
2. **Verify Submission Endpoint**: Confirm `SUBMISSION_ENDPOINT` in [`js/config.js`](./js/config.js#L29) points to your Google Apps Script Web App URL.
3. **Update Sales Phone Number**: Replace placeholder `+91 98765 43210` in [`index.html`](./index.html) with your actual company phone number.
4. **Point Your Custom Domain**: Follow the DNS configuration steps in [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) to set your A and CNAME records.

---

## 📁 Codebase Directory Structure

```text
LuxureNest_Subdomain_Page/
├── .htaccess                     # Apache / cPanel / Hostinger clean URL rewrites & HTTPS
├── _redirects                    # Netlify & Cloudflare Pages clean URL rewrites
├── vercel.json                   # Vercel clean URL rewrite configuration
├── DEPLOYMENT_GUIDE.md           # Complete production deployment & domain setup guide
├── README.md                     # Project overview and navigation hub
├── package.json                  # Project manifest
├── server.js                     # Zero-dependency local development & Node.js server
├── index.html                    # Master dynamic landing page template
├── thank-you.html                # Post-submission confirmation page
│
├── assets/                       # Visual assets, icons, logos, and photography
│   ├── icons/                    # SVG feature and utility icons
│   ├── images/                   # Micro-market buildings, landmarks & team photos
│   │   ├── generated/            # Exterior commercial building photography
│   │   ├── landmarks/            # India Gate, Cyber City, and Noida Expressway
│   │   └── team/                 # Individual team member portrait headshots (member-1..7)
│   └── logo/                     # Brand vector logos
│
├── css/                          # Modular Vanilla CSS Architecture
│   ├── base.css                  # Design tokens, color palette, typography & reset
│   ├── layout.css                # Grid systems, containers, and structural rules
│   ├── components.css            # Buttons, cards, form controls, ribbon bars & badges
│   └── responsive.css            # Media queries for tablet and mobile viewports
│
├── data/                         # Pure JavaScript Configuration Registries
│   ├── services.js               # Coworking vs Managed Office content & options
│   ├── cities.js                 # Gurugram, Noida, and Delhi city configurations
│   ├── micromarkets.js           # 18 NCR commercial business micro-markets
│   └── images.js                 # Dynamic image resolution registry
│
├── google-apps-script/           # Google Sheet Webhook Integration
│   ├── Code.gs                   # Apps Script code to paste into Google Sheet
│   └── SETUP_GUIDE.md            # Step-by-step Apps Script deployment instructions
│
└── js/                           # Application Logic (Vanilla ES6+)
    ├── app.js                    # Application lifecycle bootstrapper & smooth scroll
    ├── config.js                 # Central config resolver & submission endpoint
    ├── dynamic-content.js        # DOM injection engine (DOM safe, no innerHTML injection)
    ├── form.js                   # Lead validation, state locks & sheet dispatcher
    ├── routing.js                # URL pathname, hash, and query parameter resolver
    └── utils.js                  # Formatting, phone sanitizer & attribution parsers
```

---

## 💻 Running Locally

### Option 1: Using the Built-in Node Server
```bash
node server.js
```
Open [http://localhost:3000](http://localhost:3000) in your browser. All clean routes (e.g. `http://localhost:3000/coworking/delhi`) will resolve automatically.

### Option 2: Using Any Static Dev Server (e.g., Live Server / Python)
```bash
python -m http.server 5500
```
Open `http://localhost:5500/?service=coworking&city=gurugram` to preview any route.

---

## 🔒 Security & Privacy Standards
- **Zero Client Credential Exposure**: No Google Cloud Service Account JSON keys or private secrets are exposed to the browser.
- **DOM Injection Safety**: Uses textContent and verified DOM nodes exclusively (`utils.setText`), preventing script or HTML injection from query parameters.
- **Lead Data Protection**: Submissions are transmitted directly to your secure Google Apps Script webhook over HTTPS.

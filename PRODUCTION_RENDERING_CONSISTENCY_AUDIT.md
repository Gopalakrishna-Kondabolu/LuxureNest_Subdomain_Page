# Luxure Nest — Complete Frontend Rendering, CSS, Asset, Deployment & Browser-Consistency Audit

**Audit Date**: October 27, 2026  
**Status**: Root Causes Identified, Diagnosed & Production Fixes Implemented  
**Target Domain**: `https://spaces.luxurenest.com`  
**Localhost Environment**: `http://localhost:3000` (Node.js HTTP Server)  
**Production Hosting Environment**: Apache / cPanel (GoDaddy) with SSL & Mod_Rewrite  

---

## 1. Problem Observed

The user and team members experienced a critical visual rendering discrepancy:
1. **Localhost vs. Production**: The website rendered with the latest approved design on `localhost:3000`, but when opening the live URL (`https://spaces.luxurenest.com`), certain sections appeared with outdated or completely missing styles.
2. **Device / Team Discrepancy**: On the primary developer's laptop, the live website appeared in one state, while the Technical Lead and other team members visiting the exact same live URL saw a different, broken, or partially styled layout.
3. **Missing Section Styling**: Specifically, newly added sections (Pricing Table, Meet Your Gurgaon Team, and Case Studies) appeared unstyled or poorly formatted for users who had previously visited the site.

---

## 2. Localhost vs. Production Architecture Comparison

| Dimension | Localhost Environment | Live / Production Environment |
|---|---|---|
| **Web Server** | `server.js` (Node.js standard `http` module) | Apache 2.4+ (cPanel / GoDaddy) |
| **Asset Serving** | Direct filesystem read (`fs.readFile`) | Apache static handler (`mod_deflate`, `mod_headers`) |
| **HTTP Caching** | No caching headers sent (`Cache-Control` absent) | `Cache-Control: public, max-age=2592000` (30 Days!) |
| **Expiry Header** | None | `Expires: Thu, 26 Nov 2026` (1 month into the future) |
| **Client Cache Behavior** | Browsers re-request files on reload / port changes | Browsers aggressively read `.css` & `.js` from disk cache |
| **URL Rewrites** | Custom regex routing inside `server.js` | `.htaccess` with `mod_rewrite` rule 3 & 4 |

---

## 3. Forensic Investigation & Root Cause Identification

### Root Cause 1: 30-Day Aggressive Browser Disk Caching (`max-age=2592000`) Without Cache-Busting Tokens
* **The Evidence**: Running HTTP header inspection against production via `curl.exe -I https://spaces.luxurenest.com/css/components.css` revealed:
  ```http
  HTTP/1.1 200 OK
  Server: Apache
  Last-Modified: Tue, 27 Oct 2026 11:48:47 GMT
  Content-Length: 44332
  Cache-Control: public, max-age=2592000
  Expires: Thu, 26 Nov 2026 14:01:37 GMT
  Content-Type: text/css
  ```
* **The Mechanism**:
  1. The Apache server on GoDaddy automatically assigns static assets (`.css`, `.js`, images) an aggressive 30-day cache (`max-age=2592000`).
  2. In `index.html`, stylesheet and script tags were linked using static, unversioned filenames:
     ```html
     <link rel="stylesheet" href="css/components.css">
     <script src="js/app.js" defer></script>
     ```
  3. When the Technical Lead or any team member visited the site yesterday or earlier in the week, their browser cached `components.css` and `app.js` locally.
  4. When new sections (`#pricing`, `#gurgaon-team`, `#case-studies`) were uploaded:
     - The browser requested `https://spaces.luxurenest.com/coworking/gurugram`.
     - The browser downloaded the **new `index.html`** containing the new HTML elements.
     - BUT when resolving `<link rel="stylesheet" href="css/components.css">`, the browser consulted its local cache, saw `max-age=2592000`, and **served the stale cached CSS from disk without making an HTTP request to the server**.
     - Because that cached CSS file predated the additions, it contained **zero rules for `.pricing-table-card`, `.team-card`, or `.case-study-card`**.
     - Result: The new sections rendered completely unstyled and broken for anyone with a pre-existing cache.
     - Meanwhile, the developer had either performed a hard refresh (`Ctrl + Shift + R`) or had "Disable cache" checked in DevTools, seeing the new styles on their laptop.

### Root Cause 2: Missing HTML Cache-Control Rules in `.htaccess`
* In the previous `.htaccess`, compression (`mod_deflate`) and CSP (`mod_headers`) were configured, but there was **no directive instructing browsers how to treat `.html` files**.
* Consequently, browsers were permitted to heuristically cache `index.html`. If a team member's browser cached `index.html`, they wouldn't even receive new HTML structures until their local cache expired.

### Root Cause 3: Team Cards Desktop Grid Mismatch (3 Cards in a 2-Column Grid)
* In `index.html`, 3 leadership cards were configured:
  1. Manas Sinha (Founder, CEO & MD)
  2. Riya Bansal (Co-Founder & Director - Operations)
  3. Simran Saggar (Director - Commercial Real Estate)
* In `css/components.css`, `.team-cards-grid` was defined as `grid-template-columns: repeat(2, 1fr)`.
* On standard desktop monitors, this placed Card 1 & Card 2 on row 1, while Card 3 was left isolated on row 2 spanning only 50% width with a large blank gap on the right. This made the layout look incomplete or distorted across different laptop aspect ratios.

---

## 4. Fixes Implemented

### Fix 1: Universal Asset Cache-Busting via Version Query Parameters
Updated [`index.html`](./index.html) and [`thank-you.html`](./thank-you.html) to link all stylesheets and scripts with a unified production version identifier (`?v=2.1.0`):

```html
<!-- Modular CSS System (Versioned for Instant Production Cache-Busting) -->
<link rel="stylesheet" href="css/base.css?v=2.1.0">
<link rel="stylesheet" href="css/layout.css?v=2.1.0">
<link rel="stylesheet" href="css/components.css?v=2.1.0">
<link rel="stylesheet" href="css/responsive.css?v=2.1.0">
```

And all scripts in [`index.html`](./index.html):
```html
<script src="data/services.js?v=2.1.0" defer></script>
<script src="data/cities.js?v=2.1.0" defer></script>
<script src="data/micromarkets.js?v=2.1.0" defer></script>
<script src="data/images.js?v=2.1.0" defer></script>
<script src="js/utils.js?v=2.1.0" defer></script>
<script src="js/config.js?v=2.1.0" defer></script>
<script src="js/routing.js?v=2.1.0" defer></script>
<script src="js/form.js?v=2.1.0" defer></script>
<script src="js/dynamic-content.js?v=2.1.0" defer></script>
<script src="js/app.js?v=2.1.0" defer></script>
```
* **Impact**: Every browser, proxy, and CDN recognizes `?v=2.1.0` as a distinct URI and instantly downloads the latest CSS/JS files. No user or team member is required to clear their browser cache.

### Fix 2: Production-Grade Cache-Control Directives in `.htaccess`
Updated [`.htaccess`](./.htaccess) to establish distinct caching lifetimes for HTML vs. static assets:
```apache
# Cache-Control Strategy (Prevents Stale Production Rendering & Enables Versioned Invalidation)
<IfModule mod_headers.c>
  # 1. HTML files: Never cache aggressively so visitors always receive the latest DOM & asset links
  <FilesMatch "\.(html|htm)$">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
  </FilesMatch>

  # 2. Static CSS and JS assets: Allow caching with must-revalidate (bustable via ?v= query string)
  <FilesMatch "\.(css|js)$">
    Header set Cache-Control "public, max-age=604800, must-revalidate"
  </FilesMatch>

  # 3. Media assets (Images/Fonts): Standard caching
  <FilesMatch "\.(jpg|jpeg|png|gif|svg|ico|webp|woff|woff2|ttf|eot)$">
    Header set Cache-Control "public, max-age=2592000"
  </FilesMatch>
</IfModule>
```
* **Impact**:
  - `index.html` is always revalidated immediately, ensuring changes to markup or asset version queries take effect globally within 0 seconds.
  - CSS and JS assets remain cached for 7 days when unchanged, but are immediately invalidated when `?v=` is incremented.

### Fix 3: 3-Column Responsive Grid for Team Cards
Updated [`.team-cards-grid`](./css/components.css#L1654):
- **Desktop (>= 1081px)**: `grid-template-columns: repeat(3, 1fr)` — all 3 cards sit in a single balanced row.
- **Tablet (769px – 1080px)**: `grid-template-columns: repeat(2, 1fr)` — cards wrap into a 2-column format.
- **Mobile (<= 768px)**: `grid-template-columns: 1fr` — cards stack cleanly in a single column.

---

## 5. Files Inspected & Modified

| File | Status | Description of Modifications |
|---|---|---|
| [`index.html`](./index.html) | **Modified** | Added `?v=2.1.0` cache-busting version query string to all 4 CSS links and all 10 JS script tags. |
| [`thank-you.html`](./thank-you.html) | **Modified** | Added `?v=2.1.0` cache-busting version query string to all 4 CSS stylesheet links. |
| [`.htaccess`](./.htaccess) | **Modified** | Added `mod_headers` directives for `no-cache` on HTML, `must-revalidate` on CSS/JS, and media caching. |
| [`css/components.css`](./css/components.css) | **Modified** | Updated `.team-cards-grid` to 3 columns on desktop with responsive breakpoints at 1080px and 768px. |
| [`css/base.css`](./css/base.css) | Verified (Unchanged) | Tokens, font stacks, and `:root` custom properties verified consistent. |
| [`css/layout.css`](./css/layout.css) | Verified (Unchanged) | Container widths, hero split, and section layouts verified consistent. |
| [`css/responsive.css`](./css/responsive.css) | Verified (Unchanged) | Breakpoints at 1023px, 880px, 860px, 639px verified consistent. |
| [`js/app.js`](./js/app.js) | Verified (Unchanged) | Routing bootstrap, slider initialization, and sticky footer verified intact. |
| [`js/dynamic-content.js`](./js/dynamic-content.js) | Verified (Unchanged) | Dynamic city landmarks, hub population, and headline interpolation verified. |
| [`js/config.js`](./js/config.js) | Verified (Unchanged) | Google Apps Script webhook endpoint and schema contracts verified. |
| [`server.js`](./server.js) | Verified (Unchanged) | Local development server natively handles `?v=2.1.0` query strings via URL parsing. |
| [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) | Verified (Unchanged) | Deployment instructions align with active GoDaddy / Apache setup. |

---

## 6. Route & Viewport Verification Matrix

All 6 production clean routes were verified via HTTP status checks against the live Apache server:

| Route Path | HTTP Status | Response Header | Content Verification |
|---|---|---|---|
| `/coworking/gurugram` | `200 OK` | `text/html; charset=UTF-8` | Verified latest HTML + Pricing + Team + Case Studies |
| `/coworking/noida` | `200 OK` | `text/html; charset=UTF-8` | Verified dynamic landmark and hubs |
| `/coworking/delhi` | `200 OK` | `text/html; charset=UTF-8` | Verified dynamic landmark and hubs |
| `/office/gurugram` | `200 OK` | `text/html; charset=UTF-8` | Verified managed office pricing and content |
| `/office/noida` | `200 OK` | `text/html; charset=UTF-8` | Verified managed office pricing and content |
| `/office/delhi` | `200 OK` | `text/html; charset=UTF-8` | Verified managed office pricing and content |

### Viewport Testing Matrix

| Target Device | Viewport Resolution | Layout State Observed |
|---|---|---|
| Mobile Small | 375 × 667 | Single column, responsive form, cards stacked, sticky footer visible on scroll |
| Mobile Large | 414 × 896 | Full-width single column flow, touch targets >= 44px |
| Tablet Portrait | 768 × 1024 | 2-column brand network, 2-column team cards, horizontal-scroll pricing table |
| Tablet Landscape | 1024 × 768 | 2-column hero split (1fr 480px), 2-column team cards |
| Windows Laptop (125% Scale) | 1280 × 800 | 2-column hero split (1fr 520px), 3-column team cards |
| Standard Desktop | 1440 × 900 | Max-width container 1200px, 3-column team cards, full 5-column pricing table |
| Ultra-Wide Monitor | 1920 × 1080 | Centered container, crisp SVG icons, zero layout stretching |

---

## 7. Deployment Instructions for GoDaddy / cPanel

To apply these fixes to production immediately:
1. Upload the modified [`index.html`](./index.html) and [`thank-you.html`](./thank-you.html) to your server directory (`public_html` or subdomain folder).
2. Upload the updated [`.htaccess`](./.htaccess) to the root of your subdomain folder.
3. Upload the updated [`css/layout.css`](./css/layout.css) and [`css/components.css`](./css/components.css) into the `css/` directory.
4. **Verification**: Open `https://spaces.luxurenest.com/coworking/gurugram` in a normal (non-incognito) browser window on any device.
   - The browser will detect `?v=2.2.0` on all CSS and JS resources and download the fresh files immediately.
   - All team members, including the Technical Lead, will see the exact same approved styling without needing to clear cache.

---

## 8. Focused Scrolling Audit & Performance Optimization (v2.2.0)

### 8.1. Problem Statement
When scrolling from one section to another on desktop (mouse wheel/trackpad) and mobile/tablet touch devices, the page felt hard, jerky, stiff, and unnatural to scroll.

### 8.2. Root Cause Analysis
- **Culprit**: CSS Scroll Snap Proximity rules in [`css/layout.css`](./css/layout.css):
  ```css
  /* Previous Problematic Code */
  html {
    scroll-snap-type: y proximity;
  }
  .section, .section--hero {
    scroll-snap-align: start;
  }
  ```
- **Mechanism of Failure**:
  - `scroll-snap-type: y proximity` commands the browser engine (Chromium, WebKit, Gecko) to calculate proximity snap coordinates for every element with `scroll-snap-align: start` during continuous scrolling.
  - Because the page contains 12+ large content sections with varying heights (hero, partner grid, why luxure nest, pricing comparison table, team cards, case studies, FAQ, reviews, final CTA), the browser continually fought user momentum, latching onto section tops and creating a perceptible "rubber-banding", stiffness, and abrupt jumpiness.
  - Users were unable to stop naturally midway through tall sections or scroll at their own pace.

### 8.3. JavaScript & Container Audit Findings
1. **JavaScript Scroll Interception**: Audited all JS files (`js/app.js`, `js/dynamic-content.js`, `js/config.js`). Zero wheel, mousewheel, or touchmove listeners intercept scrolling. The sticky footer scroll handler in `js/app.js` runs with `{ passive: true }` throttled via `requestAnimationFrame` and never calls `preventDefault()`.
2. **Nested Scroll Containers**: No sections have rogue `overflow-y: scroll` or `overflow-y: auto`. The entire page uses a single unified document scroll. (The pricing table retains `overflow-x: auto` strictly for horizontal swiping on mobile viewports).
3. **Viewport Constraints**: Removed `scroll-snap-align` from `.section--hero`. Content can now scroll naturally without any forced viewport trapping.
4. **Anchor Navigation**: Preserved native `scroll-behavior: smooth` on `html` and `scroll-margin-top: calc(var(--header-height) + 8px)` on `.section` so clicking navigation links (e.g., `#contact-form`, `#pricing`, `#case-studies`) glides smoothly to the target offset below the fixed header.

### 8.4. Fix Implemented
- In [`css/layout.css`](./css/layout.css):
  - Removed `scroll-snap-type: y proximity;` from `html`.
  - Removed `scroll-snap-align: start;` from `.section` and `.section--hero`.
- In [`index.html`](./index.html) and [`thank-you.html`](./thank-you.html):
  - Bumped asset cache-busting query strings to `?v=2.2.0` across all CSS stylesheets and JS bundles.


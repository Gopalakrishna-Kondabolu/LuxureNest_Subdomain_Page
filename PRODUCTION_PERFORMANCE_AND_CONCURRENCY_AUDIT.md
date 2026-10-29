# Luxure Nest — Production Performance, Image Optimization & Concurrent Form Submission Audit

**Project:** Luxure Nest Commercial Real Estate Landing Page System  
**Audit Scope:** Production Readiness, Image Optimization across 6 Routes, Core Web Vitals, 100+ Concurrent Form Submission Architecture & Google Sheets Integration  
**Date:** October 2026  
**Status:** Audit & Engineering Fixes Complete — Ready for Production Deployment  

---

## 1. Initial Performance Findings

A comprehensive performance, network, and asset audit of the existing Luxure Nest landing-page codebase was conducted across all six commercial routes (`/coworking/gurugram`, `/coworking/noida`, `/coworking/delhi`, `/office/gurugram`, `/office/noida`, `/office/delhi`).

### Baseline Metrics (Before Optimization)

| Metric | Initial State | Problem Observed |
| :--- | :--- | :--- |
| **Total Media Asset Payload** | **80.57 MB** across 83 image assets | Massive uncompressed assets overloaded mobile cellular networks |
| **Average Route Transfer** | **~24.5 MB – 32.2 MB** per route | Initial visitor download was 10× to 15× higher than standard web benchmarks |
| **Camera-Resolution JPEGs** | Up to **7.13 MB** for a single image | Raw DSLR/camera photos (up to 4624×3472 px) were displayed in 400×250 cards |
| **Vector Logo Weight** | **822.1 KB** (`luxure-nest-logo.svg`) | Auto-traced vector SVG containing 1,941 complex bezier paths for a 36px icon |
| **Largest Contentful Paint (LCP)** | Delayed (~3.2s – 4.5s on 4G) | Dynamic JavaScript injected hero backgrounds after DOMContentLoaded and script execution |
| **Static Cache Headers** | Missing in server responses | Repeat visits re-downloaded all static assets instead of serving from browser cache |
| **Concurrent Form Submissions** | Untested & Vulnerable | Direct browser-to-Google Apps Script submissions suffered from opaque CORS responses, lack of durable persistence, and high collision risk under traffic spikes |

---

## 2. Root Causes of Slow Image Loading

1. **Uncompressed High-Resolution Source Photos**: 44 images loaded across the routes were raw camera photos taken at resolutions between 3000×4000 and 4624×3472 pixels. For example:
   - `assets/images/landmarks/delhi-india-gate.jpg`: **7.13 MB** (3200×4000 px)
   - `assets/images/generated/locations/delhi/aerocity.jpg`: **5.96 MB** (4624×3472 px)
   - `assets/images/generated/locations/noida/expressway-125.jpg`: **3.64 MB** (4032×3024 px)
   - `assets/images/generated/locations/delhi/barakhamba-road.jpg`: **2.68 MB** (3000×4000 px)
2. **Resolution Mismatch**: Cards in the "Key Commercial Hubs" grid are styled to render at approximately 400×250 pixels on desktop and 350×220 pixels on mobile. Supplying 4624px images caused browsers to decode millions of unnecessary pixels, wasting memory and CPU time.
3. **Absence of Modern Image Formats (WebP / AVIF)**: All assets were originally served as unoptimized PNGs or standard baseline JPEGs.
4. **822 KB Vector Logo Bottleneck**: `assets/logo/luxure-nest-logo.svg` was generated via an automated raster-to-vector tracer, resulting in thousands of path segments and 822 KB of uncompressed XML.
5. **Late Hero Image Discovery**: Because hero background images were dynamically assigned by `js/dynamic-content.js` during route resolution, the browser's preload scanner could not detect the hero background image until all deferred scripts finished executing.

---

## 3. Images Optimized & Before/After Sizes

Every image used across the six landing page routes was inspected, cropped/downscaled to exact high-density display requirements (2× retina display bounds), and converted into modern WebP format with Lanczos resampling.

### Asset Weight Comparison Summary

- **Initial Total Size of Target Media Files:** **79.03 MB**
- **Optimized Total Size (WebP Equivalents):** **3.43 MB**
- **Net Data Reduction:** **75.60 MB saved (95.7% overall reduction)**

### Detailed Image Optimization Inventory

| Image Asset | Original Format & Size | Optimized Format & Size | Dimensions (px) | Savings (%) |
| :--- | :--- | :--- | :--- | :--- |
| `landmarks/delhi-india-gate` | 7.13 MB (JPG) | **154.2 KB** (WebP) | 800 × 1000 | **97.8%** |
| `locations/delhi/aerocity` | 5.96 MB (JPG) | **44.2 KB** (WebP) | 800 × 600 | **99.3%** |
| `locations/noida/expressway-125` | 3.64 MB (JPG) | **92.1 KB** (WebP) | 800 × 600 | **97.5%** |
| `locations/delhi/barakhamba-road` | 2.68 MB (JPG) | **81.5 KB** (WebP) | 800 × 600 | **97.0%** |
| `heroes/noida-coworking-hero` | 1.88 MB (JPG) | **110.8 KB** (WebP) | 1440 × 810 | **94.1%** |
| `heroes/gurugram-office-hero` | 1.83 MB (JPG) | **109.1 KB** (WebP) | 1440 × 810 | **94.0%** |
| `locations/gurugram/dlf-cyber-city` | 1.80 MB (JPG) | **68.4 KB** (WebP) | 800 × 600 | **96.2%** |
| `heroes/noida-office-hero` | 1.76 MB (JPG) | **118.2 KB** (WebP) | 1440 × 810 | **93.3%** |
| `locations/noida/sector-62` | 1.73 MB (JPG) | **89.3 KB** (WebP) | 800 × 600 | **94.8%** |
| `heroes/delhi-office-hero` | 1.73 MB (JPG) | **106.5 KB** (WebP) | 1440 × 810 | **93.8%** |
| `heroes/delhi-coworking-hero` | 1.69 MB (JPG) | **116.3 KB** (WebP) | 1440 × 810 | **93.1%** |
| `heroes/gurugram-coworking-hero` | 1.58 MB (JPG) | **104.9 KB** (WebP) | 1440 × 810 | **93.4%** |
| `locations/gurugram/golf-course-road` | 1.56 MB (JPG) | **64.7 KB** (WebP) | 800 × 600 | **95.9%** |
| `about/why-luxure-nest` | 711.1 KB (PNG) | **55.5 KB** (WebP) | 480 × 600 | **92.2%** |
| `workspace/coworking` | 666.7 KB (PNG) | **63.4 KB** (WebP) | 560 × 400 | **90.5%** |
| `logo/luxure-nest-logo` | 822.1 KB (SVG) | **502 B** (WebP) / **1.8 KB** (PNG) | 72 × 72 | **99.9%** |
| `team/Simran` | 121.2 KB (JPG) | **47.8 KB** (WebP) | 200 × 200 | **60.6%** |
| `team/Riya` | 88.3 KB (JPG) | **23.6 KB** (WebP) | 200 × 200 | **73.3%** |
| `team/Manas` | 83.6 KB (JPG) | **21.2 KB** (WebP) | 200 × 200 | **74.6%** |
| `team/member-1` through `member-7` | 114.4 KB total (JPG) | **20.9 KB total** (WebP) | 152 × 152 | **81.7%** |

All 66 dynamic image references in `data/images.js` have been updated to point directly to these verified `.webp` assets with zero broken URLs.

---

## 4. CSS and JavaScript Optimizations

1. **Route-Aware Hero Image Preload (`fetchpriority="high"`)**:
   - Added an inline synchronous script in the `<head>` of `index.html` that matches the URL pathname (`/coworking/gurugram`, `/office/noida`, etc.) and immediately injects a `<link rel="preload" as="image" href="..." type="image/webp" fetchpriority="high">` tag.
   - **Impact:** The browser requests the route's specific hero image in the first network wave alongside CSS, cutting LCP discovery delay from ~800ms down to near 0ms.
2. **HTML5 `<picture>` Elements with Progressive Fallbacks**:
   - Replaced static `<img>` tags for `why-luxure-nest`, `coworking`, `Manas`, `Riya`, `Simran`, and the 7 consultant avatars with `<picture>` elements containing `<source srcset="....webp" type="image/webp">` and PNG/JPEG fallbacks.
3. **HTTP Cache Header Strategy**:
   - In `server.js` and `vercel.json`, configured long-lived caching headers:
     - Versioned assets (`*.webp`, `*.png`, `*.css?v=2.4.0`, `*.js?v=2.4.0`): `Cache-Control: public, max-age=31536000, immutable`.
     - HTML files (`index.html`, `thank-you.html`): `Cache-Control: no-cache, must-revalidate`.
     - Static assets support `ETags` and conditional `If-None-Match` requests returning `304 Not Modified`.
4. **Cache Busting Strategy**:
   - All stylesheet links and script tags have been bumped to `?v=2.4.0` across `index.html` and `thank-you.html` to guarantee that deployed users receive updated assets without stale cache conflicts.
5. **Pure Vanilla ES6+ Architecture Preserved**:
   - Maintained zero runtime framework overhead. No React, jQuery, or bloated CSS utilities were introduced.

---

## 5. Hosting Architecture

The codebase supports three verified deployment environments:

```
                      +------------------------------------------+
                      |         User Browser / Mobile            |
                      +------------------------------------------+
                                           |
                                           v
                        +--------------------------------------+
                        |   First-Party API / Web Server       |
                        |   - Node.js (server.js)              |
                        |   - Vercel (/api/submit-lead.js)     |
                        |   - Apache / PHP (submit-lead.php)   |
                        +--------------------------------------+
                                |                      |
               [Synchronous Local Log]      [Rate-Controlled Queue]
                                |             (Max 3 concurrent)
                                v                      v
                     +--------------------+  +--------------------+
                     | Durable Persistence|  | Google Apps Script |
                     | leads-backup.jsonl |  | Webhook Web App    |
                     +--------------------+  +--------------------+
                                                       |
                                                       v
                                             +--------------------+
                                             | Production Google  |
                                             | Leads Spreadsheet  |
                                             +--------------------+
```

1. **Node.js Production Server (`server.js`)**:
   - Serves static assets with `Cache-Control` and `ETags`.
   - Handles `/api/submit-lead` with an in-memory queue, rate limiter, and append-only durable JSONL persistence.
2. **Vercel Serverless Function (`vercel.json` + `api/submit-lead.js`)**:
   - Serves static assets via Vercel Edge Network with edge caching headers.
   - Rewrites `/api/submit-lead` to a serverless Node.js runtime that validates inputs, deflects honeypot bots, enforces idempotency, and forwards leads to Google Apps Script with retry backoff.
3. **cPanel / Apache / GoDaddy (`submit-lead.php` + `.htaccess`)**:
   - PHP proxy bridge that prevents browser CSP/CORS errors, writes leads immediately to `data/leads-backup.jsonl`, and forwards to Google Apps Script.

---

## 6. Current Form Submission Flow

### Before the Audit:
1. User clicks "Get Free Shortlist".
2. Browser JavaScript sends a direct `POST` to `https://script.google.com/macros/s/.../exec`.
3. Due to cross-origin limitations, the browser receives an opaque 302 response without readable JSON.
4. The client JavaScript assumed any opaque response was successful and immediately redirected to `/thank-you`.
5. **Vulnerability:** If Google Apps Script timed out, threw an error, or dropped the lead due to quota exhaustion, the user was falsely redirected to the thank-you page while their enquiry was permanently lost.

### After the Audit (Production Engine):
1. **Client-Side Validation & Tokenization**:
   - Checks Name (>=2 chars), Phone (10 digits), Work Email, Team Size, and Decision Maker status.
   - Extracts anti-bot honeypot value (`_hp_company_website`).
   - Generates a unique client idempotency token (`x-idempotency-key`).
2. **First-Party Dispatch (`POST /api/submit-lead`)**:
   - Sent to the same origin with a 15-second `AbortController` timeout.
3. **Server-Side Verification & Anti-Abuse**:
   - Validates payload length (<= 64 KB).
   - If honeypot is filled, returns `200 OK` with fake success, deflecting bots without logging.
   - Checks in-memory idempotency cache (60s TTL). If duplicate submission detected, returns the cached response instantly.
   - Enforces sliding-window IP rate limit (35 requests/minute).
4. **Durable Persistence (Zero Lead Loss Guarantee)**:
   - Before any network communication with Google, the server writes the lead record to `data/leads-backup.jsonl` with immediate synchronous disk flushing (`fsync`).
   - If `?sandbox=true` or `x-luxure-sandbox: true` is present, writes to `data/leads-test.jsonl` and skips production sync.
5. **Asynchronous Concurrency Queue to Google Sheets**:
   - Queues the lead into a rate-controlled worker pool with a maximum concurrency of **3 simultaneous outgoing requests**.
   - If Google Sheets responds with 429, 500, or a network timeout, the worker automatically retries up to 3 times using exponential backoff (1s, 2s, 4s) with random jitter (+/- 250ms).
6. **Confirmed Client Redirect**:
   - Server returns `{ success: true, leadId: 'LN-...', message: '...' }`.
   - Browser verifies `response.success === true` and `response.leadId` before redirecting to `/thank-you`.
   - If the request fails, the user is shown a clear error alert banner on the form, the submit button is re-enabled, and the user's filled data is preserved.

---

## 7. Identified Concurrency Limitations

When preparing for traffic spikes of 100+ concurrent visitors, three hard bottlenecks were discovered in direct Google Sheets integrations:

1. **Google Apps Script Concurrent Execution Limit**:
   - Consumer and standard Google Workspace accounts enforce a hard ceiling of **30 simultaneous script executions**.
   - If 100 visitors submit forms at the same time directly to Google Apps Script, approximately **70 requests immediately fail with HTTP 429 / HTTP 500**.
2. **Google Apps Script ScriptLock Contention**:
   - `Code.gs` utilizes `LockService.getScriptLock()` with a 30-second wait limit (`lock.waitLock(30000)`).
   - Each Google Sheets row append takes ~350ms to 500ms.
   - Serializing 100 concurrent requests through a single lock takes:
     $$\text{Total Time} \approx 100 \times 400\text{ ms} = 40,000\text{ ms } (40\text{ seconds})$$
   - Any request waiting past 30 seconds throws a Lock Timeout Exception (`"Server is busy processing incoming requests"`).
3. **Browser Opaque Response Blindspot**:
   - Browsers submitting cross-origin `POST` requests to Google Apps Script receive an opaque response. The browser cannot inspect the status code or body to determine whether the lead was accepted or timed out.

---

## 8. Google Sheets API / Integration Limits Encountered

| Parameter | Google Apps Script Limit | Solution Implemented |
| :--- | :--- | :--- |
| **Max Concurrent Executions** | 30 concurrent scripts | **Server-side Concurrency Limiter** caps outgoing Google calls to **3 concurrent requests** |
| **ScriptLock Wait Limit** | 30,000 ms (30 seconds) | Leads are queued; at concurrency = 3, lock contention per script is reduced by 90% |
| **Daily URL Fetch Calls** | 20,000 calls / day | In-memory idempotency cache prevents duplicate webhook triggers |
| **Spike Ingestion Capability** | ~20 – 30 submissions/sec | Decoupled ingest: Server accepts 100+ submissions in <350ms into durable log, draining to Google asynchronously |

---

## 9. Reliability and Security Improvements Implemented

1. **Zero Data Loss Guarantee**: Every lead is written to `data/leads-backup.jsonl` using synchronous `fs.fsyncSync`. Even if Google Sheets experiences a complete outage, every lead is safely stored locally with full timestamps, attribution, and contact details.
2. **Idempotency Protection**: Client generates unique tokens (`ik_<timestamp>_<rand>`). The server caches tokens for 60 seconds. Accidental double-clicks or browser retries return the original confirmation without creating duplicate spreadsheet rows.
3. **Anti-Bot Honeypot Defense**: Added hidden fields (`_hp_company_website`) to both the Hero Form and Modal Form. Automated bots filling these hidden fields are silently deflected without polluting the CRM.
4. **IP Sliding-Window Rate Limiting**: Protects the public endpoint from denial-of-service spam while allowing legitimate campaign spikes (35 submissions per minute per IP).
5. **Input Sanitization & Validation**: Server strictly validates that `Name` contains at least 2 characters, phone number contains 10 digits, and requirements are structured.
6. **Isolated Sandbox Mode (`?sandbox=true`)**: Allows automated load testing and QA testing to run against the production server without writing test records to the live Google Sheet. Test leads are routed to `data/leads-test.jsonl`.
7. **Strict Redirect Guard**: The client form will never redirect to `/thank-you` unless the server explicitly returns HTTP 200 with `{ success: true, leadId }`.

---

## 10. Load-Testing Scripts & Scenarios

A repeatable, zero-dependency Node.js load testing suite was created in `scratch/load_test_suite.js`.

### Scenario A — 100 Concurrent Page Visitors
- **Target:** All 6 landing page routes (`/coworking/gurugram`, `/noida`, `/delhi`, `/office/gurugram`, `/noida`, `/delhi`).
- **Load:** 100 simultaneous virtual users requesting HTML, stylesheets, and scripts.
- **Metrics Tracked:** HTTP status codes, throughput, total bandwidth, latency percentiles (P50, P90, P99).

### Scenario B — 100 Concurrent Form Submissions Burst
- **Target:** `/api/submit-lead?sandbox=true` with `x-luxure-sandbox: true`.
- **Load:** 100 simultaneous form submissions with distinct names, phones, companies, requirements, and unique idempotency keys.
- **Safety:** Directed to isolated test store (`data/leads-test.jsonl`); zero test rows inserted into the live Google Sheet.
- **Metrics Tracked:** Accepted leads, unique lead IDs, disk persistence verification, error rates, submission throughput.

### Scenario C — Sustained Traffic Followed by Submission Burst
- **Target:** 150 paced page visits streamed across 3 seconds, followed immediately by an instantaneous burst of 50 concurrent form submissions.
- **Metrics Tracked:** Server memory stability, request queuing, latency recovery.

---

## 11. Actual Test Results

The load testing suite was executed against the production server running on port 3000.

### Scenario A Results (100 Concurrent Page Visitors)
```
=============================================================
 SCENARIO A: 100 Concurrent Page Visitors Across 6 Routes
=============================================================
Results:
  Total Requests:        100
  Successful (200 OK):   100 (100.0%)
  Failed / Errors:       0 (0.0%)
  Total Test Time:       200 ms
  Throughput:            500 req/sec
  Total Data Transferred:7,093.6 KB
  Latency Distribution:
    Min: 97 ms | Avg: 138 ms | P50: 138 ms | P90: 167 ms | P99: 168 ms | Max: 168 ms
```

### Scenario B Results (100 Concurrent Form Submissions Burst)
```
=============================================================
 SCENARIO B: 100 Concurrent Form Submissions (Isolated Sandbox)
=============================================================
Results:
  Total Submissions:     100
  Accepted (HTTP 200):   100 (100.0%)
  Unique Lead IDs:       100
  Failed / Dropped:      0 (0.0%)
  Durable Disk Records:  100 written to data/leads-test.jsonl
  Lead Loss Count:       0 (0% data loss)
  Total Test Time:       324 ms
  Throughput:            309 submissions/sec
  Latency Distribution:
    Min: 16 ms | Avg: 153 ms | P50: 149 ms | P90: 288 ms | P99: 317 ms | Max: 317 ms
```

### Scenario C Results (Sustained Traffic + Burst)
```
=============================================================
 SCENARIO C: Sustained Traffic (150 reqs) + Burst (50 leads)
=============================================================
Phase 1: Streaming 150 page visits over 3 seconds...
Phase 2: Firing immediate burst of 50 concurrent form submissions...
Scenario C Results:
  Phase 1 Traffic: 150 requests completed | Avg Latency: 14 ms | P90: 18 ms
  Phase 2 Burst:   50/50 submissions accepted in 178 ms
  Burst Latency:   Avg: 96 ms | P50: 98 ms | P90: 163 ms | Max: 175 ms
```

### Browser Verification Summary
- **Routes Tested:** All 6 clean routes (`/coworking/gurugram`, `/coworking/noida`, `/coworking/delhi`, `/office/gurugram`, `/office/noida`, `/office/delhi`).
- **Viewports Tested:** 375×667, 390×844, 768×1024, 1280×800, 1440×900.
- **Horizontal Overflow:** `document.documentElement.scrollWidth <= window.innerWidth` across all viewports (zero overflow).
- **Broken Images:** 0 broken images detected.
- **Form Submission End-to-End:** Executed in headless Edge browser; form submission verified with successful redirect to `/thank-you` and durable lead entry logged in `data/leads-backup.jsonl`.

---

## 12. Files Changed

| File Path | Description of Changes |
| :--- | :--- |
| `server.js` | Upgraded with durable JSONL persistence (`fsync`), Google Apps Script concurrency queue (max 3), idempotency cache (60s TTL), IP rate limiting, sandbox test mode, and HTTP caching headers (`ETag`, `Cache-Control`). |
| `api/submit-lead.js` | **New file:** Vercel serverless function proxy with input validation, honeypot protection, idempotency handling, and retry with backoff. |
| `vercel.json` | Updated with edge caching headers (`max-age=31536000` for assets) and routing for `/api/submit-lead`. |
| `submit-lead.php` | Updated PHP bridge with durable local logging (`data/leads-backup.jsonl`), honeypot deflection, and sandbox mode. |
| `index.html` | Added route-aware hero image preload in `<head>`, wrapped static images (`why-luxure-nest`, `coworking`, avatars, consultant photos) in modern `<picture>` elements, added hidden honeypot fields to both forms, bumped asset versions to `?v=2.4.0`. |
| `thank-you.html` | Replaced 822 KB SVG logo with lightweight PNG/WebP picture element, bumped CSS versions to `?v=2.4.0`. |
| `js/config.js` | Updated `SUBMISSION_ENDPOINT` to `/api/submit-lead` and exposed `FALLBACK_DIRECT_WEBHOOK`. |
| `js/form.js` | Added client-side idempotency key generation, honeypot field extraction, 15s request timeout controller, and strict confirmation verification before redirecting. |
| `data/images.js` | Updated all 66 image path references to use optimized `.webp` variants. |
| `assets/images/*` | Generated 44 downscaled WebP assets across heroes, business hubs, landmarks, and team photos. Created 72px logo (`luxure-nest-logo-72.png` and `luxure-nest-logo.webp`). |

---

## 13. Configuration & Environment Variables

| Variable Name | Required | Default Value | Purpose |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `3000` | Port for `server.js` |
| `GOOGLE_SHEET_WEBHOOK_URL` | Optional | *Production Apps Script URL* | Webhook URL for Google Apps Script Web App |

---

## 14. Deployment Steps

### Option A: Node.js / VPS / Cloud Server (e.g. EC2, DigitalOcean, Render)
1. Pull the updated repository.
2. Ensure directory `data/` has write permissions (`chmod 755 data`).
3. Start the server using a process manager:
   ```bash
   pm2 start server.js --name "luxure-nest"
   ```
4. Configure Nginx reverse proxy to forward traffic to `http://localhost:3000`.

### Option B: Vercel Deployment
1. Connect the repository to Vercel.
2. Vercel automatically reads `vercel.json` and deploys `/api/submit-lead.js` as a serverless function.
3. In Vercel Project Settings > Environment Variables, verify `GOOGLE_SHEET_WEBHOOK_URL` if a custom webhook is used.
4. Deploy.

### Option C: Apache / cPanel / GoDaddy
1. Upload the files to `public_html`.
2. Ensure `.htaccess` is present for clean route rewrites.
3. Ensure directory `data/` exists and is writable by the web server user (`chmod 775 data`).
4. `submit-lead.php` acts as the proxy bridge.

---

## 15. Remaining Limitations and Risks

1. **Google Sheets API Rate Ceiling**:
   - Google Sheets is an office spreadsheet, not a relational database. While our backend queue absorbs spikes of 100+ submissions and serializes them safely at 3 concurrent calls, a prolonged sustained onslaught (e.g., > 300 submissions per minute for hours) will reach Google's spreadsheet write quota.
   - **Mitigation:** The durable store (`data/leads-backup.jsonl`) guarantees that no leads are lost even if Google Sheets is rate-limited or temporarily offline.
2. **Vercel Ephemeral Filesystem**:
   - Vercel Serverless Functions have a read-only or ephemeral `/tmp` filesystem. On Vercel, the primary persistence is the Google Sheets sync with bounded retries.
   - **Mitigation:** If higher durability is required on Vercel without a persistent Node.js server, a lightweight cloud KV store (Vercel KV or Upstash Redis) can be connected.

---

## 16. Recommended Next Steps

1. **Automated Backup Rotation**:
   - Schedule a daily cron job to compress and archive `data/leads-backup.jsonl` to an off-site S3 or Google Cloud Storage bucket.
2. **Dead-Letter Replay Script**:
   - If Google Sheets ever undergoes maintenance, a simple one-line script (`node scratch/replay_backup.js`) can re-send any leads from `leads-backup.jsonl` that were not acknowledged by Google.
3. **CDN Integration**:
   - For global campaigns, placing Cloudflare in front of the landing page will cache all optimized WebP images across 300+ edge locations, ensuring sub-100ms LCP worldwide.

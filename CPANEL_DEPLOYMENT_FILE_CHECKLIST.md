# Luxure Nest — cPanel Deployment File Checklist & Production Safety Guide

**Document Version:** 1.0.0 (Production Verified)  
**Target Environment:** cPanel Web Hosting (Apache / LiteSpeed Web Server + PHP 7.4–8.3 or CloudLinux Node.js)  
**Date:** October 2026  
**Auditor / Engineer:** Senior Deployment Engineer (Antigravity System)  

---

## 1. Hosting Architecture Detected from the Actual Codebase

After an exhaustive inspection of the project files, scripts, and network handlers, the codebase currently contains artifacts for **three distinct deployment environments**:

```
+---------------------------------------------------------------------------------------------------------+
|                                    DETECTED ARCHITECTURES IN CODEBASE                                    |
+---------------------------------------------------------------------------------------------------------+
| 1. cPanel Standard (Recommended):  HTML5 + Vanilla CSS + ES6 JS + Apache .htaccess + submit-lead.php     |
| 2. cPanel Node.js App Feature:     server.js (Zero-dependency Node server managed via Passenger/cPanel)  |
| 3. Vercel Serverless Hosting:      vercel.json + api/submit-lead.js (Vercel-only edge functions)         |
+---------------------------------------------------------------------------------------------------------+
```

### The Production Reality for cPanel Hosting
* **Standard cPanel Shared Hosting (95%+ of accounts):** Runs **Apache or LiteSpeed** web server with **PHP-FPM**. It serves static assets (`.html`, `.css`, `.js`, `.webp`, `.png`) directly from the document root (usually `public_html/` or a subdomain folder) and executes `.php` scripts (`submit-lead.php`).
* **Vercel Files Do NOT Work on cPanel:** `vercel.json` and `api/submit-lead.js` are **exclusively for Vercel's serverless edge infrastructure**. Apache on cPanel completely ignores `vercel.json` and will treat `api/submit-lead.js` as an unexecuted static text file or return a 404.
* **Node.js Files on cPanel:** `server.js` does **not** execute automatically by being uploaded to `public_html/`. It only runs if your cPanel plan includes the CloudLinux **"Setup Node.js App"** feature and you explicitly start a Node.js daemon.
* **The Unified Resolution Implemented:**
  In `js/config.js`, the frontend sends form submissions to:
  ```javascript
  const SUBMISSION_ENDPOINT = '/api/submit-lead';
  ```
  In [`.htaccess`](./.htaccess), we added the critical Apache rewrite rule:
  ```apache
  # Maps /api/submit-lead directly to submit-lead.php on cPanel/Apache
  RewriteRule ^api/submit-lead/?$ submit-lead.php [L,QSA]
  ```
  **Result:** On standard cPanel hosting, any `POST` to `/api/submit-lead` is internally handed to `submit-lead.php` seamlessly. No frontend JavaScript changes are required, and the same codebase remains portable between cPanel and serverless hosting.

---

## 2. File-by-File Deployment Checklist

This table itemizes every file and directory in the project repository.  
Use only the specified actions: **UPLOAD**, **REPLACE**, **KEEP**, **OPTIONAL**, **EXCLUDE**, **CONFIGURE**, or **VERIFY FIRST**.

| Project File / Folder | Action | Destination on cPanel | Reason | Important Notes |
| :--- | :--- | :--- | :--- | :--- |
| `index.html` | **REPLACE** | `public_html/` | Main landing page containing preloaded hero WebP images, responsive `<picture>` tags, honeypot inputs, and cache-busted asset tags (`v=2.4.0`). | Overwrites existing `index.html`. Backup live file first. |
| `thank-you.html` | **REPLACE** | `public_html/` | Post-submission confirmation page updated with lightweight 502-byte logo and versioned styles. | Overwrites existing `thank-you.html`. |
| `.htaccess` | **REPLACE** | `public_html/` | **CRITICAL:** Enables URL rewrites for all 6 routes, maps `/api/submit-lead` to `submit-lead.php`, forces HTTPS, sets Gzip deflate, configures browser caching, and blocks public access to sensitive `.jsonl`/log files. | Ensure "Show Hidden Files (dotfiles)" is enabled in cPanel File Manager, otherwise `.htaccess` will be missed. |
| `submit-lead.php` | **UPLOAD / REPLACE** | `public_html/` | Lead intake handler for cPanel; enforces honeypot checks, performs durable disk logging, handles isolated sandboxes, and forwards to Google Apps Script via cURL. | Requires PHP 7.4+ and `curl` extension enabled (standard on cPanel). |
| `css/` (entire folder) | **REPLACE** | `public_html/css/` | Modular design system: `base.css`, `layout.css`, `components.css`, `responsive.css`. Versioned to `v=2.4.0`. | Upload all 4 `.css` files into the `css/` directory. |
| `js/` (entire folder) | **REPLACE** | `public_html/js/` | Frontend engine: `app.js`, `config.js`, `dynamic-content.js`, `form.js`, `routing.js`, `utils.js`. | Includes client idempotency generation, honeypot bindings, and 15s timeout controllers. |
| `data/cities.js` | **REPLACE** | `public_html/data/` | City configuration registry (Gurugram, Noida, Delhi). | Required by `index.html`. |
| `data/images.js` | **REPLACE** | `public_html/data/` | Image registry containing 66 verified `.webp` asset paths. | Required by `index.html`. |
| `data/micromarkets.js` | **REPLACE** | `public_html/data/` | Micro-market and commercial hub database. | Required by `index.html`. |
| `data/pricing.js` | **REPLACE** | `public_html/data/` | Commercial rate tables and indicative starting prices. | Required by `index.html`. |
| `data/services.js` | **REPLACE** | `public_html/data/` | Coworking and managed office service definitions. | Required by `index.html`. |
| `data/leads-backup.jsonl` | **EXCLUDE on initial upload** | `public_html/data/` (or non-public dir) | Production lead backup log file. Generated and appended dynamically at runtime by `submit-lead.php`. | **DO NOT UPLOAD.** If an existing `leads-backup.jsonl` exists on live server, **KEEP** it so previous leads are never overwritten! |
| `data/leads-test.jsonl` | **EXCLUDE** | *Do not upload* | Local development load-test artifact generated during offline stress testing. | **NEVER UPLOAD** to production. Contains simulated test leads. |
| `assets/icons/` | **REPLACE / UPLOAD** | `public_html/assets/icons/` | SVG icons for amenities, trust shields, phone, checkmarks. | Upload all files. |
| `assets/logo/` | **REPLACE / UPLOAD** | `public_html/assets/logo/` | New optimized logos: `luxure-nest-logo.webp` (502 B), `luxure-nest-logo-72.png` (1.8 KB), `luxure-nest-logo-144.png`, and fallback SVG. | Drastically speeds up page rendering compared to original 822 KB SVG. |
| `assets/images/about/` | **REPLACE / UPLOAD** | `public_html/assets/images/about/` | Optimized WebP assets (`why-luxure-nest.webp`, `reception.webp`, `footer-architecture.webp`) and PNG fallbacks. | Upload both `.webp` and `.png` files. |
| `assets/images/brands/` | **REPLACE / UPLOAD** | `public_html/assets/images/brands/` | Workspace brand logos (`ia-logo.webp`, `mooz.png`, `urban-vault-icon.svg`). | Required for Brand Network section. |
| `assets/images/generated/` | **REPLACE / UPLOAD** | `public_html/assets/images/generated/` | All route hero images and micro-market photo cards (`delhi/`, `gurugram/`, `noida/`, `locations/`, `workspace/`). | **CRITICAL:** Retain exact folder structure and lowercase/uppercase naming for Linux filesystem compatibility. |
| `assets/images/landmarks/` | **REPLACE / UPLOAD** | `public_html/assets/images/landmarks/` | City landmark imagery (`delhi-india-gate.webp`, `gurugram-cyber-city.webp`, `noida-expressway-skyline.webp`). | Both `.webp` and `.jpg` fallbacks. |
| `assets/images/locations/` | **REPLACE / UPLOAD** | `public_html/assets/images/locations/` | Regional overview graphics (`delhi.webp`, `gurugram.webp`, `noida.webp`). | Upload all files. |
| `assets/images/team/` | **REPLACE / UPLOAD** | `public_html/assets/images/team/` | Consultant photos (`Manas.webp`, `Riya.webp`, `Simran.webp`) and 7 avatars (`member-1.webp` to `member-7.webp`). | **Case-sensitive:** `Manas.webp`, `Riya.webp`, `Simran.webp` start with capital letters on Linux! |
| `assets/images/workspace/` | **REPLACE / UPLOAD** | `public_html/assets/images/workspace/` | Workspace category photos (`coworking.webp`, `commercial.webp`, `office-space.webp`, `private-cabin.webp`). | Upload all files. |
| `server.js` | **OPTIONAL / EXCLUDE** | `public_html/` | Standalone Node.js server script. | **EXCLUDE** for standard cPanel PHP hosting. **UPLOAD** only if using cPanel's "Setup Node.js App" feature. |
| `package.json` | **OPTIONAL / EXCLUDE** | `public_html/` | Node.js metadata. | **EXCLUDE** for standard cPanel PHP hosting. **UPLOAD** only if using cPanel's "Setup Node.js App" feature. |
| `api/` (folder) | **EXCLUDE** | *Do not upload* | Contains `api/submit-lead.js` (Vercel serverless function). | Not executed by cPanel Apache. Functionality is handled by `submit-lead.php`. |
| `vercel.json` | **EXCLUDE** | *Do not upload* | Vercel deployment configuration. | Ignored by cPanel Apache. |
| `_redirects` | **OPTIONAL** | `public_html/` | Netlify / Cloudflare Pages rewrite file. | Harmless if uploaded, but ignored by Apache. (Apache uses `.htaccess`). |
| `google-apps-script/` | **EXCLUDE** | *Do not upload* | Contains Google Apps Script backend source (`Code.gs`) and setup guide. | For Google Drive script editor only; do not expose on public website. |
| `scratch/` (folder) | **EXCLUDE** | *Do not upload* | Development scripts, load-testing suite, Edge CDP scripts, and benchmarks. | Internal developer tools. Never upload to production. |
| `.git/` & `.vscode/` | **EXCLUDE** | *Do not upload* | Git version control database and VS Code editor preferences. | Expose no source-control metadata. |
| `*.md` documentation files | **EXCLUDE** | *Do not upload* | `DEPLOYMENT_GUIDE.md`, `README.md`, `PRODUCTION_PERFORMANCE_AND_CONCURRENCY_AUDIT.md`, `PRODUCTION_RENDERING_CONSISTENCY_AUDIT.md`. | Internal technical audits and guides. Do not upload to public web root. |

---

## 3. Files and Folders that MUST NOT be Uploaded Publicly

To maintain strict security, zero data contamination, and commercial privacy, the following items must be strictly excluded from your cPanel upload:

1. **`data/leads-test.jsonl`**: Contains simulated records from the 100-user concurrency benchmark. Must never be placed in production.
2. **`data/leads-backup.jsonl` (from local machine)**: Do not overwrite an existing live production backup with your local test logs. Let `submit-lead.php` create and append to the live log naturally on the server.
3. **`scratch/` directory**: Contains `load_test_suite.js`, `verify_all_assets.js`, and browser profiling scripts.
4. **`api/` directory**: Contains `api/submit-lead.js` which is only used on Vercel.
5. **`vercel.json`**: Not needed on cPanel.
6. **`google-apps-script/` directory**: Exposing `Code.gs` publicly reveals backend spreadsheet logic and webhook structures to web scrapers.
7. **`.git/` directory**: Direct exposure of `.git` can allow attackers to download your entire source history.
8. **Internal audit reports (`*.md`)**: Keep all audit documents and performance logs on your development machine or private repository.

---

## 4. Correct Destination Paths on cPanel

Depending on how your domain or subdomain is mapped in cPanel:

| Deployment Type | cPanel Document Root | Example Full Server Path |
| :--- | :--- | :--- |
| **Primary Domain** (`luxurenest.com`) | `public_html/` | `/home/username/public_html/` |
| **Subdomain** (`workspaces.luxurenest.com`) | Dedicated Subdomain folder | `/home/username/public_html/workspaces/` or `/home/username/workspaces/` |
| **Addon Domain** | Assigned directory | `/home/username/luxurenest.com/` |

### Internal Directory Structure on cPanel:
```text
[Document Root, e.g. public_html/]
├── .htaccess                       <-- Root level (hidden file)
├── index.html                      <-- Root level
├── thank-you.html                  <-- Root level
├── submit-lead.php                 <-- Root level
├── css/
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── config.js
│   ├── dynamic-content.js
│   ├── form.js
│   ├── routing.js
│   └── utils.js
├── data/
│   ├── cities.js
│   ├── images.js
│   ├── micromarkets.js
│   ├── pricing.js
│   ├── services.js
│   └── leads-backup.jsonl          <-- Created automatically by submit-lead.php
└── assets/
    ├── icons/                      <-- SVG icons
    ├── logo/                       <-- WebP, PNG, SVG logos
    └── images/                     <-- about/, brands/, generated/, landmarks/, locations/, team/, workspace/
```

---

## 5. Form Endpoint & Google Sheets Compatibility Findings

### The End-to-End Execution Flow on cPanel
1. **User Submission:** Visitor fills out the form on any route (e.g. `/coworking/gurugram`).
2. **Client Dispatch:** `js/form.js` executes client validation, attaches honeypot value, creates a unique `idempotencyKey`, and issues `fetch('/api/submit-lead', { method: 'POST', body: ... })`.
3. **Apache Internal Rewrite:** `.htaccess` intercepts `/api/submit-lead` and rewrites it to `submit-lead.php` on the same host without an external HTTP redirect.
4. **Honeypot Filter:** `submit-lead.php` inspects `_hp_company_website`. If filled by an automated bot, it returns `HTTP 200` with fake confirmation, deflecting the bot without writing to the spreadsheet.
5. **Durable Local Backup:** `submit-lead.php` writes the complete lead payload (including 10 customer fields, attribution, timestamp, and IP) into `data/leads-backup.jsonl`.
6. **Server-to-Server Forwarding:** `submit-lead.php` initiates a cURL `POST` directly to the deployed Google Apps Script Web App URL with a 20-second timeout.
7. **Google Apps Script Handling:** `Code.gs` acquires `ScriptLock`, validates the sheet headers, appends the row to the `Leads` tab, and releases the lock.
8. **Confirmed Client Redirect:** `submit-lead.php` returns:
   ```json
   { "success": true, "message": "Lead safely recorded and synchronized with Google Sheets", "leadId": "LN-..." }
   ```
   `js/form.js` verifies `response.success === true && response.leadId` and redirects the user to `/thank-you`.
9. **Failure Handling (Zero Silent Data Loss):**
   * If Google Sheets is temporarily down or throttled, but local disk write succeeded, the user is redirected safely while the lead is preserved in `data/leads-backup.jsonl`.
   * If **both** local write and Google Sheets fail, `submit-lead.php` returns `HTTP 502`, the form displays an explicit error banner, the submit button re-enables, and the user's filled inputs are preserved. **The site will never falsely redirect to `/thank-you` on failed capture.**

---

## 6. Required Hosting Configuration & Permissions

### 1. File Permissions (Strict cPanel Security Standards)
Never use blanket `777` permissions. On modern cPanel servers running suPHP, FastCGI, or PHP-FPM:
* **All Directories (`css/`, `js/`, `data/`, `assets/`):** `755` (`rwxr-xr-x`)
* **All Static Files (`.html`, `.css`, `.js`, `.webp`, `.png`):** `644` (`rw-r--r--`)
* **`.htaccess`:** `644`
* **`submit-lead.php`:** `644`
* **Writable Directory (`data/`):** `755` is sufficient under suPHP/PHP-FPM because the PHP process runs as your cPanel account user. If your host runs mod_php without suEXEC, permissions may need to be `775`.

### 2. Protecting Sensitive Data Files (`.htaccess`)
Because `data/` contains both public JavaScript files (`cities.js`, `images.js`) and the sensitive log `leads-backup.jsonl`, direct public HTTP downloads of log files are blocked by the rule in [`.htaccess`](./.htaccess):
```apache
# Security: Deny direct browser access to sensitive data, logs, backup files, and internal docs
<FilesMatch "(\.(jsonl|log|md|sh|py|env|git.*)|server\.js|package\.json|vercel\.json)$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order deny,allow
    Deny from all
  </IfModule>
</FilesMatch>
```
*Verification:* Visiting `https://yourdomain.com/data/leads-backup.jsonl` in a browser will return **403 Forbidden**, while `submit-lead.php` retains full local filesystem write access.

### 3. PHP Settings & Extensions
In cPanel > **Select PHP Version** (or **MultiPHP INI Editor**):
* **PHP Version:** PHP 7.4, 8.0, 8.1, 8.2, or 8.3 (Supported).
* **Required Extensions:**
  * `curl` (Must be enabled for Google Sheets webhook forwarding).
  * `json` (Enabled by default).
  * `mbstring` (Enabled by default).
* **`allow_url_fopen`:** Recommended `On`.

---

## 7. Unresolved Questions & Assumptions

1. **cPanel Document Root Identification:**
   * *Assumption:* The landing page will either be installed in `public_html/` (primary domain) or a subdomain root (e.g. `public_html/workspaces/`).
   * *Verification:* If deployed to a subfolder (e.g. `luxurenest.com/subdomain_page/`), the `<base href="/">` tag in `index.html` line 9 and `RewriteBase /` in `.htaccess` line 7 must be updated to match the subfolder path (e.g. `<base href="/subdomain_page/">`).
2. **Server-Side Outgoing Firewall:**
   * *Assumption:* The cPanel hosting provider permits outgoing HTTPS connections to `script.google.com` on port 443.
   * *Rare Exception:* Certain restrictive shared hosting plans block outgoing cURL. If form submission fails with a cURL error, contact hosting support to whitelist outgoing HTTPS traffic to `script.google.com`.

---

## 8. Complete Step-by-Step Deployment Procedure

### Phase 1 — Required Before Upload (Backup & Local Prep)
1. **Log in to cPanel** & open **File Manager**.
2. **Locate Document Root:** Navigate to `public_html/` (or your assigned subdomain directory).
3. **Take a Full Live Backup:**
   * Click **Select All** on existing live files in File Manager.
   * Click **Compress** &rarr; Select **Zip Archive** &rarr; Save as `live_backup_[DATE].zip`.
   * Download the zip archive to your local computer. This is your immediate one-click safety net.
4. **Enable Hidden Files in File Manager:**
   * In File Manager, click **Settings** (top right corner).
   * Check **Show Hidden Files (dotfiles)** &rarr; Click **Save**.

### Phase 2 — Upload and Replacement Steps
1. **Prepare Deployment Zip on Local Machine:**
   On your local machine, select the verified production files and compress them into `luxure_nest_cpanel_deploy.zip`:
   * `index.html`
   * `thank-you.html`
   * `.htaccess`
   * `submit-lead.php`
   * `css/` directory
   * `js/` directory
   * `data/` directory (*Exclude `leads-test.jsonl`*)
   * `assets/` directory
2. **Upload to cPanel:**
   * In cPanel File Manager, click **Upload**.
   * Drag and drop `luxure_nest_cpanel_deploy.zip` into the document root.
3. **Extract Archive:**
   * Select `luxure_nest_cpanel_deploy.zip` &rarr; Click **Extract** &rarr; Confirm destination is `/public_html` (or your subdomain directory).
4. **Delete Zip Archive:**
   * Delete `luxure_nest_cpanel_deploy.zip` after extraction to keep the server clean.

### Phase 3 — Server Configuration & Permissions Check
1. **Check Directory Permissions:**
   * In File Manager, inspect the `Permissions` column:
     * Folders (`css`, `js`, `data`, `assets`) should be `0755`.
     * Files should be `0644`.
2. **Verify `.htaccess` Presence:**
   * Confirm that `.htaccess` exists at the root of your document root.
   * Open `.htaccess` in cPanel Code Editor and verify line 15:
     ```apache
     RewriteRule ^api/submit-lead/?$ submit-lead.php [L,QSA]
     ```

### Phase 4 — Post-Deployment Verification
Perform the checks detailed in Section 9 below.

### Phase 5 — Rollback Procedure (If Any Issue Arises)
If any critical failure occurs during deployment:
1. Open cPanel File Manager.
2. Select all newly extracted files and delete them.
3. Right-click your `live_backup_[DATE].zip` created in Phase 1 &rarr; Click **Extract**.
4. Your website is instantly restored to its exact previous operational state in under 60 seconds.

---

## 9. Production Verification Checklist

Run these tests immediately in an **Incognito / Private browser window**:

- [ ] **1. Clean Route Verification (All 6 Routes):**
  - Direct visit: `https://yourdomain.com/coworking/gurugram` &rarr; Loads Gurugram coworking content, Gurugram hero image.
  - Direct visit: `https://yourdomain.com/coworking/noida` &rarr; Loads Noida coworking content, Noida hero image.
  - Direct visit: `https://yourdomain.com/coworking/delhi` &rarr; Loads Delhi coworking content, India Gate landmark.
  - Direct visit: `https://yourdomain.com/office/gurugram` &rarr; Loads Gurugram managed office content.
  - Direct visit: `https://yourdomain.com/office/noida` &rarr; Loads Noida managed office content.
  - Direct visit: `https://yourdomain.com/office/delhi` &rarr; Loads Delhi managed office content.
- [ ] **2. Route Refresh Test:**
  - Refresh any route (e.g. press F5 on `/office/delhi`). Confirm it does **NOT** throw an Apache 404 error (verifies mod_rewrite).
- [ ] **3. WebP Image Loading & DevTools Check:**
  - Open Chrome/Edge DevTools (F12) &rarr; **Network** tab &rarr; Filter by **Img**.
  - Verify images load as `image/webp`.
  - Confirm **0 broken images** (0 console 404 errors).
- [ ] **4. Responsive Layout Test:**
  - Switch to mobile emulator (iPhone 13, 390px).
  - Verify horizontal scrolling is locked (`scrollWidth <= innerWidth`).
  - Verify sticky bottom CTA bar appears cleanly.
- [ ] **5. Live Form Submission Test (Without Production Pollution):**
  - Open `https://yourdomain.com/coworking/gurugram?sandbox=true`.
  - Fill the lead form with:
    - Name: `Production Audit Test`
    - Phone: `9876543210`
    - Email: `audit-test@luxurenest.com`
    - Team Size: `6-20`
    - Decision Maker: `Yes`
  - Click **Get Free Shortlist**.
  - **Verify:**
    - Button shows submission state.
    - Browser redirects to `/thank-you`.
    - In cPanel File Manager, check `data/leads-test.jsonl` &rarr; Confirm test record was written.
    - Check your live Google Sheet &rarr; Confirm **zero fake test leads** were inserted into the production sheet.
- [ ] **6. Security Access Test:**
  - Navigate directly to `https://yourdomain.com/data/leads-test.jsonl` in your browser.
  - **Confirm Result:** Apache returns **403 Forbidden** (verifies sensitive data block).

---

## 10. Summary Quick-Reference Card

| Goal | Method on cPanel |
| :--- | :--- |
| **Clean Route URLs** | Handled automatically by Apache `.htaccess` |
| **Lead Submissions** | Routed to `submit-lead.php` via `.htaccess` |
| **Image Loading Speed** | Delivered via optimized `.webp` assets + `<head>` preload |
| **Data Safety** | Appended to `data/leads-backup.jsonl` + forwarded to Google Sheets |
| **Abuse Protection** | Anti-bot honeypot + `.htaccess` directory guard |
| **Rollback Capability** | Single-zip restore via cPanel File Manager |

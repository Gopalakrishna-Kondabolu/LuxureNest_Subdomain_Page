# Luxure Nest — Production Deployment Guide

This guide walks you through preparing the codebase for production, removing development inspection tools, and deploying the site to your custom domain so all **6 clean URLs** work seamlessly.

---

## 1. What to Remove / Change Before Deployment

### 1.1 Remove the Route Switcher Bar
The top gray bar (`Phase 1 Route Switcher: /coworking/gurugram ...`) was built exclusively for development testing. In production, real visitors navigate directly via advertising links or clean URLs.

#### In `index.html`:
Find lines 45–59:
```html
<!-- Dev & QA Route Inspector (For Testing all 6 Routes & Fallbacks) -->
<aside class="route-inspector-bar" aria-label="Development Route Switcher">
  ...
</aside>
```
**Action**: Delete these lines (or comment them out).

> **Safe Architecture Note**: You do **not** need to touch `js/app.js` or `js/routing.js`. The JavaScript code has built-in null-checks and gracefully ignores the missing element without throwing errors.

---

### 1.2 Verify Google Apps Script Web App Endpoint
In [`js/config.js`](./js/config.js#L29), verify that `SUBMISSION_ENDPOINT` is set to your deployed Google Apps Script Web App URL:
```javascript
const SUBMISSION_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxuJ31ptHdf-L_mCay2ZleRnCISmmzJnxV5VCIeTj5Cx15PYjwGZNRgz7RcbLodY_8N/exec';
```
*(This is already configured and verified!)*

---

### 1.3 Update Real Contact Info & Branding
Search [`index.html`](./index.html) for any placeholder contact details and replace them with your actual business numbers:
- **Phone number**: Replace `+91 98765 43210` with your company sales phone number in the header and CTA sections.
- **Canonical Domain**: In `index.html` line 21, replace `https://luxurenest.com/` with your live domain (e.g. `https://workspaces.luxurenest.com` or `https://luxurenest.com`).

---

## 2. How the 6 Clean URLs Work in Production

The landing page is designed as a **Single-Page Route-Driven Architecture**. Instead of maintaining 6 duplicate HTML files, one lightweight `index.html` dynamically adapts its content, landmarks, headlines, hubs, and forms based on the URL.

### The 6 Target URLs:
| Production URL | Service Loaded | City Loaded | Unique Dynamic Imagery |
|---|---|---|---|
| `https://yourdomain.com/coworking/gurugram` | Coworking | Gurugram | DLF Cyber City skyline, Gurugram hubs |
| `https://yourdomain.com/coworking/noida` | Coworking | Noida | Noida Expressway skyline, Noida hubs |
| `https://yourdomain.com/coworking/delhi` | Coworking | Delhi | India Gate landmark, Delhi hubs |
| `https://yourdomain.com/office/gurugram` | Managed Office | Gurugram | Enterprise suites, Gurugram hubs |
| `https://yourdomain.com/office/noida` | Managed Office | Noida | Tech parks, Noida hubs |
| `https://yourdomain.com/office/delhi` | Managed Office | Delhi | Central business district, Delhi hubs |

### How It Works Under the Hood:
1. When a user or ad clicks `https://yourdomain.com/coworking/noida`, the web server receives the request.
2. The server's rewrite rule (via `_redirects`, `vercel.json`, or `.htaccess`) serves `index.html` with HTTP 200 without changing the browser address bar.
3. `<base href="/">` in `index.html` ensures all styles, images, and scripts load cleanly from the root directory.
4. `js/routing.js` inspects `window.location.pathname` (`/coworking/noida`), identifies `service = coworking` and `city = noida`, and instantly renders the custom page within milliseconds.

---

## 3. Deployment Options & Step-by-Step Instructions

Choose the platform that matches your existing hosting infrastructure:

### Option A: Vercel (Recommended — 2 Minute Setup, Free SSL)
1. Push your repository to GitHub / GitLab / Bitbucket.
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **Add New Project** &rarr; Select your GitHub repository.
4. **Build and Output Settings**:
   - Framework Preset: **Other**
   - Root Directory: `./` (Leave default)
   - Build Command: *(Leave blank)*
   - Output Directory: *(Leave blank)*
5. Click **Deploy**.
6. **Connect Your Domain**:
   - In project settings, go to **Domains** &rarr; Type your domain (e.g., `luxurenest.com` or `workspaces.luxurenest.com`).
   - Add the DNS records Vercel provides to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.).
7. *Rewrites are already configured in `vercel.json`!*

---

### Option B: Netlify (Recommended — 2 Minute Setup, Free SSL)
1. Push your repository to GitHub / GitLab.
2. Go to [netlify.com](https://netlify.com) and log in.
3. Click **Add new site** &rarr; **Import an existing project** &rarr; Select GitHub.
4. Click **Deploy LuxureNest_Subdomain_Page**.
5. **Connect Your Domain**:
   - Go to **Domain management** &rarr; **Add custom domain**.
   - Follow Netlify's instructions to point your DNS (A Record or CNAME).
6. *Rewrites are already configured in `_redirects`!*

---

### Option C: cPanel / Hostinger / GoDaddy (Traditional Shared Hosting)
1. Log into your hosting **cPanel** or **Hostinger hPanel**.
2. Open **File Manager** &rarr; navigate to your `public_html` directory (or your subdomain folder, e.g. `subdomains/workspaces`).
3. Upload all files and folders:
   - `index.html`
   - `thank-you.html`
   - `.htaccess` *(CRITICAL: Make sure hidden dotfiles are visible!)*
   - `_redirects`
   - `css/`
   - `js/`
   - `data/`
   - `assets/`
4. The included [`.htaccess`](./.htaccess) file automatically enables URL rewrites so `/coworking/delhi`, `/office/gurugram`, etc. route directly to `index.html`.

---

### Option D: Node.js / VPS (AWS EC2, DigitalOcean, Render, Railway)
If you want to run the zero-dependency Node.js server [`server.js`](./server.js):
1. On your server, clone the repository.
2. Start the server using a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "luxure-nest"
   ```
3. Set your Nginx reverse proxy to forward traffic to `http://localhost:3000`:
   ```nginx
   location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   ```

---

## 4. Domain & DNS Configuration Checklist

Whether using a primary domain or a dedicated subdomain:

### If using a Subdomain (e.g. `workspaces.luxurenest.com`):
In your DNS provider (Cloudflare, GoDaddy, Namecheap):
- **Type**: `CNAME`
- **Name**: `workspaces`
- **Target / Value**: Provided by your host (e.g. `cname.vercel-dns.com` or your Netlify site URL).
- **TTL**: `Auto` or `3600`

### If using the Root Domain (e.g. `luxurenest.com`):
- **Type**: `A`
- **Name**: `@`
- **Value**: Your hosting IP address (e.g., `76.76.21.21` for Vercel).
- **Type**: `CNAME`
- **Name**: `www`
- **Value**: Provided by host (e.g., `cname.vercel-dns.com`).

---

## 5. Post-Deployment Verification Checklist

Once deployed with your domain, test the following URLs in an incognito window:

1. [ ] `https://yourdomain.com/coworking/gurugram` &rarr; Loads Gurugram coworking, Cyber City skyline, Gurugram hubs.
2. [ ] `https://yourdomain.com/coworking/noida` &rarr; Loads Noida coworking, Noida Expressway skyline, Noida hubs.
3. [ ] `https://yourdomain.com/coworking/delhi` &rarr; Loads Delhi coworking, India Gate landmark, Delhi hubs.
4. [ ] `https://yourdomain.com/office/gurugram` &rarr; Loads Gurugram managed offices and enterprise options.
5. [ ] `https://yourdomain.com/office/noida` &rarr; Loads Noida managed offices.
6. [ ] `https://yourdomain.com/office/delhi` &rarr; Loads Delhi managed offices.
7. [ ] **Submit a Test Lead**: Fill in the form on any route and verify that:
   - Form validates all fields inline.
   - Button shows "Submitting Inquiry...".
   - Browser redirects to `/thank-you`.
   - New row appears instantly in your connected Google Sheet.

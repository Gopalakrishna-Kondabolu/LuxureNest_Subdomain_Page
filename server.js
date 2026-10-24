/**
 * Luxure Nest - Local Development Server (Zero Dependencies)
 * 
 * Uses standard Node.js built-in modules ('http', 'fs', 'path') to serve static assets
 * and route clean URLs (/coworking/*, /office/*) to index.html for testing.
 * 
 * Run with:
 *   node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // 0. Handle Lead Submission Endpoint
  if (req.method === 'POST' && pathname === '/api/submit-lead') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) {
        req.socket.destroy();
      }
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        console.log(`[Server] Received Lead Submission at ${new Date().toISOString()}:`);
        console.log(`  Name: ${payload.googleSheetRow?.Name}`);
        console.log(`  Requirement: ${payload.googleSheetRow?.Requirement}`);
        console.log(`  Company: ${payload.googleSheetRow?.['Company Name']}`);
        console.log(`  Date of Visit: ${payload.googleSheetRow?.['Date of Site Visit']}`);
        console.log(`  Time of Visit: ${payload.googleSheetRow?.['Time of Site Visit']}`);

        // Resilience testing hook (?simulate_error=true)
        if (parsedUrl.query && parsedUrl.query.includes('simulate_error=true')) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Simulated server error for resilience testing' }));
          return;
        }

        if (!payload.googleSheetRow || !payload.googleSheetRow.Name) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Missing required lead fields' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: 'Lead received successfully',
          leadId: 'LN-' + Date.now()
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Malformed JSON payload' }));
      }
    });
    return;
  }

  // 1. Check if asset requested relative to clean URL (e.g. /office/noida/css/base.css)
  const assetMatch = pathname.match(/^\/(?:coworking|office)(?:\/[^\/]+)?\/(css|js|data|assets)\/(.*)$/i);
  if (assetMatch) {
    const cleanAssetPath = path.join(ROOT_DIR, assetMatch[1], assetMatch[2]);
    try {
      if (fs.existsSync(cleanAssetPath) && fs.statSync(cleanAssetPath).isFile()) {
        serveFile(cleanAssetPath, res);
        return;
      }
    } catch (e) {
      // Fall through
    }
  }

  // 2. Check if direct file exists
  const directPath = path.join(ROOT_DIR, pathname.startsWith('/') ? pathname.slice(1) : pathname);
  try {
    if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
      serveFile(directPath, res);
      return;
    }
  } catch (e) {
    // Fall through
  }

  // 3. Clean URL route rewrites:
  // If route matches /coworking/* or /office/* or root /, serve index.html
  const isServiceRoute = /^\/(coworking|office)(\/.*)?$/i.test(pathname);
  if (pathname === '/' || isServiceRoute) {
    serveFile(path.join(ROOT_DIR, 'index.html'), res);
    return;
  }

  // 4. Thank You route rewrite
  if (/^\/thank-you(\.html)?$/i.test(pathname)) {
    serveFile(path.join(ROOT_DIR, 'thank-you.html'), res);
    return;
  }

  // 5. Default: Serve index.html
  serveFile(path.join(ROOT_DIR, 'index.html'), res);
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Luxure Nest Development Server Running!`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(` Target Routes:`);
  console.log(`   - http://localhost:${PORT}/coworking/gurugram`);
  console.log(`   - http://localhost:${PORT}/coworking/noida`);
  console.log(`   - http://localhost:${PORT}/coworking/delhi`);
  console.log(`   - http://localhost:${PORT}/office/gurugram`);
  console.log(`   - http://localhost:${PORT}/office/noida`);
  console.log(`   - http://localhost:${PORT}/office/delhi`);
  console.log(`=======================================================`);
});

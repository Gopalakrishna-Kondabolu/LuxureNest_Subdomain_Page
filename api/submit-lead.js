/**
 * Luxure Nest - Vercel Serverless Function: Resilient Lead Submission Handler
 * 
 * Target Endpoint: /api/submit-lead
 * Architecture: Serverless proxy to Google Apps Script with input validation,
 * honeypot spam protection, idempotency handling, and bounded retries.
 */

const https = require('https');
const crypto = require('crypto');

const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxuJ31ptHdf-L_mCay2ZleRnCISmmzJnxV5VCIeTj5Cx15PYjwGZNRgz7RcbLodY_8N/exec';

// Serverless instance idempotency cache
const idempotencyCache = new Map();
const IDEMPOTENCY_TTL_MS = 60 * 1000;

function forwardWithRetry(payload, maxRetries = 2) {
  return new Promise((resolve, reject) => {
    let attempt = 0;

    function execute() {
      attempt++;
      try {
        const webhookUrl = new URL(GOOGLE_SHEET_WEBHOOK_URL);
        const postData = JSON.stringify(payload);
        const reqOptions = {
          hostname: webhookUrl.hostname,
          path: webhookUrl.pathname + (webhookUrl.search || ''),
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
            'Content-Length': Buffer.byteLength(postData)
          },
          timeout: 15000
        };

        const gasReq = https.request(reqOptions, (gasRes) => {
          let body = '';
          gasRes.on('data', chunk => { body += chunk; });
          gasRes.on('end', () => {
            if (gasRes.statusCode >= 200 && gasRes.statusCode < 400) {
              resolve({ statusCode: gasRes.statusCode, body });
            } else if (attempt <= maxRetries) {
              const delay = attempt * 1000 + Math.floor(Math.random() * 300);
              setTimeout(execute, delay);
            } else {
              reject(new Error(`Google Apps Script returned HTTP ${gasRes.statusCode}`));
            }
          });
        });

        gasReq.on('timeout', () => {
          gasReq.destroy();
          if (attempt <= maxRetries) {
            setTimeout(execute, 1000);
          } else {
            reject(new Error('Google Apps Script request timed out'));
          }
        });

        gasReq.on('error', (err) => {
          if (attempt <= maxRetries) {
            setTimeout(execute, 1000);
          } else {
            reject(err);
          }
        });

        gasReq.write(postData);
        gasReq.end();
      } catch (err) {
        reject(err);
      }
    }

    execute();
  });
}

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-idempotency-key, x-luxure-sandbox');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        return res.status(400).json({ success: false, error: 'Malformed JSON payload' });
      }
    }

    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ success: false, error: 'Empty request payload' });
    }

    // 1. Honeypot check
    if (payload._hp_company_website || (payload.completeLeadRecord && payload.completeLeadRecord._hp_company_website)) {
      return res.status(200).json({
        success: true,
        message: 'Inquiry received',
        leadId: 'LN-DEF-' + Date.now()
      });
    }

    // 2. Validate input
    const row = payload.googleSheetRow || {};
    const lead = payload.completeLeadRecord || {};
    const name = (row['Name'] || lead.fullName || '').trim();

    if (!name || name.length < 2) {
      return res.status(400).json({ success: false, error: 'A valid Name is required (minimum 2 characters)' });
    }

    // 3. Idempotency check
    const idempotencyKey = req.headers['x-idempotency-key'] ||
      payload.idempotencyKey ||
      crypto.createHash('sha256').update(`${name}-${row['Company Name'] || lead.companyName}-${row['Requirement'] || lead.service}-${lead.phone || ''}`).digest('hex');

    const now = Date.now();
    if (idempotencyCache.has(idempotencyKey)) {
      const cached = idempotencyCache.get(idempotencyKey);
      if (now - cached.timestamp < IDEMPOTENCY_TTL_MS) {
        return res.status(200).json(cached.response);
      }
    }

    // 4. Sandbox mode check
    const isSandbox = Boolean(
      req.query.sandbox === 'true' ||
      payload.isTest === true ||
      req.headers['x-luxure-sandbox'] === 'true'
    );

    const leadId = 'LN-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();

    if (isSandbox) {
      const successResponse = {
        success: true,
        isSandbox: true,
        message: 'Lead safely recorded in isolated test store',
        leadId
      };
      idempotencyCache.set(idempotencyKey, { timestamp: now, response: successResponse });
      return res.status(200).json(successResponse);
    }

    // 5. Forward to Google Apps Script with retry
    await forwardWithRetry(payload, 2);

    const successResponse = {
      success: true,
      message: 'Lead safely recorded and synchronized with Google Sheets',
      leadId
    };

    idempotencyCache.set(idempotencyKey, { timestamp: now, response: successResponse });
    return res.status(200).json(successResponse);

  } catch (error) {
    console.error('[API Submit Lead] Error:', error.message);
    return res.status(502).json({
      success: false,
      error: 'Upstream synchronization error. Please retry or contact our advisory desk directly.'
    });
  }
};

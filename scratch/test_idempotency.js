const http = require('http');

const fixedKey = 'fixed_idempotency_key_test_123';

function send(idx) {
  return new Promise((resolve) => {
    const testPayload = {
      isTest: true,
      idempotencyKey: fixedKey,
      googleSheetRow: {
        'Name': 'Idempotency User',
        'Date of Site Visit': '2026-11-01',
        'Time of Site Visit': '10:00 AM – 12:00 PM',
        'Requirement': 'Coworking',
        'Company Name': 'Idempotency Corp',
        'Assigned To': '',
        'Status': 'New Lead'
      },
      completeLeadRecord: {
        fullName: 'Idempotency User',
        phone: '9876543210',
        workEmail: 'test@idempotency.com',
        companyName: 'Idempotency Corp',
        service: 'Coworking',
        teamSize: '6-20',
        isDecisionMaker: 'Yes'
      }
    };

    const postData = JSON.stringify(testPayload);

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/submit-lead?sandbox=true',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-idempotency-key': fixedKey,
        'x-luxure-sandbox': 'true'
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ idx, status: res.statusCode, body: JSON.parse(body) });
      });
    });
    req.write(postData);
    req.end();
  });
}

async function run() {
  const r1 = await send(1);
  console.log('Submission 1 leadId:', r1.body.leadId);
  const r2 = await send(2);
  console.log('Submission 2 (retry) leadId:', r2.body.leadId);
  console.log('Matches (Idempotent):', r1.body.leadId === r2.body.leadId);
}

run();

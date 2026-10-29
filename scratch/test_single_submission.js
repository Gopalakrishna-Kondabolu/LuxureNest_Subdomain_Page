const http = require('http');

const testPayload = {
  isTest: true,
  idempotencyKey: 'test_ik_' + Date.now(),
  googleSheetRow: {
    'Name': 'Test User Concurrency Audit',
    'Date of Site Visit': '2026-11-01',
    'Time of Site Visit': '10:00 AM – 12:00 PM',
    'Requirement': 'Coworking',
    'Company Name': 'Acme Testing Corp',
    'Assigned To': '',
    'Status': 'New Lead'
  },
  completeLeadRecord: {
    fullName: 'Test User Concurrency Audit',
    phone: '9876543210',
    workEmail: 'test@acmetesting.com',
    companyName: 'Acme Testing Corp',
    service: 'Coworking',
    teamSize: '6-20',
    isDecisionMaker: 'Yes',
    preferredMicroMarket: 'Cyber City',
    city: 'Gurugram'
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
    'x-luxure-sandbox': 'true'
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${body}`);
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.write(postData);
req.end();

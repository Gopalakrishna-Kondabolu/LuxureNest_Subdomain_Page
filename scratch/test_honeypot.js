const http = require('http');

const testPayload = {
  isTest: true,
  _hp_company_website: 'http://spam-bot.xyz',
  googleSheetRow: {
    'Name': 'Bot Spammer',
    'Requirement': 'Coworking'
  },
  completeLeadRecord: {
    fullName: 'Bot Spammer',
    _hp_company_website: 'http://spam-bot.xyz'
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
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response: ${body}`);
  });
});

req.write(postData);
req.end();

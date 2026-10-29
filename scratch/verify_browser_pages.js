const { spawn } = require('child_process');
const http = require('http');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const DEBUG_PORT = 9223;

const ROUTES = [
  '/coworking/gurugram',
  '/coworking/noida',
  '/coworking/delhi',
  '/office/gurugram',
  '/office/noida',
  '/office/delhi'
];

const VIEWPORTS = [
  { width: 375, height: 667, name: 'Mobile SE' },
  { width: 390, height: 844, name: 'Mobile 13' },
  { width: 768, height: 1024, name: 'Tablet iPad' },
  { width: 1280, height: 800, name: 'Laptop Small' },
  { width: 1440, height: 900, name: 'Desktop Widescreen' }
];

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    }).on('error', reject);
  });
}

class SimpleCDP {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    const WebSocket = require('ws');
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
      this.ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message));
          else cb.resolve(msg.result);
        }
      });
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function startEdge() {
  const edge = spawn(EDGE_PATH, [
    `--remote-debugging-port=${DEBUG_PORT}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=C:\\Users\\gopal\\.gemini\\antigravity-ide\\brain\\e21b4807-997f-41ac-9e5e-5c178820d082\\scratch\\edge_test_profile'
  ]);
  await new Promise(r => setTimeout(r, 1500));
  return edge;
}

async function run() {
  let edgeProc = null;
  try {
    edgeProc = await startEdge();
    const versionInfo = await getJson(`http://localhost:${DEBUG_PORT}/json/version`);
    console.log('Connected to Headless Edge CDP:', versionInfo.Browser);

    const tabs = await getJson(`http://localhost:${DEBUG_PORT}/json`);
    const target = tabs.find(t => t.type === 'page') || tabs[0];
    const client = new SimpleCDP(target.webSocketDebuggerUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    console.log('\n--- VERIFYING 6 ROUTES AND 5 VIEWPORT SIZES ---');

    for (const route of ROUTES) {
      console.log(`\nTesting Route: ${route}`);
      await client.send('Page.navigate', { url: `http://localhost:3000${route}` });
      await new Promise(r => setTimeout(r, 1200));

      for (const vp of VIEWPORTS) {
        await client.send('Emulation.setDeviceMetricsOverride', {
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: 1,
          mobile: vp.width <= 768
        });
        await new Promise(r => setTimeout(r, 200));

        const evalRes = await client.send('Runtime.evaluate', {
          expression: `
            (() => {
              const scrollW = document.documentElement.scrollWidth;
              const innerW = window.innerWidth;
              const hasOverflow = scrollW > innerW;
              const brokenImages = Array.from(document.querySelectorAll('img'))
                .filter(img => img.naturalWidth === 0 && img.loading !== 'lazy')
                .map(img => img.src);
              const heroBg = window.getComputedStyle(document.getElementById('hero') || document.body).backgroundImage;
              return {
                scrollW,
                innerW,
                hasOverflow,
                brokenImagesCount: brokenImages.length,
                heroBgSet: heroBg && heroBg !== 'none'
              };
            })()
          `,
          returnByValue: true
        });

        const data = evalRes.result.value;
        const statusStr = data.hasOverflow ? 'OVERFLOW ERROR' : 'OK (No Overflow)';
        console.log(`  [${vp.name} ${vp.width}x${vp.height}]: ${statusStr} | Broken Images: ${data.brokenImagesCount} | Hero BG: ${data.heroBgSet ? 'Loaded' : 'Missing'}`);
      }
    }

    client.close();
  } catch (err) {
    console.error('Browser testing error:', err.message);
  } finally {
    if (edgeProc) edgeProc.kill();
  }
}

run();

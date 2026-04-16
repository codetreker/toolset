#!/usr/bin/env node
/**
 * screenshot.js — 截图一个或多个 URL
 * 
 * Usage:
 *   node screenshot.js <url> [output.png] [--mobile] [--auth /tmp/auth.json] [--full]
 * 
 * Examples:
 *   node screenshot.js https://example.com
 *   node screenshot.js https://example.com /tmp/out.png --mobile
 *   node screenshot.js https://example.com /tmp/out.png --auth /tmp/cf_auth.json --full
 */
const { chromium } = require('/home/ubuntu/.nvm/versions/node/v24.14.1/lib/node_modules/playwright');

const args = process.argv.slice(2);
const url = args[0];
if (!url) { console.error('Usage: node screenshot.js <url> [output.png] [--mobile] [--auth path] [--full]'); process.exit(1); }

const output = args.find(a => a.endsWith('.png')) || '/tmp/screenshot.png';
const mobile = args.includes('--mobile');
const full = args.includes('--full');
const authIdx = args.indexOf('--auth');
const authPath = authIdx >= 0 ? args[authIdx + 1] : null;

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const ctxOptions = {
    viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 800 }
  };
  if (authPath) ctxOptions.storageState = authPath;
  
  const context = await browser.newContext(ctxOptions);
  const page = await context.newPage();
  
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.screenshot({ path: output, fullPage: full });
  
  console.log('title:', await page.title());
  console.log('url:', page.url());
  console.log('saved:', output);
  
  await browser.close();
})();

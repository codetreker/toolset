#!/usr/bin/env node
/**
 * cf-login.js — Cloudflare Access OTP 登录，保存 session state
 * 
 * Step 1: 发送 OTP
 *   node cf-login.js send <url> <email> [--state /tmp/cf_auth.json]
 * 
 * Step 2: 提交 OTP（拿到验证码后）
 *   node cf-login.js verify <verify-url> <otp-code> [--state /tmp/cf_auth.json]
 */
const { chromium } = require('/home/ubuntu/.nvm/versions/node/v24.14.1/lib/node_modules/playwright');

const [,, action, ...rest] = process.argv;

async function send(url, email, statePath) {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  
  await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
  await page.fill('input[type="email"]', email);
  await page.click('input[type="submit"], button[type="submit"]');
  await page.waitForTimeout(3000);
  
  console.log('verify-url:', page.url());
  if (statePath) await context.storageState({ path: statePath });
  await browser.close();
  console.log('OTP email sent to', email);
}

async function verify(verifyUrl, code, statePath) {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  
  await page.goto(verifyUrl, { waitUntil: 'networkidle', timeout: 20000 });
  await page.fill('input[type="text"], input[name="code"]', code);
  await page.click('input[type="submit"], button[type="submit"]');
  await page.waitForTimeout(4000);
  
  const finalUrl = page.url();
  console.log('final-url:', finalUrl);
  
  if (finalUrl.includes('cloudflareaccess.com')) {
    console.error('ERROR: Still on Cloudflare login page — OTP may be wrong or expired');
    process.exit(1);
  }
  
  if (statePath) {
    await context.storageState({ path: statePath });
    console.log('Auth state saved to', statePath);
  }
  
  await browser.close();
  console.log('Login successful');
}

const stateIdx = rest.indexOf('--state');
const statePath = stateIdx >= 0 ? rest[stateIdx + 1] : '/tmp/cf_auth.json';

if (action === 'send') {
  const [url, email] = rest;
  if (!url || !email) { console.error('Usage: node cf-login.js send <url> <email>'); process.exit(1); }
  send(url, email, statePath);
} else if (action === 'verify') {
  const [verifyUrl, code] = rest;
  if (!verifyUrl || !code) { console.error('Usage: node cf-login.js verify <verify-url> <code>'); process.exit(1); }
  verify(verifyUrl, code, statePath);
} else {
  console.error('Unknown action. Use: send | verify');
  process.exit(1);
}

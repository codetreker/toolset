# Cloudflare Access OTP 登录

## 完整流程

### Step 1：发送 OTP

```js
const { chromium } = require('/home/ubuntu/.nvm/versions/node/v24.14.1/lib/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  
  await page.goto('https://your-app.example.com', { waitUntil: 'networkidle', timeout: 20000 });
  
  // 填邮箱，提交
  await page.fill('input[type="email"]', 'user@example.com');
  await page.click('input[type="submit"], button[type="submit"]');
  await page.waitForTimeout(3000);
  
  // 保存 verify URL 供后续使用
  console.log('verify-url:', page.url());
  
  // 保存 session state
  await context.storageState({ path: '/tmp/cf_state.json' });
  await browser.close();
  console.log('OTP sent');
})();
```

执行后告知相关人员查收邮件拿验证码。

### Step 2：填入 OTP（收到验证码后）

```js
const { chromium } = require('/home/ubuntu/.nvm/versions/node/v24.14.1/lib/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  
  // 直接访问 verify URL（从 Step 1 的 console 输出里拿）
  await page.goto('VERIFY_URL_FROM_STEP1', { waitUntil: 'networkidle', timeout: 20000 });
  
  // 填验证码（6位数字）
  await page.fill('input[type="text"]', 'OTP_CODE');
  await page.click('input[type="submit"], button[type="submit"]');
  await page.waitForTimeout(4000);
  
  console.log('after otp url:', page.url()); // 成功时会跳回原始 URL
  
  // 保存登录态供后续复用
  await context.storageState({ path: '/tmp/cf_auth.json' });
  await browser.close();
})();
```

### Step 3：用已登录状态截图

```js
const context = await browser.newContext({
  storageState: '/tmp/cf_auth.json',
  viewport: { width: 390, height: 844 }
});
```

## 注意事项

- Cloudflare OTP 10 分钟过期，Step 1 和 Step 2 要在同一个 nonce session 内完成
- verify URL 包含 nonce，不能复用于不同 session
- 登录态（cf_auth.json）可以保存复用，避免每次都走 OTP 流程
- 如果跳转后 URL 还是 cloudflareaccess.com，说明 OTP 填错了

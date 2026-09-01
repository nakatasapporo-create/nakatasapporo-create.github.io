const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const apps = require('../apps-data.js');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'thumbnails');
const VIEWPORT = { width: 1280, height: 800 };
const NAV_TIMEOUT_MS = 45000;
const WAIT_AFTER_LOAD_MS = 1800;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function captureOne(browser, app, index, total) {
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    locale: 'ja-JP',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36 AppSuiteThumbnailBot/1.0'
  });
  const page = await context.newPage();
  const outPath = path.join(OUT_DIR, `${app.id}.jpg`);
  console.log(`[${index + 1}/${total}] ${app.title}\n    ${app.path}`);
  try {
    page.setDefaultNavigationTimeout(NAV_TIMEOUT_MS);
    await page.goto(app.path, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS });
    await Promise.race([page.waitForLoadState('networkidle', { timeout: 7000 }).catch(() => {}), sleep(7000)]);
    await sleep(WAIT_AFTER_LOAD_MS);
    await page.addStyleTag({ content: `*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}html{scroll-behavior:auto!important}::-webkit-scrollbar{display:none!important}` }).catch(() => {});
    await page.evaluate(() => window.scrollTo(0, 0)).catch(() => {});
    await page.screenshot({ path: outPath, type: 'jpeg', quality: 82, fullPage: false });
    console.log(`    ✓ ${path.relative(ROOT, outPath)}`);
    return { ok: true, app: app.id };
  } catch (error) {
    console.warn(`    ⚠ 取得失敗: ${error.message}`);
    return { ok: false, app: app.id, error: error.message };
  } finally {
    await context.close();
  }
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--disable-dev-shm-usage'] });
  const results = [];
  try {
    for (let i = 0; i < apps.length; i++) results.push(await captureOne(browser, apps[i], i, apps.length));
  } finally { await browser.close(); }
  const succeeded = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok);
  const now = new Date();
  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify({ updatedAt: now.toISOString(), version: String(now.getTime()), total: apps.length, succeeded, failed: failed.map(x => ({ id: x.app, error: x.error })) }, null, 2) + '\n');
  console.log(`\n完了: ${succeeded}/${apps.length} 件`);
  if (!succeeded) process.exitCode = 1;
})().catch(error => { console.error(error); process.exit(1); });

import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { openBrowser, sleep } from './cdp.mjs';

const baseUrl = process.env.ASCENTA_WEB_URL || 'http://localhost:5175';
const output = resolve(process.argv[2] || 'docs/evidence/current');
const report = { baseUrl, capturedAt: new Date().toISOString(), pages: [], interactions: [], jsErrorEvents: 0, jsErrors: [], consoleErrors: [], failedResources: [], httpErrors: [] };
const health = await (await fetch(new URL('/api/v1/health', process.env.ASCENTA_API_URL || 'http://localhost:4000'))).json();
report.dataMode = health.data?.dataMode;
await mkdir(output, { recursive: true });
const browser = await openBrowser();
let context = 'initializing';
const requests = new Map();
const exceptionCounts = new Map();
browser.listeners.add(({ method, params: p }) => {
  if (method === 'Runtime.exceptionThrown') {
    report.jsErrorEvents++;
    const error = p.exceptionDetails.exception?.description || p.exceptionDetails.text;
    const key = context + '\n' + error;
    if (exceptionCounts.has(key)) exceptionCounts.get(key).occurrences++;
    else { const item = { context, error, occurrences: 1 }; exceptionCounts.set(key,item); report.jsErrors.push(item); }
  }
  if (method === 'Runtime.consoleAPICalled' && p.type === 'error') report.consoleErrors.push({ context, error: p.args.map(arg => arg.value || arg.description || arg.type).join(' ') });
  if (method === 'Network.requestWillBeSent') requests.set(p.requestId, { url: p.request.url, method: p.request.method });
  if (method === 'Network.loadingFailed') report.failedResources.push({ context, ...requests.get(p.requestId), error: p.errorText, canceled: p.canceled || false });
  if (method === 'Network.responseReceived' && p.response.status >= 400) report.httpErrors.push({ context, url: p.response.url, status: p.response.status });
});
const go = async route => {
  const result = await browser.send('Page.navigate', { url: new URL(route, baseUrl).href });
  if (result.errorText) throw new Error(result.errorText);
  await browser.waitFor(`document.readyState === 'complete' && !!document.querySelector('main') && !!document.querySelector('.site-header')`);
  await browser.waitFor(`!!document.querySelector('.site-header') && Object.keys(document.querySelector('.site-header')).some(key => key.startsWith('__reactProps'))`, 60000);
  await browser.evaluate('document.fonts.ready');
  await browser.waitFor(`[...document.images].filter(x => { const r=x.getBoundingClientRect(); return r.width>0 && r.top<innerHeight && r.bottom>0; }).every(x=>x.complete)`, 20000);
  await sleep(550);
};
const capture = async name => {
  const snapshot = await browser.evaluate(`({ url: location.pathname + location.search, title: document.title, language: document.documentElement.lang,
    h1: [...document.querySelectorAll('h1')].map(el=>el.textContent.trim()),
    viewport:{width:innerWidth,height:innerHeight}, documentWidth:document.documentElement.scrollWidth,
    bodyText:document.body.innerText, links:[...document.querySelectorAll('a[href]')].map(el=>({text:el.textContent.trim(),href:el.getAttribute('href')})),
    buttons:[...document.querySelectorAll('button')].map(el=>({text:el.textContent.trim(),label:el.getAttribute('aria-label'),disabled:el.disabled})),
    fields:[...document.querySelectorAll('input,select,textarea')].map(el=>({id:el.id,type:el.type,required:el.required,disabled:el.disabled,placeholder:el.getAttribute('placeholder')})),
    assets:[...document.images].map(el=>({src:el.getAttribute('src'),currentSrc:el.currentSrc,alt:el.alt,naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight})),
    h1Style:(()=>{const heading=document.querySelector('h1');if(!heading)return null;const style=getComputedStyle(heading);return {fontFamily:style.fontFamily,fontSize:style.fontSize,color:style.color}})(),
    visibleBrokenImages:[...document.images].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.top<innerHeight&&r.bottom>0&&(!el.complete||el.naturalWidth===0)}).map(el=>el.src)
  })`);
  await browser.screenshot(join(output, `${name}.png`));
  report.pages.push({ name, screenshot: `${name}.png`, ...snapshot });
  console.log(JSON.stringify({ capture: name, route: snapshot.url, width: snapshot.viewport.width, overflow: snapshot.documentWidth > snapshot.viewport.width, brokenImages: snapshot.visibleBrokenImages.length }));
};
const check = async (name, action) => {
  context = name;
  try { const details = await action(); const passed = details?.skipped ? null : true; report.interactions.push({ name, passed, details }); console.log(JSON.stringify({ interaction: name, passed, ...(details?.skipped ? { skipped: details.skipped } : {}) })); }
  catch (error) { report.interactions.push({ name, passed: false, error: error.message }); console.error(`${name}: ${error.message}`); }
};
try {
  for (const [viewport, width, height] of process.env.ASCENTA_CAPTURE_INTERACTIONS_ONLY === '1' ? [] : [['desktop',1440,1000],['mobile',390,844]]) {
    await browser.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: viewport === 'mobile' });
    for (const route of ['/', '/services', '/fleet', '/business', '/contact', '/help', '/privacy', '/terms', '/booking', '/login', '/dashboard', '/account', '/corporate', '/corporate/usage', '/admin']) {
      context = `${viewport} ${route}`;
      try { await go(route); await capture(`${route === '/' ? 'home' : route.slice(1).replaceAll('/','-')}-${viewport}`); }
      catch (error) { report.pages.push({ name: context, error: error.message }); console.error(context + ': ' + error.message); }
    }
  }
  await browser.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await check('Mobile menu navigates to services', async () => {
    await go('/'); await browser.click('.mobile-menu-button');
    await browser.waitFor(`!!document.querySelector('#mobile-navigation')`);
    await capture('home-mobile-menu'); await browser.click('#mobile-navigation a[href="/services"]');
    await browser.waitFor(`location.pathname === '/services'`);
  });
  await browser.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await check('Spanish toggle and persistent language across navigation', async () => {
    await go('/'); await browser.click('.language-button');
    await browser.waitFor(`document.documentElement.lang === 'es'`); await capture('home-spanish-desktop');
    await go('/services'); await browser.waitFor(`document.documentElement.lang === 'es'`);
    await browser.click('.language-button'); await browser.waitFor(`document.documentElement.lang === 'en'`);
  });
  await check('Hourly journey and draft transfer from home', async () => {
    await go('/');
    await browser.evaluate(`document.querySelectorAll('button').forEach(el=>{if(el.textContent.trim()==='By the hour')el.dataset.browserCheck='hourly'})`);
    await browser.click('[data-browser-check="hourly"]');
    await browser.waitFor(`!!document.querySelector('#home-hours')`); await capture('home-hourly-desktop');
    await browser.fill('#home-pickup','Boston Logan Airport');
    await browser.fill('#home-date',new Date(Date.now()+7*86400000).toISOString().slice(0,10));
    await browser.fill('#home-time','14:30');
    await browser.click('.starter-submit');
    await browser.waitFor(`location.pathname==='/booking' && document.querySelector('#trip-pickup')?.value==='Boston Logan Airport'`);
    await capture('booking-home-draft');
    return await browser.evaluate(`({route:location.pathname,storageKeys:Object.keys(sessionStorage),service:document.querySelector('#trip-service')?.value})`);
  });
  await check('Help accordion opens', async () => {
    await go('/help'); await browser.click('.faq-list summary');
    await browser.waitFor(`document.querySelector('.faq-list details').open`); await capture('help-accordion');
  });
  await check('Contact submission is an explicit unavailable placeholder', async () => {
    await go('/contact?topic=Corporate%20travel');
    await browser.waitFor(`document.querySelector('#contact-topic')?.value==='Corporate travel'`);
    if (!await browser.evaluate(`document.querySelector('.form-panel button[type="submit"]').disabled`)) throw Error('Contact button unexpectedly enabled');
  });
  await check('Registration and recovery screens are accessible', async () => {
    await go('/login?mode=register'); await browser.waitFor(`!!document.querySelector('#account-name')`); await capture('login-register');
    await go('/login?mode=forgot'); await capture('login-forgot');
    await go('/login?mode=verify'); await capture('login-verify');
  });
  await check('Router hash links and browser back/forward preserve navigation', async () => {
    await go('/services'); await browser.click('.desktop-nav a[href="/#experience"]');
    await browser.waitFor(`location.pathname==='/' && location.hash==='#experience' && !!document.querySelector('#experience') && scrollY>100`);
    await browser.waitFor(`Math.abs(document.querySelector('#experience').getBoundingClientRect().top)<180`);
    await browser.click('.desktop-nav a[href="/help"]'); await browser.waitFor(`location.pathname==='/help'`);
    await browser.evaluate('history.back()'); await browser.waitFor(`location.pathname==='/'&&location.hash==='#experience'&&scrollY>100`);
    await browser.evaluate('history.forward()'); await browser.waitFor(`location.pathname==='/help'`);
    await go('/'); await browser.click('.desktop-nav a[href="/#experience"]');
    await browser.waitFor(`location.hash==='#experience'&&scrollY>100`);
  });
  await check('Authentication tabs synchronize same-path query modes', async () => {
    await go('/login');
    await browser.evaluate(`document.querySelectorAll('.auth-tabs button').forEach(el=>{if(el.textContent.trim()==='Create account')el.dataset.browserCheck='register'})`);
    await browser.click('[data-browser-check="register"]'); await browser.waitFor(`!!document.querySelector('#account-name')&&new URLSearchParams(location.search).get('mode')==='register'`);
    await browser.evaluate(`document.querySelectorAll('.auth-tabs button').forEach(el=>{if(el.textContent.trim()==='Sign in')el.dataset.browserCheck='login'})`);
    await browser.click('[data-browser-check="login"]'); await browser.waitFor(`!!document.querySelector('#account-password')&&!document.querySelector('#account-name')&&new URLSearchParams(location.search).get('mode')==='login'`);
  });
  await check('Unknown route and direct reload show the recovery page', async () => {
    await go('/browser-check-missing-route'); await browser.waitFor(`document.body.innerText.includes('This page does not exist.')`);
    await browser.send('Page.reload'); await browser.waitFor(`document.body.innerText.includes('This page does not exist.')`);
    await browser.click('main a.button[href="/"]'); await browser.waitFor(`location.pathname==='/'&&!!document.querySelector('.hero')`);
  });
  await check('Sign-in, authenticated account, reload and logout', async () => {
    const health = await (await fetch(new URL('/api/v1/health', process.env.ASCENTA_API_URL || 'http://localhost:4000'))).json();
    const email = process.env.ASCENTA_BROWSER_EMAIL || (health.data?.dataMode === 'demo' ? 'demo.customer@ascenta.local' : null);
    const password = process.env.ASCENTA_BROWSER_PASSWORD || (health.data?.dataMode === 'demo' ? 'AscentaDemo!2026' : null);
    if (!email || !password) return { skipped: 'The API uses MySQL. Provide ASCENTA_BROWSER_EMAIL and ASCENTA_BROWSER_PASSWORD for a verified local test account to exercise browser authentication.' };
    await go('/login?next=%2Fdashboard');
    await browser.fill('#account-email',email);
    await browser.fill('#account-password',password);
    await browser.click('.auth-card button[type="submit"]');
    await browser.waitFor(`location.pathname==='/dashboard' && !!document.querySelector('.portal-sidebar') && !document.querySelector('.loading')`);
    await capture('dashboard-authenticated');
    await browser.send('Page.reload');
    await browser.waitFor(`!!document.querySelector('.portal-sidebar') && !document.querySelector('.loading')`);
    await go('/account'); await browser.waitFor(`document.querySelector('#profile-email')?.value===${JSON.stringify(email)}`); await capture('account-authenticated');
    await browser.click('.signout'); await browser.waitFor(`location.pathname==='/'`);
  });
  await check('Header changes after scroll and lower home imagery loads', async () => {
    await go('/'); await browser.evaluate('window.scrollTo(0,innerHeight)'); await sleep(800); await capture('home-scrolled');
    await browser.evaluate('window.scrollTo(0,document.documentElement.scrollHeight-innerHeight)'); await sleep(800); await capture('home-footer');
  });
} finally {
  report.finishedAt = new Date().toISOString();
  report.success = report.pages.every(page => !page.error && !page.visibleBrokenImages?.length && page.documentWidth <= page.viewport.width + 1) && report.interactions.every(item => item.passed !== false) && report.jsErrors.length === 0 && report.consoleErrors.length === 0;
  await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));
  await browser.close();
  console.log(JSON.stringify({ success:report.success,pages:report.pages.length,interactions:report.interactions.length,jsErrors:report.jsErrors.length,consoleErrors:report.consoleErrors.length,report:join(output,'report.json') }));
  if (!report.success) process.exitCode=1;
}

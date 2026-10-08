import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { openBrowser, sleep } from './cdp.mjs';

// Exercise the real React application and API without creating users or requests.
// Uses the repository's isolated Edge/CDP harness; no extra browser dependency.
const baseUrl = process.env.ASCENTA_WEB_URL || 'http://localhost:5175';
const apiUrl = process.env.ASCENTA_API_URL || 'http://localhost:4000';
const output = resolve(process.argv[2] || 'docs/evidence/modernization');
await mkdir(output, { recursive: true });
const report = {
  startedAt: new Date().toISOString(), baseUrl,
  policy: 'Read-only backend verification. Drafts stay in the isolated browser; no account, reservation, seed, or database mutation.',
  checks: [], screenshots: [], apiResponses: [], apiMutations: [], jsErrors: [], consoleErrors: [], networkErrors: [], limitations: [], success: false,
};
const check = (name, passed, details) => {
  report.checks.push({ name, passed: !!passed, ...(details === undefined ? {} : { details }) });
  console.log(JSON.stringify({ check: name, passed: !!passed }));
};
const scenario = async (name, run) => {
  try { await run(); }
  catch (error) { check(name, false, error.message); }
};
const futureDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(Date.now() + 8 * 86400000);
let backendAvailable = false;
await scenario('Node API and catalog are available', async () => {
  const healthResponse = await fetch(new URL('/api/v1/health', apiUrl), { signal: AbortSignal.timeout(10000) });
  const health = await healthResponse.json();
  report.backend = { status: healthResponse.status, dataMode: health.data?.dataMode, health: health.data?.status };
  check('Read-only API health succeeds', healthResponse.ok && health.data?.status === 'ok', report.backend);
  const catalogResponse = await fetch(new URL('/api/v1/catalog', apiUrl), { signal: AbortSignal.timeout(10000) });
  const catalog = await catalogResponse.json();
  backendAvailable = catalogResponse.ok && !!catalog.data?.vehicleClasses?.length;
  check('Read-only live catalog succeeds', backendAvailable, { status: catalogResponse.status, serviceTypes: catalog.data?.serviceTypes?.map(item => item.code), vehicleCount: catalog.data?.vehicleClasses?.length });
});
if (!backendAvailable) report.limitations.push('API/catalog was unavailable. Server-backed vehicle choices and MySQL communication could not be verified. No backend was mocked.');

const browser = await openBrowser();
browser.listeners.add(({ method, params: event }) => {
  if (method === 'Runtime.exceptionThrown') report.jsErrors.push(event.exceptionDetails.exception?.description || event.exceptionDetails.text);
  if (method === 'Runtime.consoleAPICalled' && event.type === 'error') report.consoleErrors.push(event.args.map(arg => arg.value || arg.description || arg.type).join(' '));
  if (method === 'Network.responseReceived' && event.response.url.includes('/api/v1/')) report.apiResponses.push({ url: event.response.url, status: event.response.status });
  if (method === 'Network.requestWillBeSent' && event.request.url.includes('/api/v1/') && !['GET', 'HEAD', 'OPTIONS'].includes(event.request.method)) report.apiMutations.push({ url: event.request.url, method: event.request.method });
  if (method === 'Log.entryAdded' && event.entry.level === 'error') {
    // An anonymous auth/me 401 is the application's normal session check.
    if (!(event.entry.url?.includes('/auth/me') && event.entry.text.includes('401'))) report.networkErrors.push({ text: event.entry.text, url: event.entry.url });
  }
});
const viewport = async (width, height) => {
  await browser.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  await sleep(200);
};
const go = async path => {
  await browser.send('Page.navigate', { url: new URL(path, baseUrl).href });
  await browser.waitFor(`document.readyState === 'complete' && !!document.querySelector('main') && !!document.querySelector('.site-header')`);
  await browser.waitFor(`Object.keys(document.querySelector('.site-header')).some(key => key.startsWith('__reactProps'))`);
  await browser.evaluate(`document.fonts.ready.then(() => true)`);
  await sleep(300);
};
const starterReady = () => browser.waitFor(`!!document.querySelector('.starter-submit') && !document.querySelector('.starter-submit').disabled`);
const reloadHome = async () => {
  await browser.evaluate(`window.__ascentaVerificationReload = true`);
  await browser.send('Page.reload');
  await browser.waitFor(`window.__ascentaVerificationReload !== true && document.readyState === 'complete' && !!document.querySelector('.starter-submit') && !document.querySelector('.starter-submit').disabled`);
};
const capture = async (name, selector) => {
  if (selector) await browser.evaluate(`(() => { const element = document.querySelector(${JSON.stringify(selector)}); const offset = ${JSON.stringify(selector)} === '.journey-starter' ? document.querySelector('.site-header').getBoundingClientRect().height + 24 : 0; window.scrollTo({top:element.getBoundingClientRect().top + scrollY - offset,behavior:'instant'}); })()`);
  else await browser.evaluate(`window.scrollTo({top:0,behavior:'instant'})`);
  await browser.evaluate(`Promise.all([...document.images].filter(img => !img.loading || img.loading !== 'lazy' || img.getBoundingClientRect().top < innerHeight).map(img => img.decode().catch(() => {})))`);
  await sleep(350);
  await browser.screenshot(join(output, name + '.png'));
  report.screenshots.push(name + '.png');
};
const key = async (value, code = value, windowsVirtualKeyCode) => {
  // Enter requires its character payload for native button activation in CDP.
  await browser.send('Input.dispatchKeyEvent', { type: 'keyDown', key: value, code, ...(value === 'Enter' ? { text: '\r', unmodifiedText: '\r' } : {}), ...(windowsVirtualKeyCode === undefined ? {} : { windowsVirtualKeyCode }) });
  await browser.send('Input.dispatchKeyEvent', { type: 'keyUp', key: value, code, ...(windowsVirtualKeyCode === undefined ? {} : { windowsVirtualKeyCode }) });
  await sleep(100);
};
const selectedMode = hourly => `.journey-modes button:nth-child(${hourly ? 2 : 1})`;
const draftValues = prefix => browser.evaluate(`(() => {
  const value = id => document.querySelector('#' + id)?.value;
  return { pickup: value('${prefix}-pickup'), destination: value('${prefix}-destination'), date: value('${prefix}-date'), time: value('${prefix}-time'), hours: value('${prefix}-hours'), mode: value('trip-mode') };
})()`);
const assertDraft = async (name, prefix, expected) => {
  const actual = await draftValues(prefix);
  check(name, Object.entries(expected).every(([field, value]) => actual[field] === value), actual);
};
const logo = async selector => browser.evaluate(`(async () => {
  const img = document.querySelector(${JSON.stringify(selector)});
  if (!img) throw Error('Logo not found: ' + ${JSON.stringify(selector)});
  await img.decode();
  const canvas = document.createElement('canvas'); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let transparent = 0, visible = 0;
  for (let i = 3; i < data.length; i += 4) { if (data[i] === 0) transparent++; if (data[i] > 128) visible++; }
  const pixels = canvas.width * canvas.height;
  const surface = img.closest('.brand-surface');
  return { src: new URL(img.currentSrc).pathname, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
    transparentFraction: transparent / pixels, visibleFraction: visible / pixels,
    cornerAlpha: [3, (canvas.width - 1) * 4 + 3, (pixels - canvas.width) * 4 + 3, (pixels - 1) * 4 + 3].map(i => data[i]),
    surfaceBackground: surface ? getComputedStyle(surface).backgroundColor : null };
})()`);
const assertTransparentLogo = (name, value) => check(name, value.transparentFraction > .3 && value.visibleFraction > .005 && value.cornerAlpha.every(alpha => alpha === 0) && (!value.surfaceBackground || value.surfaceBackground === 'rgba(0, 0, 0, 0)'), value);
const assertLayout = async (name, width, horizontal = false) => {
  const layout = await browser.evaluate(`(() => {
    const rect = el => { const r = el.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom}; };
    const form = document.querySelector('.starter-form');
    return { viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, forms: document.querySelectorAll('.starter-form').length,
      form: rect(form), modes: rect(document.querySelector('.journey-modes')), fields: [...form.children].map(rect),
      hero: rect(document.querySelector('.hero')), header: rect(document.querySelector('.site-header')),
      labels: [...form.querySelectorAll('input,select')].every(el => !!el.labels?.length) };
  })()`);
  check(name + ': no horizontal overflow and one responsive form', layout.documentWidth <= width + 1 && layout.forms === 1 && layout.fields.every(field => field.x >= -1 && field.right <= width + 1) && layout.labels, layout);
  if (horizontal) check(name + ': horizontal bar with centered mode selector above', layout.fields.every(field => Math.abs((field.y + field.height / 2) - (layout.fields[0].y + layout.fields[0].height / 2)) < 4) && layout.modes.bottom <= layout.form.y && Math.abs(layout.modes.x + layout.modes.width / 2 - (layout.form.x + layout.form.width / 2)) < 3 && layout.form.width > width * .7, layout);
};

try {
  await browser.send('Log.enable');
  await viewport(1440, 1000);
  await scenario('Desktop hero and adaptive header', async () => {
    await go('/'); await starterReady();
    check('Starter offers only One way and By the hour', await browser.evaluate(`JSON.stringify([...document.querySelectorAll('.journey-modes button')].map(el => el.textContent.trim())) === JSON.stringify(['One way','By the hour'])`));
    await assertLayout('Desktop', 1440, true);
    check('Header starts dark over photography', await browser.evaluate(`document.querySelector('.site-header').dataset.theme === 'dark'`));
    const darkSurfaceLogo = await logo('.site-header .brand-image');
    assertTransparentLogo('Light logo has real transparency over hero', darkSurfaceLogo);
    await capture('home-desktop');
    await browser.evaluate(`window.scrollTo({top:document.querySelector('#experience').getBoundingClientRect().top + scrollY,behavior:'instant'})`);
    await browser.waitFor(`document.querySelector('.site-header').dataset.theme === 'light' && document.querySelector('.site-header').dataset.raised === 'true'`);
    const lightSurfaceLogo = await logo('.site-header .brand-image');
    assertTransparentLogo('Dark logo has real transparency over light section', lightSurfaceLogo);
    check('React changes logo variant with header background', darkSurfaceLogo.src !== lightSurfaceLogo.src, { darkSurface: darkSurfaceLogo.src, lightSurface: lightSurfaceLogo.src });
    await capture('header-light-desktop', '#experience');
    await capture('services-desktop', '.services-section');
    await browser.evaluate(`document.querySelector('.site-footer').scrollIntoView({block:'start',behavior:'instant'})`);
    assertTransparentLogo('Footer logo uses a transparent light variant', await logo('.site-footer .brand-image'));
    check('Footer uses the same light logo family as dark header', (await logo('.site-footer .brand-image')).src === darkSurfaceLogo.src);
    await capture('footer-desktop', '.site-footer');
  });

  await scenario('One-way validation and booking persistence', async () => {
    await go('/'); await starterReady();
    await browser.click('.starter-submit');
    check('Empty required fields stop home navigation', await browser.evaluate(`location.pathname === '/' && !document.querySelector('.starter-form').checkValidity()`));
    await browser.fill('#home-pickup', 'Boston Logan International Airport');
    await browser.fill('#home-destination', 'Four Seasons Hotel Boston');
    await browser.fill('#home-date', '2020-01-01'); await browser.fill('#home-time', '14:30');
    await browser.click('.starter-submit');
    check('Past pickup time shows an error and stays on home', await browser.evaluate(`location.pathname === '/' && !!document.querySelector('.journey-starter [role="alert"]')`));
    await browser.fill('#home-date', futureDate);
    await browser.click('.starter-submit');
    await browser.waitFor(`location.pathname === '/booking' && document.querySelector('#trip-pickup')?.value === 'Boston Logan International Airport'`);
    const expected = { pickup: 'Boston Logan International Airport', destination: 'Four Seasons Hotel Boston', date: futureDate, time: '14:30' };
    await assertDraft('One-way home draft reaches current booking flow', 'trip', { ...expected, mode: 'ONE_WAY' });
    await capture('booking-one-way-desktop');
    if (backendAvailable) {
      await browser.click('.form-actions button[type="submit"]');
      await browser.waitFor(`!!document.querySelector('input[name="vehicle-class"]')`);
      check('Continue reaches real catalog vehicle options', await browser.evaluate(`!!document.querySelector('input[name="vehicle-class"]:not(:disabled)')`));
      await browser.click('.form-actions button[type="button"]');
      await browser.waitFor(`!!document.querySelector('#trip-pickup')`);
      await assertDraft('Booking Back preserves entered journey data', 'trip', expected);
    }
    await browser.evaluate('history.back()'); await starterReady();
    await assertDraft('Browser Back preserves one-way home data', 'home', expected);
    await reloadHome();
    await assertDraft('Full page reload restores one-way session draft', 'home', expected);
    await browser.click(selectedMode(true)); await browser.waitFor(`!!document.querySelector('#home-hours')`);
    await browser.click(selectedMode(false)); await browser.waitFor(`!!document.querySelector('#home-destination')`);
    await assertDraft('Toggling modes preserves the one-way destination', 'home', expected);
  });

  await scenario('Hourly form behavior and duration persistence', async () => {
    await go('/'); await starterReady();
    await browser.click(selectedMode(true)); await browser.waitFor(`!!document.querySelector('#home-hours')`);
    check('Hourly mode replaces destination with requested duration', await browser.evaluate(`!document.querySelector('#home-destination') && document.querySelector('.journey-modes button:nth-child(2)').getAttribute('aria-pressed') === 'true'`));
    await browser.fill('#home-pickup', 'Boston Back Bay Office'); await browser.fill('#home-hours', '3');
    await browser.fill('#home-date', futureDate); await browser.fill('#home-time', '09:15');
    await capture('home-hourly-desktop');
    await browser.click('.starter-submit');
    await browser.waitFor(`location.pathname === '/booking' && !!document.querySelector('#trip-hours')`);
    const expected = { pickup: 'Boston Back Bay Office', date: futureDate, time: '09:15', hours: '3' };
    await assertDraft('Hourly mode and duration reach booking', 'trip', { ...expected, mode: 'HOURLY' });
    check('Hourly booking retains required itinerary semantics', await browser.evaluate(`document.querySelector('#trip-destination').required && document.querySelector('label[for="trip-destination"]').textContent.includes('Itinerary')`));
    await browser.fill('#trip-destination', ''); await browser.click('.form-actions button[type="submit"]');
    check('Hourly booking requires its itinerary before continuing', await browser.evaluate(`!!document.querySelector('#trip-hours') && !document.querySelector('.form-panel').checkValidity()`));
    await browser.fill('#trip-destination', 'Boston meetings, returning to Back Bay');
    await browser.fill('#trip-hours', '0.5'); await browser.click('.form-actions button[type="submit"]');
    check('Hourly booking rejects duration below supported minimum', await browser.evaluate(`document.querySelector('#trip-hours')?.validity.rangeUnderflow === true`));
    await browser.fill('#trip-hours', '3');
    if (backendAvailable) {
      await browser.click('.form-actions button[type="submit"]'); await browser.waitFor(`!!document.querySelector('input[name="vehicle-class"]')`);
      await browser.click('.form-actions button[type="button"]'); await browser.waitFor(`!!document.querySelector('#trip-hours')`);
      await assertDraft('Hourly booking Back retains duration and itinerary', 'trip', { ...expected, destination: 'Boston meetings, returning to Back Bay' });
    }
    await capture('booking-hourly-desktop');
    await browser.evaluate('history.back()'); await starterReady();
    await assertDraft('Hourly Browser Back retains home draft', 'home', expected);
    await reloadHome();
    await assertDraft('Hourly draft survives document reload', 'home', expected);
  });

  await scenario('Responsive tablet and mobile home', async () => {
    for (const [name, width, height] of [['tablet', 834, 1112], ['mobile', 390, 844]]) {
      await viewport(width, height); await go('/'); await starterReady();
      await browser.click(selectedMode(false)); await assertLayout(name, width);
      await capture('home-' + name);
      await capture('home-form-' + name, '.journey-starter');
      await browser.click(selectedMode(true)); await assertLayout(name + ' hourly', width);
      await capture('home-hourly-' + name, '.journey-starter');
      await assertDraft(name + ' shares the same draft after resize', 'home', { pickup: 'Boston Back Bay Office', date: futureDate, time: '09:15', hours: '3' });
      await browser.click('.starter-submit'); await browser.waitFor(`location.pathname === '/booking' && !!document.querySelector('#trip-hours')`);
      await capture('booking-' + name);
      check(name + ' booking has no horizontal overflow', await browser.evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`));
    }
  });

  await scenario('Keyboard navigation and mobile dialog', async () => {
    await viewport(390, 844); await go('/'); await starterReady();
    await key('Tab', 'Tab', 9);
    check('First keyboard stop is the visible skip link', await browser.evaluate(`document.activeElement.matches('.skip-link') && document.activeElement.getBoundingClientRect().top >= 0`));
    await key('Enter', 'Enter', 13);
    check('Skip link moves keyboard focus to main content', await browser.evaluate(`document.activeElement.id === 'main-content'`));
    await browser.evaluate(`document.querySelector('.mobile-menu-button').focus()`); await key('Enter', 'Enter', 13);
    await browser.waitFor(`document.querySelector('#mobile-navigation').open`);
    check('Keyboard opens mobile navigation with focus inside dialog', await browser.evaluate(`document.querySelector('#mobile-navigation').contains(document.activeElement) && document.querySelector('.mobile-menu-button').getAttribute('aria-expanded') === 'true'`));
    assertTransparentLogo('Mobile menu logo has real transparency', await logo('.mobile-dialog .brand-image'));
    await browser.screenshot(join(output, 'mobile-navigation.png')); report.screenshots.push('mobile-navigation.png');
    let trapped = true;
    for (let i = 0; i < 12; i++) { await key('Tab', 'Tab', 9); trapped &&= await browser.evaluate(`document.activeElement === document.body || document.querySelector('#mobile-navigation').contains(document.activeElement)`); }
    check('Modal navigation keeps tab focus away from page controls', trapped);
    await key('Escape', 'Escape', 27);
    await browser.waitFor(`!document.querySelector('#mobile-navigation').open`);
    check('Escape closes menu and restores focus to trigger', await browser.evaluate(`document.activeElement.matches('.mobile-menu-button') && document.querySelector('.mobile-menu-button').getAttribute('aria-expanded') === 'false'`));
    await browser.evaluate(`document.querySelector('.journey-modes button:first-child').focus()`); await key('Enter', 'Enter', 13);
    await key('Tab', 'Tab', 9); await key('Enter', 'Enter', 13);
    check('Keyboard switches journey mode to hourly', await browser.evaluate(`document.activeElement.matches('.journey-modes button:nth-child(2)') && !!document.querySelector('#home-hours')`));
    await key('Tab', 'Tab', 9);
    const focus = await browser.evaluate(`({id:document.activeElement.id,visible:document.activeElement.matches(':focus-visible'),style:getComputedStyle(document.activeElement).outlineStyle,width:getComputedStyle(document.activeElement).outlineWidth})`);
    check('Journey fields have a visible keyboard focus indicator', focus.id === 'home-pickup' && focus.visible && focus.style !== 'none' && parseFloat(focus.width) > 0, focus);
  });

  await scenario('Existing routes and access logo', async () => {
    await viewport(1440, 1000);
    for (const route of ['/services', '/fleet', '/business', '/help', '/contact', '/login', '/booking', '/privacy', '/terms']) {
      await go(route);
      check('Existing route renders ' + route, await browser.evaluate(`location.pathname === ${JSON.stringify(route)} && !!document.querySelector('main h1') && !document.body.innerText.includes('Page not found')`));
    }
    await go('/login'); await browser.waitFor(`!!document.querySelector('#account-email')`);
    assertTransparentLogo('Access screen brand has real transparency', await logo('.auth-story .brand-image'));
    await capture('login-desktop');
    await viewport(390, 844); await capture('login-mobile');
    await viewport(1440, 1000); await go('/services');
    await browser.click('.desktop-nav a[href="/#experience"]');
    await browser.waitFor(`location.pathname === '/' && location.hash === '#experience' && scrollY > 100`);
    check('Existing approach anchor navigation works', true);
    await browser.click('.desktop-nav a[href="/help"]'); await browser.waitFor(`location.pathname === '/help'`);
    await browser.evaluate('history.back()'); await browser.waitFor(`location.pathname === '/' && location.hash === '#experience' && scrollY > 100`);
    check('Browser Back restores anchor route and scroll', true);
  });

  await scenario('Reduced motion', async () => {
    await browser.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await viewport(1440, 1000); await go('/'); await starterReady();
    const motion = await browser.evaluate(`(() => {
      const header = getComputedStyle(document.querySelector('.site-header'));
      const reveal = [...document.querySelectorAll('.as-reveal,.scroll-statement')].map(el => { const s = getComputedStyle(el); return {opacity:s.opacity,transform:s.transform,transition:s.transitionDuration}; });
      return { reduced: matchMedia('(prefers-reduced-motion:reduce)').matches, header:header.transitionDuration, scroll:getComputedStyle(document.documentElement).scrollBehavior, reveal };
    })()`);
    check('Reduced motion keeps content visible and disables decorative movement', motion.reduced && motion.scroll === 'auto' && motion.header.split(',').every(duration => parseFloat(duration) <= .001) && motion.reveal.every(item => item.opacity === '1' && item.transform === 'none'), motion);
    await capture('home-reduced-motion');
  });
  await scenario('Final empty-state and bilingual screenshots', async () => {
    await browser.send('Emulation.setEmulatedMedia', { features: [] });
    await go('/'); await starterReady();
    // Clear only this disposable browser's journey and language preference.
    await browser.evaluate(`sessionStorage.removeItem('ascenta.journey.v1'); localStorage.setItem('ascenta.language', 'en')`);
    await reloadHome();
    check('Fresh home starts in One way with empty journey fields', await browser.evaluate(`document.documentElement.lang === 'en' && document.querySelector('#home-pickup').value === '' && document.querySelector('#home-destination').value === '' && document.querySelector('#home-date').value === ''`));
    for (const [name, width, height] of [['desktop', 1440, 1000], ['tablet', 834, 1112], ['mobile', 390, 844]]) {
      await viewport(width, height); await capture('home-' + name);
    }
    await browser.click('.language-button');
    await browser.waitFor(`document.documentElement.lang === 'es'`);
    for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      await viewport(width, height); await assertLayout('Spanish ' + name, width, name === 'desktop'); await capture('home-' + name + '-es');
    }
    await browser.click('.language-button');
    await browser.waitFor(`document.documentElement.lang === 'en'`);
  });
  check('Frontend receives live catalog through its existing API adapter', report.apiResponses.some(item => item.url.endsWith('/catalog') && item.status === 200));
  check('Verification sends no API mutations', report.apiMutations.length === 0, report.apiMutations);
  check('No uncaught JavaScript or unexpected console/network errors', !report.jsErrors.length && !report.consoleErrors.length && !report.networkErrors.length, { jsErrors: report.jsErrors, consoleErrors: report.consoleErrors, networkErrors: report.networkErrors });
  report.success = report.checks.every(item => item.passed);
  if (!report.success) process.exitCode = 1;
} catch (error) { report.error = error.message; process.exitCode = 1; }
finally {
  report.finishedAt = new Date().toISOString();
  await writeFile(join(output, 'report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  console.log(JSON.stringify({ success: report.success, passed: report.checks.filter(item => item.passed).length, total: report.checks.length, report: join(output, 'report.json') }));
}

import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { openBrowser, sleep } from './cdp.mjs';

const baseUrl=process.env.ASCENTA_WEB_URL||'http://localhost:5175',apiUrl=process.env.ASCENTA_API_URL||'http://localhost:4000';
for(const value of [baseUrl,apiUrl])if(!['localhost','127.0.0.1','[::1]'].includes(new URL(value).hostname))throw Error('Portal fixtures only run against loopback URLs');
if((await(await fetch(new URL('/api/v1/health',apiUrl))).json()).data?.dataMode!=='demo')throw Error('Portal fixture mutations require explicitly selected demo mode');
const output=resolve(process.argv[2]||'docs/evidence/portals');await mkdir(output,{recursive:true});
const report={startedAt:new Date().toISOString(),dataMode:'demo',checks:[],jsErrors:[],consoleErrors:[],screenshots:[],success:false};
const assert=(condition,name)=>{report.checks.push({name,passed:!!condition});if(!condition)throw Error(name);console.log(JSON.stringify({check:name,passed:true}));};
const loginResponse=await fetch(new URL('/api/v1/auth/login',apiUrl),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'demo.corporate@ascenta.local',password:'AscentaDemo!2026'})});
if(loginResponse.status!==200)throw Error('Corporate demo fixture login failed');
const account=(await loginResponse.json()).data;
const cookie=loginResponse.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
const fixture=async organizationId=>{
  const response=await fetch(new URL('/api/v1/reservations',apiUrl),{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie,'X-CSRF-Token':account.csrfToken},body:JSON.stringify({serviceTypeCode:'ONE_WAY',vehicleClassCode:'EXECUTIVE_SUV',pickupAddress:'Boston Logan Airport',destinationAddress:'Boston convention center',scheduledAt:new Date(Date.now()+9*86400000).toISOString(),scheduledTimeZone:'America/New_York',passengerCount:2,passengerName:'ASCENTA Demo Portal Test',passengerPhone:'+16175550123',notes:'=ASCENTA_PORTAL_TEST',organizationId,idempotencyKey:randomUUID()})});
  const body=await response.json();if(response.status!==201)throw Error('Demo reservation fixture failed: '+JSON.stringify(body.error));return body.data;
};
const corporate=await fixture(account.user.organizationIds[0]);
const personal=await fixture(undefined);
report.corporateReference=corporate.reference;report.personalReference=personal.reference;
const browser=await openBrowser();
browser.listeners.add(({method,params:p})=>{
  if(method==='Runtime.exceptionThrown')report.jsErrors.push(p.exceptionDetails.exception?.description||p.exceptionDetails.text);
  if(method==='Runtime.consoleAPICalled'&&p.type==='error')report.consoleErrors.push(p.args.map(value=>value.value||value.description||value.type).join(' '));
});
const go=async route=>{await browser.send('Page.navigate',{url:new URL(route,baseUrl).href});await browser.waitFor(`document.readyState==='complete'&&!!document.querySelector('.site-header')&&Object.keys(document.querySelector('.site-header')).some(key=>key.startsWith('__reactProps'))`);await sleep(300);};
const login=async(email,next)=>{await go('/login?next='+encodeURIComponent(next));await browser.waitFor(`!!document.querySelector('#account-email')`);await browser.fill('#account-email',email);await browser.fill('#account-password','AscentaDemo!2026');await browser.click('.auth-card button[type="submit"]');await browser.waitFor(`location.pathname===${JSON.stringify(next)}&&!!document.querySelector('.portal-sidebar')&&!document.querySelector('.loading')`);};
const screenshot=async name=>{await browser.evaluate('window.scrollTo(0,0)');await sleep(250);await browser.screenshot(join(output,name+'.png'));report.screenshots.push(name+'.png');};
const refs=()=>browser.evaluate(`[...document.querySelectorAll('.request-reference')].map(el=>el.innerText.trim())`);
const tab=async label=>{await browser.evaluate(`document.querySelectorAll('.portal-tabs button').forEach(el=>{if(el.textContent.trim()===${JSON.stringify(label)})el.dataset.browserCheck='tab'})`);await browser.click('[data-browser-check="tab"]');await browser.evaluate(`document.querySelector('[data-browser-check="tab"]').removeAttribute('data-browser-check')`);};
try{
  await browser.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await login('demo.corporate@ascenta.local','/corporate');
  assert((await refs()).includes(corporate.reference)&&!(await refs()).includes(personal.reference),'Corporate page includes organization requests and excludes personal requests');
  await screenshot('corporate-desktop');
  await browser.fill('#journey-search',corporate.reference);assert((await refs()).length===1,'Corporate reference search filters the visible list');
  await browser.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:output},null);
  await browser.click('.field-grid .page-actions button');
  const csvPath=join(output,'ascenta-authorized-requests.csv');let csv;
  for(let attempt=0;attempt<60;attempt++){try{csv=await readFile(csvPath,'utf8');break;}catch{await sleep(150);}}
  assert(!!csv&&csv.includes(corporate.reference)&&!csv.includes(personal.reference),'CSV download contains only the authorized filtered selection');
  assert(csv.includes("'=ASCENTA_PORTAL_TEST"),'CSV protects spreadsheet formula values');
  await browser.fill('#journey-search','NoSuchJourneyReference');assert((await refs()).length===0,'Corporate search has a clear empty state');await browser.fill('#journey-search','');
  await tab('History');assert((await refs()).length===0,'History filter excludes open requests');await tab('All');assert((await refs()).includes(corporate.reference),'All filter restores open organization requests');
  await go('/corporate/usage');await browser.waitFor(`!!document.querySelector('.portal-sidebar')&&!document.querySelector('.loading')`);assert((await refs()).includes(corporate.reference),'Corporate usage route preserves the authorized organization list');await screenshot('corporate-usage-desktop');
  await browser.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await screenshot('corporate-mobile');assert(await browser.evaluate(`document.documentElement.scrollWidth<=innerWidth+1`),'Corporate mobile layout has no horizontal overflow');
  await browser.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await go('/admin');await browser.waitFor(`document.body.innerText.includes('Operations access requires an ASCENTA administrator account.')`);assert((await refs()).length===0,'Corporate account cannot access administrator requests');
  await go('/account');await browser.waitFor(`!!document.querySelector('.signout')`);await browser.click('.signout');await browser.waitFor(`location.pathname==='/'`);
  await login('demo.admin@ascenta.local','/admin');
  assert((await refs()).includes(corporate.reference)&&(await refs()).includes(personal.reference),'Administrator queue includes authorized organization and personal requests');await screenshot('admin-desktop');
  await browser.fill('#ops-search',corporate.reference);assert((await refs()).length===1,'Administrator search filters by reference');
  await browser.fill('#ops-status','COMPLETED');assert((await refs()).length===0,'Administrator status filter excludes unmatched open requests');
  await browser.fill('#ops-status','REQUESTED');assert((await refs()).includes(corporate.reference),'Administrator status filter restores matching requests');
  await browser.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await screenshot('admin-mobile');assert(await browser.evaluate(`document.documentElement.scrollWidth<=innerWidth+1`),'Administrator mobile layout has no horizontal overflow');
  assert(report.jsErrors.length===0&&report.consoleErrors.length===0,'No JavaScript or console errors in authorized portal flows');report.success=true;
}catch(error){report.error=error.message;process.exitCode=1;await browser.screenshot(join(output,'failure.png')).catch(()=>{});console.error(error.message);}
finally{await browser.close();report.finishedAt=new Date().toISOString();await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({success:report.success,checks:report.checks.length,report:join(output,'report.json')}));}

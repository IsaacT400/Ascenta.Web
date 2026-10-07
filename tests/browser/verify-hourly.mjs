import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { openBrowser } from './cdp.mjs';

const output=resolve(process.argv[2]||'docs/evidence/hourly');
await mkdir(output,{recursive:true});
const browser=await openBrowser();
const report={startedAt:new Date().toISOString(),success:false,checks:[],jsErrors:[]};
browser.listeners.add(event=>{if(event.method==='Runtime.exceptionThrown')report.jsErrors.push(event.params.exceptionDetails.exception?.description||event.params.exceptionDetails.text);});
try {
  await browser.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await browser.send('Page.navigate',{url:process.env.ASCENTA_WEB_URL||'http://localhost:5175'});
  await browser.waitFor(`document.readyState==='complete' && !!document.querySelector('.starter-submit') && !document.querySelector('.starter-submit').disabled`);
  await browser.evaluate(`document.querySelectorAll('.journey-modes button').forEach(el=>{if(el.textContent.trim()==='By the hour')el.dataset.browserCheck='hourly'})`);
  await browser.click('[data-browser-check="hourly"]');
  await browser.waitFor(`!!document.querySelector('#home-hours')`);
  await browser.fill('#home-hours','3');
  await browser.fill('#home-pickup','Boston Logan Airport');
  await browser.fill('#home-date',new Date(Date.now()+7*86400000).toISOString().slice(0,10));
  await browser.fill('#home-time','14:30');
  await browser.screenshot(join(output,'home-hourly-desktop.png'));
  await browser.click('.starter-submit');
  await browser.waitFor(`location.pathname==='/booking' && document.querySelector('#trip-pickup')?.value==='Boston Logan Airport'`);
  const draft=await browser.evaluate(`JSON.parse(sessionStorage.getItem('ascenta.journey.v1')).draft`);
  if(draft.serviceTypeCode!=='HOURLY'||draft.hours!==3||draft.pickupAddress!=='Boston Logan Airport')throw Error('Hourly draft was not retained');
  report.checks.push({name:'Hourly mode, duration, pickup, date and time transfer to booking',passed:true});
  await browser.screenshot(join(output,'booking-hourly-draft.png'));
  await browser.send('Page.reload');
  await browser.waitFor(`document.querySelector('#trip-pickup')?.value==='Boston Logan Airport'`);
  report.checks.push({name:'Journey draft survives full document reload',passed:true});
  report.success=report.jsErrors.length===0;
} catch(error){report.error=error.message;process.exitCode=1;}
finally{
  report.finishedAt=new Date().toISOString();await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report));
}

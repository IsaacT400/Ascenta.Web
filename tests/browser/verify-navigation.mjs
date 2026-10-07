import { writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { openBrowser, sleep } from './cdp.mjs';
const browser=await openBrowser(),output=resolve(process.argv[2]||'docs/evidence/navigation');
await mkdir(output,{recursive:true});
const report={startedAt:new Date().toISOString(),snapshots:[],success:false};
const snapshot=async label=>{const page=await browser.evaluate(`({url:location.pathname+location.hash,scrollY,anchorTop:document.getElementById('experience')?.getBoundingClientRect().top,header:document.querySelector('.site-header')?.dataset.theme})`);report.snapshots.push({label,...page});console.log(JSON.stringify({label,...page}));};
try{
  await browser.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await browser.send('Page.navigate',{url:new URL('/services',process.env.ASCENTA_WEB_URL||'http://localhost:5175').href});
  await browser.waitFor(`!!document.querySelector('.desktop-nav')&&Object.keys(document.querySelector('.site-header')).some(key=>key.startsWith('__reactProps'))`);
  await snapshot('services');await browser.click('.desktop-nav a[href="/#experience"]');await browser.waitFor(`location.hash==='#experience'&&scrollY>100`);await sleep(500);await snapshot('home anchor');
  await browser.click('.desktop-nav a[href="/help"]');await browser.waitFor(`location.pathname==='/help'`);await sleep(400);await snapshot('help');
  await browser.evaluate('history.back()');await browser.waitFor(`location.pathname==='/'&&location.hash==='#experience'`);await sleep(700);await snapshot('back home anchor');
  await browser.evaluate('history.forward()');await browser.waitFor(`location.pathname==='/help'`);await sleep(400);await snapshot('forward help');
  report.success=report.snapshots.find(item=>item.label==='back home anchor').scrollY>100;
  if(!report.success)process.exitCode=1;
}catch(error){report.error=error.message;process.exitCode=1;}
finally{await browser.close();await writeFile(join(output,'report.json'),JSON.stringify(report,null,2));}

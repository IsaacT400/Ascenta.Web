import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';
import { resolve, join, dirname } from 'node:path';

// Chromium screenshot PNGs are non-interlaced, eight-bit RGB or RGBA.
// Decode filters directly so verification has no untracked image-library dependency.
function decodePng(bytes) {
  if (!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw Error('Not a PNG');
  let width, height, channels;
  const chunks = [];
  for (let offset=8; offset<bytes.length;) {
    const length=bytes.readUInt32BE(offset), type=bytes.toString('ascii',offset+4,offset+8), data=bytes.subarray(offset+8,offset+8+length);
    if(type==='IHDR') {
      width=data.readUInt32BE(0); height=data.readUInt32BE(4);
      if(data[8]!==8 || ![2,6].includes(data[9]) || data[12]!==0) throw Error('Unsupported PNG format');
      channels=data[9]===2?3:4;
    }
    if(type==='IDAT') chunks.push(data);
    offset+=12+length;
  }
  const raw=inflateSync(Buffer.concat(chunks)), stride=width*channels, pixels=Buffer.alloc(stride*height);
  if(raw.length!==(stride+1)*height) throw Error('Unexpected PNG scanline length');
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let y=0;y<height;y++) {
    const filter=raw[y*(stride+1)], start=y*stride;
    if(filter>4)throw Error('Unsupported PNG filter');
    for(let x=0;x<stride;x++) {
      const left=x>=channels?pixels[start+x-channels]:0,up=y>0?pixels[start+x-stride]:0,diagonal=y>0&&x>=channels?pixels[start+x-stride-channels]:0;
      const predictor=filter===0?0:filter===1?left:filter===2?up:filter===3?Math.floor((left+up)/2):paeth(left,up,diagonal);
      pixels[start+x]=(raw[y*(stride+1)+1+x]+predictor)&255;
    }
  }
  return {width,height,channels,pixels};
}

const reference=resolve(process.argv[2]||'docs/evidence/reference'),current=resolve(process.argv[3]||'docs/evidence/visual-equivalent');
const manifest=JSON.parse(await readFile(new URL('./baseline-manifest.json',import.meta.url),'utf8'));
const before=JSON.parse(await readFile(join(reference,'report.json'),'utf8'));
const after=JSON.parse(await readFile(join(current,'report.json'),'utf8'));
if(before.capturedAt===after.capturedAt)throw Error('Reference and current captures must be separate browser runs');
const report={comparedAt:new Date().toISOString(),referenceCapturedAt:before.capturedAt,currentCapturedAt:after.capturedAt,referenceDataMode:before.dataMode||manifest.reference.dataMode,currentDataMode:after.dataMode,thresholds:manifest.comparison,comparisons:[]};
const captures=manifest.routes.flatMap(route=>manifest.viewports.map(viewport=>({route,viewport,name:(route==='/'?'home':route.slice(1).replaceAll('/','-'))+'-'+(viewport.width===390?'mobile':'desktop')})));
captures.push({route:'/',viewport:{width:1440,height:1000},name:'home-footer'});
for(const {route,viewport,name:expectedName} of captures) {
  const match=page=>page.name===expectedName&&page.url===route&&page.viewport?.width===viewport.width&&page.viewport?.height===viewport.height;
  const original=before.pages.find(match),migrated=after.pages.find(match),item={route,viewport,capture:expectedName,passed:false};
  report.comparisons.push(item);
  try {
    if(!original?.screenshot||!migrated?.screenshot)throw Error('Missing original or migrated screenshot');
    const [aBytes,bBytes]=await Promise.all([readFile(join(reference,original.screenshot)),readFile(join(current,migrated.screenshot))]);
    const a=decodePng(aBytes),b=decodePng(bBytes);
    item.referenceSha256=createHash('sha256').update(aBytes).digest('hex');
    item.currentSha256=createHash('sha256').update(bBytes).digest('hex');
    if(a.width!==b.width||a.height!==b.height)throw Error('Screenshot dimensions differ');
    if(migrated.visibleBrokenImages?.length)throw Error('Migrated page has broken visible images');
    if(migrated.documentWidth>migrated.viewport.width+1)throw Error('Migrated page overflows horizontally');
    let changed=0,totalError=0;
    for(let pixel=0;pixel<a.width*a.height;pixel++) {
      let maximumError=0;
      for(let channel=0;channel<3;channel++) {
        const difference=Math.abs(a.pixels[pixel*a.channels+channel]-b.pixels[pixel*b.channels+channel]);
        totalError+=difference;maximumError=Math.max(maximumError,difference);
      }
      if(maximumError>manifest.comparison.channelTolerance)changed++;
    }
    item.changedPixelRatio=changed/(a.width*a.height);
    item.meanChannelError=totalError/(a.width*a.height*3);
    item.exactPixels=totalError===0;
    item.passed=item.changedPixelRatio<=manifest.comparison.maximumChangedPixelRatio&&item.meanChannelError<=manifest.comparison.maximumMeanChannelError;
  } catch(error){item.error=error.message;}
  console.log(JSON.stringify(item));
}
report.passed=report.comparisons.every(item=>item.passed);
const destination=resolve(process.argv[4]||'docs/evidence/comparison.json');
await mkdir(dirname(destination),{recursive:true});
await writeFile(destination,JSON.stringify(report,null,2));
console.log(JSON.stringify({passed:report.passed,comparisons:report.comparisons.length,report:destination}));
if(!report.passed)process.exitCode=1;

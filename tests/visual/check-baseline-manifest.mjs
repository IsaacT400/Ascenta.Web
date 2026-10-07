import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const manifest = JSON.parse(await readFile(new URL('./baseline-manifest.json', import.meta.url), 'utf8'));
const evidenceRoot = new URL('../../docs/evidence/reference/', import.meta.url);
const report = JSON.parse(await readFile(new URL('report.json', evidenceRoot), 'utf8'));
if (!report.capturedAt?.startsWith('2026-10-07')) throw Error('Expected the local pre-migration reference captured on 2026-10-07');
for (const route of manifest.routes) {
  for (const viewport of manifest.viewports) {
    const expectedName=(route==='/'?'home':route.slice(1).replaceAll('/','-'))+'-'+(viewport.width===390?'mobile':'desktop');
    const capture = report.pages.find(page => page.name === expectedName && page.url === route && page.viewport?.width === viewport.width && page.viewport?.height === viewport.height);
    if (!capture?.screenshot || capture.error) throw Error(`Missing real reference capture: ${route} ${viewport.width}x${viewport.height}`);
    const bytes = await readFile(new URL(capture.screenshot, evidenceRoot));
    if (!bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw Error(`Invalid screenshot: ${capture.screenshot}`);
    if (bytes.readUInt32BE(16) !== viewport.width || bytes.readUInt32BE(20) !== viewport.height) throw Error(`Wrong screenshot dimensions: ${capture.screenshot}`);
    console.info(`${route} ${viewport.width}x${viewport.height} SHA256 ${createHash('sha256').update(bytes).digest('hex')}`);
  }
}
console.info('Reference PNG evidence exists and matches the declared viewport dimensions. Run compare.mjs to verify the migrated rendering.');

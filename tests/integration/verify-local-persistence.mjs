import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createPrismaClient } from '../../packages/database/dist/index.js';

const phase = process.argv[2];
if (!['before', 'after'].includes(phase)) throw Error('Expected before or after; run the browser user flow first.');
const flow = JSON.parse(await readFile(new URL('../../docs/evidence/user-flow/report.json', import.meta.url), 'utf8'));
if (!flow.success || !flow.reference || !flow.testEmail?.endsWith('@example.invalid')) throw Error('A successful, explicitly identified local browser fixture is required.');
const prisma = createPrismaClient();
try {
  const reservation = await prisma.reservation.findUnique({ where: { reference: flow.reference }, include: { createdBy: true } });
  if (!reservation || reservation.createdBy.email !== flow.testEmail) throw Error('The browser journey is missing or belongs to a different account.');
  const digest = createHash('sha256').update(JSON.stringify(reservation)).digest('hex');
  const observed = { observedAt: new Date().toISOString(), reference: flow.reference, recordSha256: digest };
  const baseline = new URL('../../.local/persistence-before.json', import.meta.url);
  if (phase === 'before') await writeFile(baseline, JSON.stringify(observed, null, 2));
  else {
    const before = JSON.parse(await readFile(baseline, 'utf8'));
    if (before.reference !== flow.reference || before.recordSha256 !== digest) throw Error('The persisted journey/account changed across the restart.');
    const health = await (await fetch('http://localhost:4000/api/v1/health')).json();
    if (health.data?.dataMode !== 'mysql') throw Error('The restarted application must use MySQL.');
    await writeFile(new URL('../../docs/evidence/restart.json', import.meta.url), JSON.stringify({ passed: true, procedure: 'Final PowerShell scripts stopped web, API and dedicated MySQL, then restarted them without resetting data.', before, after: observed, dataMode: health.data.dataMode }, null, 2));
  }
  console.info(`Persistence ${phase}: ${flow.reference}, SHA256 ${digest}`);
} finally { await prisma.$disconnect(); }

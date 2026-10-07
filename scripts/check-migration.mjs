import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const problems = [];
for (const path of ['html-migration', 'runtime', 'browser-check', 'apps/web/app', 'apps/web/components', 'apps/web/db', 'apps/web/drizzle', 'apps/web/examples', 'apps/web/.openai', 'apps/web/next.config.ts']) {
  if (existsSync(resolve(root, path))) problems.push(`Replaced location remains: ${path}`);
}
const forbidden = new Set(['next', 'vinext', 'next-themes', 'eslint-config-next', 'drizzle-orm', 'drizzle-kit', '@cloudflare/vite-plugin', '@cloudflare/workers-types', '@vitejs/plugin-rsc', 'react-server-dom-webpack', 'wrangler']);
for (const path of ['package.json', 'apps/web/package.json', 'apps/api/package.json', 'packages/shared/package.json', 'packages/database/package.json']) {
  const pkg = JSON.parse(readFileSync(resolve(root, path), 'utf8'));
  for (const name of Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })) {
    if (forbidden.has(name)) problems.push(`Retired dependency: ${path}: ${name}`);
  }
}
function* files(directory) {
  for (const name of readdirSync(directory)) {
    if (['node_modules', 'dist', '.git', '.tools', '.local', 'generated'].includes(name)) continue;
    const path = join(directory, name);
    if (statSync(path).isDirectory()) yield* files(path); else yield path;
  }
}
for (const directory of ['apps', 'packages', 'scripts']) {
  for (const path of files(resolve(root, directory))) {
    if (!/\.(?:[cm]?[jt]sx?|ps1|json)$/.test(path) || path === fileURLToPath(import.meta.url)) continue;
    const text = readFileSync(path, 'utf8');
    if (/from\s+['"](?:next(?:\/[^'"]*)?|vinext|drizzle-orm|cloudflare:workers)['"]/.test(text)) problems.push(`Retired import: ${relative(root, path)}`);
    if (/(?:html-migration[\\/]|browser-check[\\/]|Ascenta\.Web[\\/]|work[\\/]tooling)/.test(text)) problems.push(`Retired execution path: ${relative(root, path)}`);
    if (/NEXT_PUBLIC_/.test(text)) problems.push(`Retired public environment variable: ${relative(root, path)}`);
  }
}
const inventory = JSON.parse(readFileSync(resolve(root, 'docs/source-inventory.json'), 'utf8'));
for (const item of inventory.files) {
  if (item.disposition === 'removed') {
    if (existsSync(resolve(root, item.original))) problems.push(`Unused original remains: ${item.original}`);
    continue;
  }
  if (item.target !== item.original && existsSync(resolve(root, item.original))) problems.push(`Duplicate original remains: ${item.original}`);
  if (!existsSync(resolve(root, item.target))) problems.push(`Missing migrated responsibility: ${item.original} -> ${item.target}`);
  if (item.preserveBytes) {
    const hash = createHash('sha256').update(readFileSync(resolve(root, item.target))).digest('hex');
    if (hash !== item.sha256) problems.push(`Changed approved asset/style: ${item.target}`);
  }
}
// Check built public assets for accidental copies of configured private values.
const envPath = resolve(root, '.env');
const publicBuild = resolve(root, 'apps/web/dist');
if (existsSync(envPath) && existsSync(publicBuild)) {
  const secrets = readFileSync(envPath, 'utf8').split(/\r?\n/).filter(line => /^(?:DATABASE_URL|TEST_DATABASE_URL|DATABASE_PASSWORD|SESSION_SECRET)=/.test(line)).map(line => line.slice(line.indexOf('=') + 1).replace(/^["']|["']$/g, '')).filter(value => value.length > 10);
  for (const path of files(publicBuild)) {
    if (!/\.(?:js|css|html|map)$/.test(path)) continue;
    const text = readFileSync(path, 'utf8');
    if (secrets.some(secret => text.includes(secret))) problems.push(`Private value found in frontend build: ${relative(root, path)}`);
  }
}
if (problems.length) throw new Error(problems.join('\n'));
console.info(`Migration structure, ${inventory.files.length} source mappings, exact assets/CSS and public build checks passed.`);

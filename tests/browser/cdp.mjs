import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';

export const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));

/** Starts only an isolated headless browser; never opens an existing user profile. */
export async function openBrowser() {
  const profile = await mkdtemp(join(tmpdir(), 'ascenta-browser-'));
  const executable = process.env.ASCENTA_EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = spawn(executable, [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-gpu',
    '--disable-background-networking', 'about:blank',
  ], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '', spawnError, socket, sessionId, sequence = 0;
  browser.stderr.on('data', value => { stderr = (stderr + value).slice(-12000); });
  browser.on('error', error => { spawnError = error; });
  const pending = new Map();
  const listeners = new Set();
  const send = (method, params = {}, targetSession = sessionId) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 45000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params, ...(targetSession ? { sessionId: targetSession } : {}) }));
  });
  const close = async () => {
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ id: ++sequence, method: 'Browser.close' }));
    if (browser.exitCode === null) {
      await Promise.race([new Promise(resolve => browser.once('exit', resolve)), sleep(2500)]);
      if (browser.exitCode === null) browser.kill();
    }
    socket?.close(); browser.stderr.destroy(); browser.unref();
    for (const call of pending.values()) clearTimeout(call.timer);
    // Delete only the exact temporary directory created by this invocation.
    const temporaryRoot = resolve(tmpdir()) + sep;
    if (resolve(profile).startsWith(temporaryRoot) && resolve(profile) !== resolve(tmpdir())) {
      await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 400 }).catch(() => {});
    }
  };
  try {
    let address;
    for (let attempt = 0; attempt < 100; attempt++) {
      if (spawnError) throw spawnError;
      if (browser.exitCode !== null) throw new Error(`Edge exited ${browser.exitCode}: ${stderr}`);
      try {
        const [port, endpoint] = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).trim().split(/\r?\n/);
        address = `ws://127.0.0.1:${port}${endpoint}`; break;
      } catch { await sleep(200); }
    }
    if (!address) throw new Error(`Edge did not create a debugging endpoint: ${stderr}`);
    socket = new WebSocket(address);
    await new Promise((resolve, reject) => {
      socket.addEventListener('open', resolve, { once: true });
      socket.addEventListener('error', reject, { once: true });
    });
    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      const call = pending.get(message.id);
      if (call) {
        pending.delete(message.id); clearTimeout(call.timer);
        if (message.error) call.reject(new Error(JSON.stringify(message.error))); else call.resolve(message.result);
      } else if (message.sessionId === sessionId) for (const listener of listeners) listener(message);
    });
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    ({ sessionId } = await send('Target.attachToTarget', { targetId, flatten: true }));
    await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  } catch (error) { await close(); throw error; }
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const waitFor = async (expression, timeout = 45000) => {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await evaluate(expression).catch(() => false)) return;
      await sleep(150);
    }
    throw new Error(`Condition timed out: ${expression}`);
  };
  const click = async selector => {
    const point = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) throw Error('Missing selector'); el.scrollIntoView({block:'center'}); const r = el.getBoundingClientRect(); return { x:r.x+r.width/2, y:r.y+r.height/2 }; })()`);
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', button: 'left', clickCount: 1, ...point });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', button: 'left', clickCount: 1, ...point });
    await sleep(250);
  };
  const fill = async (selector, value) => {
    await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) throw Error('Missing field'); const prototype = el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(prototype,'value').set.call(el,${JSON.stringify(value)}); el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); })()`);
    await sleep(100);
  };
  return { send, evaluate, waitFor, click, fill, close, listeners, pid: browser.pid,
    screenshot: async path => { const { data } = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); await writeFile(path, Buffer.from(data, 'base64')); },
  };
}

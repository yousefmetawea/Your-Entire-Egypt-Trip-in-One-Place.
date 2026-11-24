import { spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';

const ff = spawn('firefox', [
  '--headless',
  '--remote-debugging-port=9222',
  '--window-size=1440,900',
  '--profile', '/tmp/ffprofile'
]);

await new Promise(r => setTimeout(r, 2000));

const ws = new WebSocket('ws://127.0.0.1:9222');

let id = 1;
const pending = new Map();

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
};

function send(method, params = {}) {
  const reqId = id++;
  return new Promise((resolve) => {
    pending.set(reqId, resolve);
    ws.send(JSON.stringify({ id: reqId, method, params }));
  });
}

await new Promise((r) => (ws.onopen = r));

const sessionRes = await send('session.new', { capabilities: {} });
console.log('Session:', sessionRes.result?.sessionId);

const treeRes = await send('browsingContext.getTree', {});
const contextId = treeRes.result?.contexts?.[0]?.context;
console.log('Context ID:', contextId);

mkdirSync('/home/yousef/.gemini/antigravity-cli/brain/ee14d983-e7c8-4410-ad11-abc1c0b18a18/screenshots', { recursive: true });

async function capture(name, delayMs = 3000) {
  await new Promise(r => setTimeout(r, delayMs));
  const shot = await send('browsingContext.captureScreenshot', { context: contextId });
  if (shot.result?.data) {
    const buf = Buffer.from(shot.result.data, 'base64');
    writeFileSync(`/home/yousef/.gemini/antigravity-cli/brain/ee14d983-e7c8-4410-ad11-abc1c0b18a18/screenshots/${name}`, buf);
    console.log(`Saved ${name} (${buf.length} bytes)`);
  } else {
    console.log(`Failed ${name}:`, shot);
  }
}

// 1. Opening Loader (capture fast at 500ms)
await send('browsingContext.navigate', { context: contextId, url: 'http://127.0.0.1:5173/', wait: 'none' });
await capture('01_opening_loader.png', 500);

// 2. Opening Curtains Collapse (capture at 1350ms)
await send('browsingContext.navigate', { context: contextId, url: 'http://127.0.0.1:5173/', wait: 'none' });
await capture('02_opening_curtains_collapse.png', 1350);

// 3. Complete Hero (capture after full opening choreography settles)
await send('browsingContext.navigate', { context: contextId, url: 'http://127.0.0.1:5173/', wait: 'complete' });
await capture('03_opening_complete_hero.png', 3200);

// 4. Scrolled Destinations Showcase
await send('script.evaluate', {
  target: { context: contextId },
  expression: 'window.scrollTo({ top: 1100, behavior: "instant" })',
  awaitPromise: true,
});
await capture('04_homepage_scrolled_destinations.png', 1200);

// 5. Arabic RTL Layout
await send('script.evaluate', {
  target: { context: contextId },
  expression: `
    localStorage.setItem("discover-cairo.language", "ar");
    window.location.reload();
  `,
  awaitPromise: true,
});
await capture('05_arabic_rtl_hero.png', 3200);

ws.close();
ff.kill();
console.log('All screenshots captured successfully!');
process.exit(0);

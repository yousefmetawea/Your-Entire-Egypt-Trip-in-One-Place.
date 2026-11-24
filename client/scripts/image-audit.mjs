// Image audit script for YourTrip
// Scans seed data for image URLs, requests HEAD, and writes a report.

import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve seed file
const seedPath = path.resolve(__dirname, '../src/services/mock/seed/places.ts');
const seedContent = await fs.promises.readFile(seedPath, 'utf-8');

// Extract URLs (simple regex)
const urlRegex = /src:\s*['"](https?:[^'\"]+)['"]/g;
let match;
const urls = new Set();
while ((match = urlRegex.exec(seedContent)) !== null) {
  urls.add(match[1]);
}

console.log(`Found ${urls.size} image URLs in seed data.`);

async function head(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return {
      url,
      ok: res.ok,
      status: res.status,
      type: res.headers.get('content-type') || 'unknown',
      length: res.headers.get('content-length') || 'unknown',
    };
  } catch (e) {
    return { url, ok: false, status: 'error', type: 'error', length: 'error', error: e.message };
  }
}

const results = [];
for (const url of urls) {
  // eslint-disable-next-line no-await-in-loop
  const info = await head(url);
  results.push(info);
}

const reportDir = path.resolve(__dirname, '../src/scripts');
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}
const reportPath = path.join(reportDir, 'image-audit-report.json');
await fs.promises.writeFile(reportPath, JSON.stringify(results, null, 2), 'utf-8');
console.log(`Report written to ${reportPath}`);

import fs from 'fs';
import path from 'path';

const mappingPath = path.resolve(process.cwd(), 'client/image-mapping.json');
const imagesDir = path.resolve(process.cwd(), 'client/public/images');

// Load the image mapping JSON
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

const missing = [];
for (const [placeId, fileName] of Object.entries(mapping)) {
  const filePath = path.join(imagesDir, fileName);
  if (!fs.existsSync(filePath)) {
    missing.push({ placeId, expectedFile: fileName });
  }
}

const reportPath = path.resolve(process.cwd(), 'client/image-missing-report.json');
fs.writeFileSync(reportPath, JSON.stringify({ missing }, null, 2), 'utf-8');
console.log('Image missing report written to', reportPath);

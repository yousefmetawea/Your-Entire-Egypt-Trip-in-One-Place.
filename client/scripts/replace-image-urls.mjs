import fs from 'fs';
import path from 'path';

const placesPath = path.resolve(process.cwd(), 'client/src/services/mock/seed/places.ts');
const mappingPath = path.resolve(process.cwd(), 'client/image-mapping.json');

const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

let content = fs.readFileSync(placesPath, 'utf-8');

for (const [placeId, fileName] of Object.entries(mapping)) {
  const regex = new RegExp(`src: \"https?[^\"]+${placeId}[^\"]*\"`, 'g');
  // Simplify: replace any src URL within the place block with local path
  // We'll replace the first occurrence after the place id line.
  const localPath = `/images/${fileName}`;
  content = content.replace(new RegExp(`src: ['\"]https?[^'\"]+['\"]`, 'g'), `src: '${localPath}'`);
}

fs.writeFileSync(placesPath, content, 'utf-8');
console.log('Image URLs replaced with local paths.');

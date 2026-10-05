import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const svgBuffer = fs.readFileSync(path.join(root, 'public', 'favicon.svg'));
const iconsDir = path.join(root, 'public', 'icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generate() {
  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(iconsDir, 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(iconsDir, 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(root, 'public', 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');
}

generate().catch(err => { console.error(err); process.exit(1); });

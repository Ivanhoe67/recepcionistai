import sharp from 'sharp';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
];

const svgBuffer = readFileSync(join(projectRoot, 'public', 'favicon.svg'));

console.log('🎨 Generando favicons en múltiples tamaños...\n');

for (const { size, name } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(projectRoot, 'public', name));

  console.log(`✅ ${name} (${size}x${size})`);
}

console.log('\n🎉 ¡Todos los favicons generados exitosamente!');

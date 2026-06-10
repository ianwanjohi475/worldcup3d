/**
 * Splits public/assets/hosts-triptych.png (three stacked stadium scenes:
 * USA on top, Mexico in the middle, Canada at the bottom) into three
 * equal-height crops: host-usa.png, host-mexico.png, host-canada.png.
 *
 * Re-run any time the triptych changes: `npm run split-hosts`
 * (also runs automatically before `npm run dev` / `npm run build`).
 */
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'assets');
const SRC = join(ASSETS, 'hosts-triptych.png');

if (!existsSync(SRC)) {
  console.error('split-hosts: public/assets/hosts-triptych.png not found. Run `npm run assets` first.');
  process.exit(1);
}

const meta = await sharp(SRC).metadata();
const { width, height } = meta;
const third = Math.floor(height / 3);

const slices = [
  ['host-usa.png', 0],
  ['host-mexico.png', third],
  ['host-canada.png', third * 2],
];

for (const [file, top] of slices) {
  await sharp(SRC)
    .extract({ left: 0, top, width, height: third })
    .png({ compressionLevel: 9 })
    .toFile(join(ASSETS, file));
  console.log(`+ public/assets/${file} (${width}x${third})`);
}
console.log('Host images split from triptych.');

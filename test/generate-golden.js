/**
 * Generate golden SVG snapshots from the current pipeline.
 *
 * Usage: node test/generate-golden.js
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compile } from '../index.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const root = join(__dirname, '..');
const examplesDir = join(root, 'examples');
const goldenDir = join(__dirname, 'golden');

await mkdir(goldenDir, { recursive: true });

const files = (await readdir(examplesDir)).filter(f => f.endsWith('.vin')).sort();

let count = 0;
for (const file of files) {
  const source = await readFile(join(examplesDir, file), 'utf-8');
  const { pages, diagnostics } = compile(source);

  // Export the first page's SVG
  const svg = pages[0]?.svg ?? '';
  const name = basename(file, '.vin');
  await writeFile(join(goldenDir, `${name}.svg`), svg, 'utf-8');
  count++;

  const warnings = diagnostics.filter(d => d.severity === 'warning');
  if (warnings.length > 0) {
    console.log(`  ${file}: ${warnings.length} warning(s)`);
    for (const w of warnings) console.log(`    - ${w.message}`);
  }
}

console.log(`Generated ${count} golden SVG snapshots in test/golden/`);

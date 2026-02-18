/**
 * Generates src/icons.js from lucide-static icon-nodes.json
 * Run: node generate-icons.js
 */
import { readFileSync, writeFileSync, statSync } from 'node:fs';

const data = JSON.parse(readFileSync('./node_modules/lucide-static/icon-nodes.json', 'utf-8'));

function nodeToSvg(node) {
  const [tag, attrs] = node;
  const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
  return `<${tag} ${attrStr}/>`;
}

let out = `/**
 * Lucide icon SVG fragments (auto-generated from lucide-static)
 * License: ISC (https://github.com/lucide-icons/lucide/blob/main/LICENSE)
 * Each entry maps an icon name to its SVG inner elements.
 * All icons use a 24x24 viewBox coordinate system.
 *
 * Do not edit manually — regenerate with: node generate-icons.js
 */

export const icons = {\n`;

const entries = Object.entries(data);
entries.forEach(([name, nodes], i) => {
  const svgContent = nodes.map(nodeToSvg).join('');
  // JSON.stringify handles all escaping for us
  const comma = i < entries.length - 1 ? ',' : '';
  out += `  ${JSON.stringify(name)}: ${JSON.stringify(svgContent)}${comma}\n`;
});

out += '};\n';

writeFileSync('./src/icons.js', out);
console.log(`Generated icons.js with ${entries.length} icons`);
console.log(`File size: ${(statSync('./src/icons.js').size / 1024).toFixed(1)} KB`);

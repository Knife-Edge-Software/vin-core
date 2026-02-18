/**
 * Dev server for the Vin viewer.
 * Serves viewer files and @vin/core files from the repository root.
 * No dependencies — just Node.js built-ins.
 *
 * URL mapping:
 *   /src/*        → viewer/src/*
 *   /core/*       → ./*              (library source at repo root)
 *   /examples/*   → ./examples/*
 *
 * Usage: node viewer/serve.js [port]
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.vin': 'text/plain; charset=utf-8',
  '.md':   'text/plain; charset=utf-8',
};

const PORT = parseInt(process.argv[2]) || 3030;

/**
 * Map a URL path to a file on disk.
 *   /src/*       → viewer's own src/ directory
 *   /core/*      → repo root (library source)
 *   /examples/*  → repo root examples/
 */
function resolveFilePath(urlPath) {
  if (urlPath.startsWith('/core/')) {
    return join(rootDir, urlPath.slice('/core'.length));
  }
  if (urlPath.startsWith('/examples/')) {
    return join(rootDir, urlPath);
  }
  // Default: serve from viewer directory
  return join(__dirname, urlPath);
}

createServer(async (req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') {
    res.writeHead(302, { 'Location': '/src/viewer.html' });
    res.end();
    return;
  }

  const filePath = resolveFilePath(urlPath);

  try {
    const content = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}).listen(PORT, () => {
  console.log(`Vin viewer running at http://localhost:${PORT}`);
});

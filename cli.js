#!/usr/bin/env node

/**
 * Vin CLI — render .vin files to SVG or PNG from the command line.
 *
 * Usage:
 *   vin render <files...> [options]
 *   vin --help | --version
 */

import { readFileSync, writeFileSync, mkdirSync, globSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { join, basename, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compile, formatDiagnostic, hasErrors } from './index.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const { version } = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));

const USAGE = `
Usage: vin render <files...> [options]

Render .vin wireframe files to SVG or PNG.

Options:
  -o, --output <file>   Output file path (single-file mode)
      --outdir <dir>    Output directory (batch mode)
  -f, --format <fmt>    Output format: svg (default) or png
      --scale <n>       PNG scale factor (default: 2)
      --page <p>        Page to render: index (0-based) or title
      --quiet           Suppress non-error output
  -h, --help            Show this help message
  -v, --version         Show version number

Examples:
  vin render login.vin                        SVG to stdout
  vin render login.vin -o login.svg           Write to file
  vin render *.vin --outdir ./output          Batch render
  vin render login.vin -o login.png           PNG (requires @resvg/resvg-js)
  vin render flow.vin --outdir ./out          Multi-page: one file per page
  vin render flow.vin --page 0 -o first.svg   Export specific page
`.trim();

// --- Argument parsing ---

let args;
try {
  args = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      output:  { type: 'string',  short: 'o' },
      outdir:  { type: 'string' },
      format:  { type: 'string',  short: 'f' },
      scale:   { type: 'string' },
      page:    { type: 'string' },
      quiet:   { type: 'boolean', default: false },
      help:    { type: 'boolean', short: 'h', default: false },
      version: { type: 'boolean', short: 'v', default: false },
    },
  });
} catch (err) {
  process.stderr.write(`Error: ${err.message}\n\nRun "vin --help" for usage.\n`);
  process.exit(1);
}

const { values: opts, positionals } = args;

if (opts.help) {
  console.log(USAGE);
  process.exit(0);
}

if (opts.version) {
  console.log(version);
  process.exit(0);
}

// Strip the "render" subcommand if present
const files = positionals[0] === 'render' ? positionals.slice(1) : positionals;

// --- Cross-platform glob expansion ---
// On Windows, shells don't expand globs, so we handle *, ?, and [...] patterns.

function expandGlobs(patterns) {
  const expanded = [];
  for (const pattern of patterns) {
    if (/[*?[\]]/.test(pattern)) {
      const matches = globSync(pattern);
      if (matches.length === 0) {
        process.stderr.write(`Error: No files matched pattern "${pattern}"\n`);
        process.exit(1);
      }
      expanded.push(...matches);
    } else {
      expanded.push(pattern);
    }
  }
  return expanded;
}

const inputFiles = expandGlobs(files);

if (inputFiles.length === 0) {
  process.stderr.write('Error: No input files specified.\n\nRun "vin --help" for usage.\n');
  process.exit(1);
}

// --- Validate options ---

function inferFormat(outputPath) {
  const ext = extname(outputPath).toLowerCase();
  if (ext === '.png') return 'png';
  return 'svg';
}

const format = opts.format?.toLowerCase()
  ?? (opts.output ? inferFormat(opts.output) : 'svg');

if (format !== 'svg' && format !== 'png') {
  process.stderr.write(`Error: Unknown format "${format}". Supported formats: svg, png\n`);
  process.exit(1);
}

const scale = opts.scale ? Number(opts.scale) : 2;
if (opts.scale && (isNaN(scale) || scale <= 0)) {
  process.stderr.write(`Error: Invalid scale value "${opts.scale}". Must be a positive number.\n`);
  process.exit(1);
}

if (inputFiles.length > 1 && opts.output) {
  process.stderr.write('Error: Cannot use -o/--output with multiple input files. Use --outdir instead.\n');
  process.exit(1);
}

if (inputFiles.length > 1 && !opts.outdir) {
  process.stderr.write('Error: Multiple input files require --outdir.\n');
  process.exit(1);
}

// --- PNG renderer (lazy loaded) ---

let resvgModule = null;

async function renderPng(svg, scale) {
  if (!resvgModule) {
    try {
      resvgModule = await import('@resvg/resvg-js');
    } catch {
      process.stderr.write(
        'Error: PNG output requires @resvg/resvg-js.\n' +
        'Install with: npm install @resvg/resvg-js\n'
      );
      process.exit(1);
    }
  }
  const resvg = new resvgModule.Resvg(svg, {
    fitTo: { mode: 'zoom', value: scale },
  });
  return resvg.render().asPng();
}

// --- Helpers ---

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '-').toLowerCase() || 'untitled';
}

/**
 * Resolve the --page flag to a page index.
 * Accepts a 0-based numeric index or a page title (case-insensitive).
 */
function resolvePageIndex(pages, pageOpt) {
  if (pageOpt == null) return null;

  // Try numeric index
  const num = Number(pageOpt);
  if (Number.isInteger(num) && num >= 0 && num < pages.length) {
    return num;
  }

  // Try title match (case-insensitive)
  const idx = pages.findIndex(p => p.title.toLowerCase() === pageOpt.toLowerCase());
  if (idx >= 0) return idx;

  process.stderr.write(`Error: Page "${pageOpt}" not found. Available pages: ${pages.map((p, i) => `${i}="${p.title}"`).join(', ')}\n`);
  process.exit(1);
}

// --- Core rendering loop ---

async function main() {
  let hadErrors = false;

  for (const file of inputFiles) {
    // Read source
    let source;
    try {
      source = readFileSync(file, 'utf-8');
    } catch {
      process.stderr.write(`Error: Cannot read file "${file}"\n`);
      hadErrors = true;
      continue;
    }

    // Compile
    const { pages, diagnostics } = compile(source);

    // Print diagnostics to stderr
    if (diagnostics.length > 0 && !opts.quiet) {
      for (const d of diagnostics) {
        process.stderr.write(`${file}: ${formatDiagnostic(d)}\n`);
      }
    }

    if (hasErrors(diagnostics)) {
      hadErrors = true;
      continue;
    }

    // Determine which pages to output
    const selectedIndex = resolvePageIndex(pages, opts.page);
    const pagesToOutput = selectedIndex != null ? [pages[selectedIndex]] : pages;
    const isMultiPage = pagesToOutput.length > 1;

    // Multi-page with -o (no --page): error
    if (isMultiPage && opts.output) {
      process.stderr.write(`Error: "${file}" has ${pages.length} pages. Use --outdir for multi-page files, or --page to select one.\n`);
      hadErrors = true;
      continue;
    }

    for (let i = 0; i < pagesToOutput.length; i++) {
      const page = pagesToOutput[i];

      // Produce output
      let output;
      if (format === 'png') {
        output = await renderPng(page.svg, scale);
      } else {
        output = page.svg;
      }

      // Determine where to write
      if (opts.output) {
        // Single file with -o (guaranteed single page at this point)
        writeFileSync(opts.output, output);
        if (!opts.quiet) {
          process.stderr.write(`Wrote ${opts.output}\n`);
        }
      } else if (opts.outdir) {
        // Batch/outdir mode
        mkdirSync(opts.outdir, { recursive: true });
        const fileBase = basename(file, extname(file));
        const pageSuffix = isMultiPage ? `-${sanitizeFilename(page.title)}` : '';
        const outName = fileBase + pageSuffix + '.' + format;
        const outPath = join(opts.outdir, outName);
        writeFileSync(outPath, output);
        if (!opts.quiet) {
          process.stderr.write(`Wrote ${outPath}\n`);
        }
      } else {
        // Stdout — output first page only for multi-page
        if (format === 'png') {
          process.stdout.write(output);
        } else {
          process.stdout.write(output + '\n');
        }
        if (isMultiPage && i === 0) {
          if (!opts.quiet) {
            process.stderr.write(`Note: "${file}" has ${pages.length} pages. Only the first page is written to stdout. Use --outdir to export all pages.\n`);
          }
          break;
        }
      }
    }
  }

  if (hadErrors) {
    process.exit(1);
  }
}

main();

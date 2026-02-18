/**
 * Vin — Text-based wireframe markup language.
 *
 * Public API: compile() composes the full pipeline.
 *
 * Pipeline:
 *   Source string → Tokenize → Parse → Validate → Resolve → Layout → Render → Serialize → SVG string
 */

// Register all built-in controls
import './src/controls/index.js';

// Pipeline stages
import { tokenize } from './src/tokenizer.js';
import { parse } from './src/parser.js';
import { validate } from './src/validator.js';
import { resolve } from './src/resolver.js';
import { computeLayout } from './src/layout.js';
import { render } from './src/renderer.js';
import { serialize } from './src/serializer.js';
import { defaultTheme, createTheme } from './src/theme.js';
import { formatDiagnostic, hasErrors } from './src/diagnostics.js';

/**
 * Compile a .vin source string into SVG markup.
 *
 * Returns `svg` (the first page's SVG, for backward compatibility) and
 * `pages` (an array of all pages with their title, dimensions, and SVG).
 *
 * @param {string} source - .vin format source
 * @param {Object} [options]
 * @param {Object} [options.theme] - Theme overrides (merged with defaultTheme)
 * @returns {{ svg: string, pages: Array<{title: string, svg: string, width: number, height: number}>, diagnostics: import('./src/diagnostics.js').Diagnostic[] }}
 */
export function compile(source, options = {}) {
  const diagnostics = [];
  const theme = options.theme ? createTheme(options.theme) : defaultTheme;

  // Stage 1: Tokenize
  const tokens = tokenize(source, diagnostics);

  // Stage 2: Parse
  const ast = parse(tokens, diagnostics);

  // Stage 3: Validate
  validate(ast, diagnostics);

  // Stage 4: Resolve defaults
  const resolved = resolve(ast, diagnostics);

  // Stage 5: Compute layout
  const laid = computeLayout(resolved);

  // Stage 6 & 7: Render and serialize each page
  const pages = laid.pages.map(page => {
    const { svg: svgTree, warnings } = render(page, theme);

    for (const w of warnings) {
      diagnostics.push({
        severity: 'warning',
        message: w,
        span: null,
        source: 'renderer',
      });
    }

    return {
      title: page.title,
      width: page.width,
      height: page.height,
      svg: serialize(svgTree),
    };
  });

  return { svg: pages[0]?.svg ?? '', pages, diagnostics };
}

// Re-export individual stages for advanced use
export { tokenize } from './src/tokenizer.js';
export { parse } from './src/parser.js';
export { validate } from './src/validator.js';
export { resolve } from './src/resolver.js';
export { computeLayout } from './src/layout.js';
export { render } from './src/renderer.js';
export { serialize } from './src/serializer.js';
export { defaultTheme, createTheme } from './src/theme.js';
export { formatDiagnostic, hasErrors } from './src/diagnostics.js';
export { registerControl, getControl, hasControl, getControlTypes } from './src/registry.js';

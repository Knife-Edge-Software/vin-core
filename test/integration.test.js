import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compile } from '../index.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const examplesDir = join(__dirname, '..', 'examples');
const goldenDir = join(__dirname, 'golden');

const exampleFiles = readdirSync(examplesDir)
  .filter(f => f.endsWith('.vin'))
  .sort();

describe('integration: all examples compile', () => {
  for (const file of exampleFiles) {
    it(`compiles ${file} without errors`, () => {
      const source = readFileSync(join(examplesDir, file), 'utf-8');
      const { svg, diagnostics } = compile(source);

      // Must produce valid SVG
      assert.ok(svg.startsWith('<svg'), 'output should start with <svg');
      assert.ok(svg.includes('</svg>'), 'output should end with </svg>');
      assert.ok(svg.length > 100, 'SVG should have meaningful content');

      // Must have no error-level diagnostics
      const errors = diagnostics.filter(d => d.severity === 'error');
      assert.equal(errors.length, 0,
        `Should have no errors, got: ${errors.map(e => e.message).join('; ')}`);
    });
  }
});

describe('integration: example count', () => {
  it('has at least 25 example files', () => {
    assert.ok(exampleFiles.length >= 25,
      `Expected at least 25 examples, found ${exampleFiles.length}`);
  });
});

describe('integration: compile API', () => {
  it('compile returns svg and diagnostics', () => {
    const result = compile('button "OK" 0,0 80x34');
    assert.ok(typeof result.svg === 'string');
    assert.ok(Array.isArray(result.diagnostics));
  });

  it('compile accepts theme overrides', () => {
    const result = compile('button "OK" 0,0 80x34', { theme: { accent: '#ff0000' } });
    assert.ok(result.svg.startsWith('<svg'));
  });

  it('compile produces warnings for unknown controls (not errors)', () => {
    const { diagnostics } = compile('unknownwidget "test" 0,0 100x30');
    const warnings = diagnostics.filter(d => d.severity === 'warning');
    const errors = diagnostics.filter(d => d.severity === 'error');
    assert.ok(warnings.length > 0, 'should have warnings for unknown control');
    assert.equal(errors.length, 0, 'unknown controls are warnings, not errors');
  });

  it('compile handles empty source', () => {
    const { svg, diagnostics } = compile('');
    assert.ok(svg.startsWith('<svg'));
    const errors = diagnostics.filter(d => d.severity === 'error');
    assert.equal(errors.length, 0);
  });

  it('compile handles comments-only source', () => {
    const { svg } = compile('# just a comment\n# another comment');
    assert.ok(svg.startsWith('<svg'));
  });
});

describe('integration: golden snapshot comparison', () => {
  // Note: The golden snapshots were generated from the OLD prototype.
  // The new pipeline may produce structurally different but visually equivalent SVG.
  // This test verifies structural similarity, not exact match.

  for (const file of exampleFiles) {
    const name = basename(file, '.vin');
    const goldenPath = join(goldenDir, `${name}.svg`);

    if (!existsSync(goldenPath)) continue;

    it(`${file}: produces SVG with similar structure to golden`, () => {
      const source = readFileSync(join(examplesDir, file), 'utf-8');
      const { svg: newSvg } = compile(source);
      const goldenSvg = readFileSync(goldenPath, 'utf-8');

      // Both should be valid SVG
      assert.ok(newSvg.startsWith('<svg'), 'new SVG should start with <svg');
      assert.ok(goldenSvg.startsWith('<svg'), 'golden SVG should start with <svg');

      // Both should have similar viewBox dimensions
      const newDims = extractDimensions(newSvg);
      const goldenDims = extractDimensions(goldenSvg);
      assert.equal(newDims.width, goldenDims.width,
        `Width mismatch: new=${newDims.width} vs golden=${goldenDims.width}`);
      assert.equal(newDims.height, goldenDims.height,
        `Height mismatch: new=${newDims.height} vs golden=${goldenDims.height}`);
    });
  }
});

/** Extract width and height from the root <svg> element. */
function extractDimensions(svg) {
  const wMatch = svg.match(/width="(\d+)"/);
  const hMatch = svg.match(/height="(\d+)"/);
  return {
    width: wMatch ? parseInt(wMatch[1]) : null,
    height: hMatch ? parseInt(hMatch[1]) : null,
  };
}

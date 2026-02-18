import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

// Register controls
import '../src/controls/index.js';
import { resolve } from '../src/resolver.js';
import { tokenize } from '../src/tokenizer.js';
import { parse } from '../src/parser.js';

function compile(source) {
  const diagnostics = [];
  const tokens = tokenize(source, diagnostics);
  const ast = parse(tokens, diagnostics);
  const resolved = resolve(ast, diagnostics);
  return { resolved, diagnostics };
}

describe('resolver', () => {
  describe('default sizes', () => {
    it('fills in default width and height', () => {
      const { resolved } = compile('button "OK"');
      const btn = resolved.pages[0].controls[0];
      assert.equal(btn.width, 100);  // button default
      assert.equal(btn.height, 34);
    });

    it('preserves explicit sizes', () => {
      const { resolved } = compile('button "OK" 200x50');
      const btn = resolved.pages[0].controls[0];
      assert.equal(btn.width, 200);
      assert.equal(btn.height, 50);
    });

    it('fills width but preserves explicit height', () => {
      // Can't test partial — parser gives both or neither
      // Just verify full size override works
      const { resolved } = compile('textfield "name" 300x40');
      assert.equal(resolved.pages[0].controls[0].width, 300);
      assert.equal(resolved.pages[0].controls[0].height, 40);
    });
  });

  describe('default properties', () => {
    it('merges schema defaults into properties', () => {
      const { resolved } = compile('button "OK" 10,10');
      const btn = resolved.pages[0].controls[0];
      assert.equal(btn.properties.variant, 'default');
      assert.equal(btn.properties.disabled, false);
    });

    it('user properties override schema defaults', () => {
      const source = 'button "OK" 10,10\n  variant: primary';
      const { resolved } = compile(source);
      assert.equal(resolved.pages[0].controls[0].properties.variant, 'primary');
    });

    it('preserves non-schema properties (layout etc)', () => {
      const source = 'panel "P" 0,0 200x200\n  layout: column\n  gap: 12';
      const { resolved } = compile(source);
      assert.equal(resolved.pages[0].controls[0].properties.layout, 'column');
      assert.equal(resolved.pages[0].controls[0].properties.gap, 12);
    });
  });

  describe('position handling', () => {
    it('preserves null positions when unspecified', () => {
      const { resolved } = compile('button "OK" 80x34');
      assert.equal(resolved.pages[0].controls[0].x, null);
      assert.equal(resolved.pages[0].controls[0].y, null);
      assert.equal(resolved.pages[0].controls[0].hasPosition, false);
    });

    it('preserves explicit positions', () => {
      const { resolved } = compile('button "OK" 10,20 80x34');
      assert.equal(resolved.pages[0].controls[0].x, 10);
      assert.equal(resolved.pages[0].controls[0].y, 20);
      assert.equal(resolved.pages[0].controls[0].hasPosition, true);
    });
  });

  describe('immutability', () => {
    it('does not mutate the input AST', () => {
      const diagnostics = [];
      const tokens = tokenize('button "OK" 10,10', diagnostics);
      const ast = parse(tokens, diagnostics);

      // Save original state
      const originalProps = { ...ast.pages[0].controls[0].properties };
      const originalWidth = ast.pages[0].controls[0].width;

      resolve(ast, diagnostics);

      // Verify AST is unchanged
      assert.deepEqual(ast.pages[0].controls[0].properties, originalProps);
      assert.equal(ast.pages[0].controls[0].width, originalWidth);
    });
  });

  describe('nested resolution', () => {
    it('resolves children recursively', () => {
      const source = [
        'panel "P" 0,0 300x200',
        '  button "OK" 80x34',
        '  checkbox "Agree"',
      ].join('\n');
      const { resolved } = compile(source);
      const panel = resolved.pages[0].controls[0];
      assert.equal(panel.children.length, 2);
      // Button should have resolved size
      assert.equal(panel.children[0].width, 80);
      assert.equal(panel.children[0].height, 34);
      // Checkbox should have default size
      assert.equal(panel.children[1].width, 120);
      assert.equal(panel.children[1].height, 20);
    });
  });

  describe('page resolution', () => {
    it('copies page through', () => {
      const { resolved } = compile('page "Test" 500x400');
      assert.equal(resolved.pages[0].title, 'Test');
      assert.equal(resolved.pages[0].width, 500);
      assert.equal(resolved.pages[0].height, 400);
    });
  });

  describe('id propagation', () => {
    it('propagates control id through resolution', () => {
      const { resolved } = compile('button "OK" id: my-btn');
      assert.equal(resolved.pages[0].controls[0].id, 'my-btn');
    });

    it('propagates page id through resolution', () => {
      const { resolved } = compile('page "Test" 400x300 id: test-page');
      assert.equal(resolved.pages[0].id, 'test-page');
    });

    it('preserves null id when not specified', () => {
      const { resolved } = compile('button "OK"');
      assert.equal(resolved.pages[0].controls[0].id, null);
    });

    it('propagates id through nested children', () => {
      const source = [
        'panel "P" 0,0 300x200',
        '  button "OK" id: nested-btn',
      ].join('\n');
      const { resolved } = compile(source);
      assert.equal(resolved.pages[0].controls[0].children[0].id, 'nested-btn');
    });
  });

  describe('propertySpans propagation', () => {
    it('preserves user-specified propertySpans', () => {
      const source = 'button "OK" 10,10\n  variant: primary';
      const { resolved } = compile(source);
      const btn = resolved.pages[0].controls[0];
      assert.ok(btn.propertySpans.variant);
      assert.equal(btn.propertySpans.variant.start.line, 2);
    });

    it('does not add spans for schema-default properties', () => {
      const { resolved } = compile('button "OK" 10,10');
      const btn = resolved.pages[0].controls[0];
      // 'variant' gets default value 'default' from schema but no span
      assert.equal(btn.properties.variant, 'default');
      assert.equal(btn.propertySpans.variant, undefined);
    });

    it('propagates propertySpans on pages', () => {
      const source = 'page "Test" 400x300\n  background: dark';
      const { resolved } = compile(source);
      assert.ok(resolved.pages[0].propertySpans.background);
      assert.equal(resolved.pages[0].propertySpans.background.start.line, 2);
    });

    it('propagates propertySpans through nested children', () => {
      const source = [
        'panel "P" 0,0 300x200',
        '  button "OK" 80x34',
        '    variant: primary',
      ].join('\n');
      const { resolved } = compile(source);
      const btn = resolved.pages[0].controls[0].children[0];
      assert.ok(btn.propertySpans.variant);
      assert.equal(btn.propertySpans.variant.start.line, 3);
    });
  });

  describe('unknown controls', () => {
    it('uses fallback defaults for unknown controls', () => {
      const { resolved } = compile('foobar "test"');
      assert.equal(resolved.pages[0].controls[0].width, 100);
      assert.equal(resolved.pages[0].controls[0].height, 30);
    });
  });
});

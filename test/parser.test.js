import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { tokenize } from '../src/tokenizer.js';

import { parse } from '../src/parser.js';

function compile(source) {
  const diagnostics = [];
  const tokens = tokenize(source, diagnostics);
  const ast = parse(tokens, diagnostics);
  return { ast, diagnostics };
}

describe('parser', () => {
  describe('page declaration', () => {
    it('parses a page with title and size', () => {
      const { ast } = compile('page "Settings" 500x400');
      assert.equal(ast.pages[0].title, 'Settings');
      assert.equal(ast.pages[0].width, 500);
      assert.equal(ast.pages[0].height, 400);
    });

    it('defaults page to 800x600 when omitted', () => {
      const { ast } = compile('button "OK" 10,20');
      assert.equal(ast.pages[0].title, 'Untitled');
      assert.equal(ast.pages[0].width, 800);
      assert.equal(ast.pages[0].height, 600);
    });

    it('attaches properties to page', () => {
      const source = 'page "Test" 400x300\n  background: dark';
      const { ast } = compile(source);
      assert.equal(ast.pages[0].properties.background, 'dark');
    });
  });

  describe('flat controls', () => {
    it('parses a single control', () => {
      const { ast } = compile('button "OK" 10,20 80x34');
      assert.equal(ast.pages[0].controls.length, 1);
      const btn = ast.pages[0].controls[0];
      assert.equal(btn.type, 'button');
      assert.equal(btn.label, 'OK');
      assert.equal(btn.x, 10);
      assert.equal(btn.y, 20);
      assert.equal(btn.width, 80);
      assert.equal(btn.height, 34);
      assert.equal(btn.hasPosition, true);
    });

    it('uses null for unspecified position', () => {
      const { ast } = compile('button "OK" 80x34');
      const btn = ast.pages[0].controls[0];
      assert.equal(btn.x, null);
      assert.equal(btn.y, null);
      assert.equal(btn.hasPosition, false);
    });

    it('uses null for unspecified size', () => {
      const { ast } = compile('button "OK"');
      const btn = ast.pages[0].controls[0];
      assert.equal(btn.width, null);
      assert.equal(btn.height, null);
    });

    it('parses multiple top-level controls', () => {
      const source = [
        'button "A" 10,10',
        'button "B" 10,50',
      ].join('\n');
      const { ast } = compile(source);
      assert.equal(ast.pages[0].controls.length, 2);
      assert.equal(ast.pages[0].controls[0].label, 'A');
      assert.equal(ast.pages[0].controls[1].label, 'B');
    });
  });

  describe('properties', () => {
    it('attaches properties to controls', () => {
      const source = [
        'button "Save" 10,10',
        '  variant: primary',
        '  disabled: true',
      ].join('\n');
      const { ast } = compile(source);
      assert.equal(ast.pages[0].controls[0].properties.variant, 'primary');
      assert.equal(ast.pages[0].controls[0].properties.disabled, true);
    });

    it('warns about orphan properties', () => {
      const { diagnostics } = compile('  variant: primary');
      assert.equal(diagnostics.length, 1);
      assert.ok(diagnostics[0].message.includes('Orphan property'));
    });
  });

  describe('nesting', () => {
    it('nests children by indentation', () => {
      const source = [
        'panel "sidebar" 0,0 200x600',
        '  button "Home" 200x34',
        '  button "Settings" 200x34',
      ].join('\n');
      const { ast } = compile(source);
      assert.equal(ast.pages[0].controls.length, 1);
      const panel = ast.pages[0].controls[0];
      assert.equal(panel.type, 'panel');
      assert.equal(panel.children.length, 2);
      assert.equal(panel.children[0].label, 'Home');
      assert.equal(panel.children[1].label, 'Settings');
    });

    it('handles deep nesting', () => {
      const source = [
        'panel "outer" 0,0 400x400',
        '  panel "inner" 300x300',
        '    button "Deep" 100x34',
      ].join('\n');
      const { ast } = compile(source);
      const outer = ast.pages[0].controls[0];
      assert.equal(outer.children.length, 1);
      const inner = outer.children[0];
      assert.equal(inner.type, 'panel');
      assert.equal(inner.children.length, 1);
      assert.equal(inner.children[0].label, 'Deep');
    });

    it('attaches properties to nested controls', () => {
      const source = [
        'panel "p" 0,0 200x200',
        '  layout: column',
        '  button "OK" 80x34',
        '    variant: primary',
      ].join('\n');
      const { ast } = compile(source);
      const panel = ast.pages[0].controls[0];
      assert.equal(panel.properties.layout, 'column');
      assert.equal(panel.children[0].properties.variant, 'primary');
    });

    it('does not break nesting on blank lines', () => {
      const source = [
        'panel "p" 0,0 200x200',
        '  button "A" 80x34',
        '',
        '  button "B" 80x34',
      ].join('\n');
      const { ast } = compile(source);
      assert.equal(ast.pages[0].controls[0].children.length, 2);
    });

    it('does not break nesting on comment lines', () => {
      const source = [
        'panel "p" 0,0 200x200',
        '  button "A" 80x34',
        '  # a comment',
        '  button "B" 80x34',
      ].join('\n');
      const { ast } = compile(source);
      assert.equal(ast.pages[0].controls[0].children.length, 2);
    });

    it('pops back to top level with dedent', () => {
      const source = [
        'panel "p" 0,0 200x200',
        '  button "Inside" 80x34',
        'button "Outside" 10,300 80x34',
      ].join('\n');
      const { ast } = compile(source);
      assert.equal(ast.pages[0].controls.length, 2);
      assert.equal(ast.pages[0].controls[0].children.length, 1);
      assert.equal(ast.pages[0].controls[1].label, 'Outside');
      assert.equal(ast.pages[0].controls[1].children.length, 0);
    });
  });

  describe('spans', () => {
    it('records spans on controls', () => {
      const { ast } = compile('button "OK" 10,20');
      assert.ok(ast.pages[0].controls[0].span);
      assert.equal(ast.pages[0].controls[0].span.start.line, 1);
    });

    it('records spans on page', () => {
      const { ast } = compile('page "Test" 400x300');
      assert.ok(ast.pages[0].span);
      assert.equal(ast.pages[0].span.start.line, 1);
    });
  });

  describe('propertySpans', () => {
    it('records per-property spans on controls', () => {
      const source = [
        'button "Save" 10,10',
        '  variant: primary',
        '  disabled: true',
      ].join('\n');
      const { ast } = compile(source);
      const btn = ast.pages[0].controls[0];
      assert.ok(btn.propertySpans.variant);
      assert.equal(btn.propertySpans.variant.start.line, 2);
      assert.ok(btn.propertySpans.disabled);
      assert.equal(btn.propertySpans.disabled.start.line, 3);
    });

    it('records per-property spans on pages', () => {
      const source = [
        'page "Test" 400x300',
        '  background: dark',
      ].join('\n');
      const { ast } = compile(source);
      assert.ok(ast.pages[0].propertySpans.background);
      assert.equal(ast.pages[0].propertySpans.background.start.line, 2);
    });

    it('initializes propertySpans as empty when no properties', () => {
      const { ast } = compile('button "OK" 10,20');
      assert.deepEqual(ast.pages[0].controls[0].propertySpans, {});
    });

    it('does not include id in propertySpans', () => {
      const source = 'button "OK"\n  id: my-btn';
      const { ast } = compile(source);
      assert.equal(ast.pages[0].controls[0].propertySpans.id, undefined);
    });
  });

  describe('format version', () => {
    it('parses vin-format version header', () => {
      const { ast, diagnostics } = compile('vin-format: 1\npage "Test" 400x300');
      assert.equal(ast.version, 1);
      assert.equal(diagnostics.length, 0);
    });

    it('defaults version to 1 when header is omitted', () => {
      const { ast } = compile('page "Test" 400x300');
      assert.equal(ast.version, 1);
    });

    it('warns on unrecognized future version', () => {
      const { ast, diagnostics } = compile('vin-format: 99\npage "Test" 400x300');
      assert.equal(ast.version, 99);
      assert.equal(diagnostics.length, 1);
      assert.ok(diagnostics[0].message.includes('Unrecognized'));
      assert.equal(diagnostics[0].severity, 'warning');
    });

    it('allows blank lines and comments before version header', () => {
      const source = '\n# comment\nvin-format: 1\npage "Test" 400x300';
      const { ast, diagnostics } = compile(source);
      assert.equal(ast.version, 1);
      assert.equal(diagnostics.length, 0);
    });

    it('treats vin-format after controls as orphan property', () => {
      const source = 'page "Test" 400x300\nvin-format: 1';
      const { ast, diagnostics } = compile(source);
      assert.equal(ast.version, 1); // remains default
      assert.ok(diagnostics.some(d => d.message.includes('Orphan property')));
    });

    it('warns on invalid version value', () => {
      const { diagnostics } = compile('vin-format: abc\npage "Test" 400x300');
      assert.ok(diagnostics.some(d => d.message.includes('Invalid')));
    });
  });

  describe('id field', () => {
    it('parses inline id on page declaration', () => {
      const { ast } = compile('page "Login" 400x450 id: login');
      assert.equal(ast.pages[0].id, 'login');
    });

    it('parses inline id on control', () => {
      const { ast } = compile('button "OK" id: my-btn');
      assert.equal(ast.pages[0].controls[0].id, 'my-btn');
    });

    it('promotes id property line to first-class field', () => {
      const source = 'button "OK"\n  id: my-btn';
      const { ast } = compile(source);
      assert.equal(ast.pages[0].controls[0].id, 'my-btn');
      assert.equal(ast.pages[0].controls[0].properties.id, undefined);
    });

    it('promotes id property line on page to first-class field', () => {
      const source = 'page "Test" 400x300\n  id: test-page';
      const { ast } = compile(source);
      assert.equal(ast.pages[0].id, 'test-page');
      assert.equal(ast.pages[0].properties.id, undefined);
    });

    it('defaults id to null when not specified', () => {
      const { ast } = compile('button "OK"');
      assert.equal(ast.pages[0].controls[0].id, null);
    });

    it('defaults page id to null when not specified', () => {
      const { ast } = compile('page "Test" 400x300');
      assert.equal(ast.pages[0].id, null);
    });

    it('inline id takes precedence over property id', () => {
      const source = 'button "OK" id: inline\n  id: property';
      const { ast } = compile(source);
      assert.equal(ast.pages[0].controls[0].id, 'inline');
    });

    it('rejects property-form id with boolean false value', () => {
      const source = 'button "OK"\n  id: false';
      const { ast, diagnostics } = compile(source);
      assert.equal(ast.pages[0].controls[0].id, null);
      assert.ok(diagnostics.some(d => d.message.includes('Invalid property-form id')));
    });

    it('rejects property-form id with numeric 0 value', () => {
      const source = 'button "OK"\n  id: 0';
      const { ast, diagnostics } = compile(source);
      assert.equal(ast.pages[0].controls[0].id, null);
      assert.ok(diagnostics.some(d => d.message.includes('Invalid property-form id')));
    });

    it('rejects property-form id with pipe-delimited list value', () => {
      const source = 'button "OK"\n  id: a|b';
      const { ast, diagnostics } = compile(source);
      assert.equal(ast.pages[0].controls[0].id, null);
      assert.ok(diagnostics.some(d => d.message.includes('Invalid property-form id')));
    });

    it('rejects property-form id with boolean true value', () => {
      const source = 'button "OK"\n  id: true';
      const { ast, diagnostics } = compile(source);
      assert.equal(ast.pages[0].controls[0].id, null);
      assert.ok(diagnostics.some(d => d.message.includes('Invalid property-form id')));
    });

    it('implicit default page has null id', () => {
      const { ast } = compile('button "OK" 10,20');
      assert.equal(ast.pages[0].id, null);
    });

    it('empty source default page has null id', () => {
      const { ast } = compile('');
      assert.equal(ast.pages[0].id, null);
    });
  });

  describe('complete document', () => {
    it('parses a realistic document', () => {
      const source = [
        'page "Login" 400x300',
        '',
        'heading "Sign In" 20,20',
        '  level: 2',
        '',
        'label "Email" 20,60',
        'textfield "email" 20,80 360x32',
        '  placeholder: "you@example.com"',
        '',
        'label "Password" 20,130',
        'textfield "password" 20,150 360x32',
        '  mask: true',
        '',
        'button "Login" 20,200 360x36',
        '  variant: primary',
      ].join('\n');

      const { ast, diagnostics } = compile(source);
      assert.equal(diagnostics.length, 0);
      assert.equal(ast.pages[0].title, 'Login');
      // heading, label, textfield, label, textfield, button = 6
      assert.equal(ast.pages[0].controls.length, 6);
      assert.equal(ast.pages[0].controls[0].type, 'heading');
      assert.equal(ast.pages[0].controls[0].properties.level, 2);
      assert.equal(ast.pages[0].controls[5].type, 'button');
      assert.equal(ast.pages[0].controls[5].properties.variant, 'primary');
    });
  });

  describe('multi-page', () => {
    it('parses two pages with their own controls', () => {
      const source = [
        'page "Login" 400x500',
        'button "Sign In" 20,20 100x34',
        '',
        'page "Dashboard" 800x600',
        'heading "Welcome" 20,20',
      ].join('\n');
      const { ast, diagnostics } = compile(source);
      assert.equal(diagnostics.length, 0);
      assert.equal(ast.pages.length, 2);
      assert.equal(ast.pages[0].title, 'Login');
      assert.equal(ast.pages[0].width, 400);
      assert.equal(ast.pages[0].height, 500);
      assert.equal(ast.pages[0].controls.length, 1);
      assert.equal(ast.pages[0].controls[0].type, 'button');
      assert.equal(ast.pages[1].title, 'Dashboard');
      assert.equal(ast.pages[1].width, 800);
      assert.equal(ast.pages[1].height, 600);
      assert.equal(ast.pages[1].controls.length, 1);
      assert.equal(ast.pages[1].controls[0].type, 'heading');
    });

    it('creates implicit page for controls before first page declaration', () => {
      const source = [
        'button "Orphan" 20,20 100x34',
        '',
        'page "Main" 400x300',
        'button "OK" 20,20 80x34',
      ].join('\n');
      const { ast } = compile(source);
      assert.equal(ast.pages.length, 2);
      assert.equal(ast.pages[0].title, 'Untitled');
      assert.equal(ast.pages[0].width, 800);
      assert.equal(ast.pages[0].controls.length, 1);
      assert.equal(ast.pages[0].controls[0].label, 'Orphan');
      assert.equal(ast.pages[1].title, 'Main');
      assert.equal(ast.pages[1].controls.length, 1);
    });

    it('attaches properties to correct page in multi-page', () => {
      const source = [
        'page "A" 400x300',
        '  background: light',
        'page "B" 500x400',
        '  background: dark',
      ].join('\n');
      const { ast } = compile(source);
      assert.equal(ast.pages[0].properties.background, 'light');
      assert.equal(ast.pages[1].properties.background, 'dark');
    });

    it('handles three pages with varying sizes', () => {
      const source = [
        'page "Small" 200x100',
        'button "A" 10,10',
        'page "Medium" 400x300',
        'button "B" 10,10',
        'page "Large" 800x600',
        'button "C" 10,10',
      ].join('\n');
      const { ast } = compile(source);
      assert.equal(ast.pages.length, 3);
      assert.equal(ast.pages[0].title, 'Small');
      assert.equal(ast.pages[0].width, 200);
      assert.equal(ast.pages[1].title, 'Medium');
      assert.equal(ast.pages[1].width, 400);
      assert.equal(ast.pages[2].title, 'Large');
      assert.equal(ast.pages[2].width, 800);
    });

    it('handles empty pages (no controls)', () => {
      const source = [
        'page "Empty" 400x300',
        'page "Also Empty" 500x400',
      ].join('\n');
      const { ast } = compile(source);
      assert.equal(ast.pages.length, 2);
      assert.equal(ast.pages[0].controls.length, 0);
      assert.equal(ast.pages[1].controls.length, 0);
    });

    it('warns when page is nested inside a control', () => {
      const source = [
        'panel "P" 0,0 200x200',
        '  page "Nested" 400x300',
      ].join('\n');
      const { diagnostics } = compile(source);
      assert.ok(diagnostics.some(d => d.message.includes('top level')));
    });
  });
});

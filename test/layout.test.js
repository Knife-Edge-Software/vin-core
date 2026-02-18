import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

import '../src/controls/index.js';
import { tokenize } from '../src/tokenizer.js';
import { parse } from '../src/parser.js';
import { resolve } from '../src/resolver.js';
import { computeLayout } from '../src/layout.js';

function layout(source) {
  const diagnostics = [];
  const tokens = tokenize(source, diagnostics);
  const ast = parse(tokens, diagnostics);
  const resolved = resolve(ast, diagnostics);
  return computeLayout(resolved);
}

describe('layout engine', () => {
  describe('absolute positioning', () => {
    it('preserves explicit x,y positions', () => {
      const doc = layout('button "OK" 50,100 80x34');
      const btn = doc.pages[0].controls[0];
      assert.equal(btn.x, 50);
      assert.equal(btn.y, 100);
    });

    it('defaults to 0,0 when position unspecified at top level', () => {
      const doc = layout('button "OK" 80x34');
      assert.equal(doc.pages[0].controls[0].x, 0);
      assert.equal(doc.pages[0].controls[0].y, 0);
    });
  });

  describe('id propagation', () => {
    it('propagates control id through layout', () => {
      const doc = layout('button "OK" 50,100 80x34 id: my-btn');
      assert.equal(doc.pages[0].controls[0].id, 'my-btn');
    });

    it('propagates page id through layout', () => {
      const doc = layout('page "Test" 400x300 id: test-page');
      assert.equal(doc.pages[0].id, 'test-page');
    });

    it('preserves null id when not specified', () => {
      const doc = layout('button "OK" 80x34');
      assert.equal(doc.pages[0].controls[0].id, null);
    });

    it('propagates id through laid-out children', () => {
      const source = [
        'column 0,0 200x300',
        '  padding: 0',
        '  gap: 10',
        '  button "A" 200x30 id: btn-a',
        '  button "B" 200x30 id: btn-b',
      ].join('\n');
      const doc = layout(source);
      assert.equal(doc.pages[0].controls[0].children[0].id, 'btn-a');
      assert.equal(doc.pages[0].controls[0].children[1].id, 'btn-b');
    });
  });

  describe('column layout', () => {
    it('stacks children vertically with gap', () => {
      const source = [
        'column 0,0 200x300',
        '  gap: 10',
        '  padding: 0',
        '',
        '  button "A" 200x30',
        '  button "B" 200x30',
        '  button "C" 200x30',
      ].join('\n');
      const doc = layout(source);
      const p = doc.pages[0].controls[0];
      assert.equal(p.children.length, 3);
      assert.equal(p.children[0].y, 0);
      assert.equal(p.children[1].y, 40); // 30 + 10 gap
      assert.equal(p.children[2].y, 80); // 40 + 30 + 10
    });

    it('applies padding', () => {
      const source = [
        'column 0,0 200x300',
        '  padding: 16',
        '  gap: 0',
        '',
        '  button "A" 168x30',
      ].join('\n');
      const doc = layout(source);
      const btn = doc.pages[0].controls[0].children[0];
      assert.equal(btn.x, 16);
      assert.equal(btn.y, 16);
    });

    it('applies contentOffset for labeled panels', () => {
      const source = [
        'panel "Title" 0,0 200x300',
        '  layout: column',
        '  padding: 0',
        '  gap: 0',
        '',
        '  button "A" 200x30',
      ].join('\n');
      const doc = layout(source);
      const btn = doc.pages[0].controls[0].children[0];
      // Panel with label has contentOffset {top: 28}
      assert.equal(btn.y, 28);
    });

    it('applies contentOffset + padding', () => {
      const source = [
        'panel "Title" 0,0 200x300',
        '  layout: column',
        '  padding: 10',
        '  gap: 0',
        '',
        '  button "A" 180x30',
      ].join('\n');
      const doc = layout(source);
      const btn = doc.pages[0].controls[0].children[0];
      // contentOffset 28 + padding 10 = 38
      assert.equal(btn.x, 10);
      assert.equal(btn.y, 38);
    });
  });

  describe('row layout', () => {
    it('flows children horizontally', () => {
      const source = [
        'row 300x40',
        '  gap: 10',
        '  padding: 0',
        '',
        '  button "A" 80x34',
        '  button "B" 80x34',
        '  button "C" 80x34',
      ].join('\n');
      const doc = layout(source);
      const r = doc.pages[0].controls[0];
      assert.equal(r.children[0].x, 0);
      assert.equal(r.children[1].x, 90);  // 80 + 10
      assert.equal(r.children[2].x, 180); // 90 + 80 + 10
    });
  });

  describe('wrap layout', () => {
    it('wraps to next line when exceeding width', () => {
      const source = [
        'panel "" 0,0 200x200',
        '  layout: wrap',
        '  padding: 0',
        '  gap: 10',
        '',
        '  badge "A" 80x22',
        '  badge "B" 80x22',
        '  badge "C" 80x22',
      ].join('\n');
      const doc = layout(source);
      const p = doc.pages[0].controls[0];
      // First two fit: 80 + 10 + 80 = 170 < 200
      assert.equal(p.children[0].x, 0);
      assert.equal(p.children[0].y, 0);
      assert.equal(p.children[1].x, 90);
      assert.equal(p.children[1].y, 0);
      // Third wraps: 170 + 10 + 80 = 260 > 200
      assert.equal(p.children[2].x, 0);
      assert.equal(p.children[2].y, 32); // 22 + 10 gap
    });
  });

  describe('alignment', () => {
    it('center aligns on cross axis in column', () => {
      const source = [
        'column 0,0 200x200',
        '  align: center',
        '  padding: 0',
        '  gap: 0',
        '',
        '  button "A" 100x30',
      ].join('\n');
      const doc = layout(source);
      const btn = doc.pages[0].controls[0].children[0];
      assert.equal(btn.x, 50); // (200 - 100) / 2
    });

    it('end aligns on cross axis in column', () => {
      const source = [
        'column 0,0 200x200',
        '  align: end',
        '  padding: 0',
        '  gap: 0',
        '',
        '  button "A" 100x30',
      ].join('\n');
      const doc = layout(source);
      const btn = doc.pages[0].controls[0].children[0];
      assert.equal(btn.x, 100); // 200 - 100
    });
  });

  describe('justify', () => {
    it('justify center positions group in middle', () => {
      const source = [
        'column 0,0 200x200',
        '  justify: center',
        '  padding: 0',
        '  gap: 10',
        '',
        '  button "A" 200x30',
        '  button "B" 200x30',
      ].join('\n');
      const doc = layout(source);
      // Total content: 30 + 10 + 30 = 70
      // Offset: (200 - 70) / 2 = 65
      assert.equal(doc.pages[0].controls[0].children[0].y, 65);
      assert.equal(doc.pages[0].controls[0].children[1].y, 105); // 65 + 30 + 10
    });

    it('justify end positions group at bottom', () => {
      const source = [
        'column 0,0 200x200',
        '  justify: end',
        '  padding: 0',
        '  gap: 10',
        '',
        '  button "A" 200x30',
        '  button "B" 200x30',
      ].join('\n');
      const doc = layout(source);
      // Total content: 30 + 10 + 30 = 70
      // Offset: 200 - 70 = 130
      assert.equal(doc.pages[0].controls[0].children[0].y, 130);
      assert.equal(doc.pages[0].controls[0].children[1].y, 170);
    });

    it('justify space-between distributes evenly', () => {
      const source = [
        'column 0,0 200x200',
        '  justify: space-between',
        '  padding: 0',
        '  gap: 0',
        '',
        '  button "A" 200x30',
        '  button "B" 200x30',
      ].join('\n');
      const doc = layout(source);
      assert.equal(doc.pages[0].controls[0].children[0].y, 0);
      // Space between: (200 - 60) / 1 = 140; second at 0 + 30 + 140 = 170
      assert.equal(doc.pages[0].controls[0].children[1].y, 170);
    });
  });

  describe('flex', () => {
    it('distributes remaining space by flex factor', () => {
      const source = [
        'column 0,0 200x200',
        '  padding: 0',
        '  gap: 0',
        '',
        '  button "Fixed" 200x50',
        '  panel "" 200x10',
        '    flex: 1',
      ].join('\n');
      const doc = layout(source);
      const fixed = doc.pages[0].controls[0].children[0];
      const flexy = doc.pages[0].controls[0].children[1];
      assert.equal(fixed.height, 50);
      assert.equal(flexy.height, 150); // 200 - 50
    });
  });

  describe('align-self', () => {
    it('overrides parent align for individual child', () => {
      const source = [
        'column 0,0 200x200',
        '  align: start',
        '  padding: 0',
        '  gap: 0',
        '',
        '  button "Left" 100x30',
        '  button "Center" 100x30',
        '    align-self: center',
      ].join('\n');
      const doc = layout(source);
      assert.equal(doc.pages[0].controls[0].children[0].x, 0);
      assert.equal(doc.pages[0].controls[0].children[1].x, 50); // (200-100)/2
    });
  });

  describe('mixed positioning', () => {
    it('absolute children bypass layout flow', () => {
      const source = [
        'column 0,0 200x200',
        '  padding: 0',
        '  gap: 10',
        '',
        '  button "Flow1" 200x30',
        '  button "Abs" 50,150 60x30',
        '  button "Flow2" 200x30',
      ].join('\n');
      const doc = layout(source);
      const p = doc.pages[0].controls[0];
      // Flow1 at y=0, Flow2 at y=40 (30 + 10), Abs at 50,150
      assert.equal(p.children[0].y, 0);
      assert.equal(p.children[1].x, 50);
      assert.equal(p.children[1].y, 150);
      assert.equal(p.children[2].y, 40); // 30 + 10 gap
    });
  });

  describe('implicit layout', () => {
    it('row control auto-layouts horizontally', () => {
      const source = [
        'row 300x40',
        '  gap: 10',
        '  padding: 0',
        '',
        '  button "A" 80x34',
        '  button "B" 80x34',
      ].join('\n');
      const doc = layout(source);
      assert.equal(doc.pages[0].controls[0].children[0].x, 0);
      assert.equal(doc.pages[0].controls[0].children[1].x, 90);
    });

    it('column control auto-layouts vertically', () => {
      const source = [
        'column 200x200',
        '  gap: 10',
        '  padding: 0',
        '',
        '  button "A" 200x30',
        '  button "B" 200x30',
      ].join('\n');
      const doc = layout(source);
      assert.equal(doc.pages[0].controls[0].children[0].y, 0);
      assert.equal(doc.pages[0].controls[0].children[1].y, 40);
    });
  });

  describe('deep nesting', () => {
    it('handles nested layout containers', () => {
      const source = [
        'panel "outer" 0,0 300x200',
        '  layout: column',
        '  padding: 10',
        '  gap: 10',
        '',
        '  row 280x40',
        '    gap: 8',
        '    padding: 0',
        '',
        '    button "A" 80x34',
        '    button "B" 80x34',
        '',
        '  button "C" 280x30',
      ].join('\n');
      const doc = layout(source);
      const outer = doc.pages[0].controls[0];
      const row = outer.children[0];
      const btnC = outer.children[1];

      // Row starts at padding (10) + contentOffset (28 for labeled panel) = 38
      assert.equal(row.y, 38);
      assert.equal(row.x, 10);

      // Buttons inside row
      assert.equal(row.children[0].x, 0);
      assert.equal(row.children[1].x, 88); // 80 + 8

      // Button C below row
      assert.equal(btnC.y, 88); // 38 + 40 + 10
    });
  });

  describe('immutability', () => {
    it('does not mutate the input resolved document', () => {
      const diagnostics = [];
      const source = 'panel "P" 0,0 200x200\n  layout: column\n  button "A" 100x30';
      const tokens = tokenize(source, diagnostics);
      const ast = parse(tokens, diagnostics);
      const resolved = resolve(ast, diagnostics);

      // Save original child position
      const origX = resolved.pages[0].controls[0].children[0].x;
      const origY = resolved.pages[0].controls[0].children[0].y;

      computeLayout(resolved);

      // Input should be unchanged
      assert.equal(resolved.pages[0].controls[0].children[0].x, origX);
      assert.equal(resolved.pages[0].controls[0].children[0].y, origY);
    });
  });

  describe('edge cases', () => {
    it('handles container with no children', () => {
      const doc = layout('panel "P" 0,0 200x200\n  layout: column');
      assert.equal(doc.pages[0].controls[0].children.length, 0);
    });

    it('handles container where contentTop exceeds height', () => {
      // Small panel with label (contentOffset 28) but only 30px tall
      const source = [
        'panel "Tiny" 0,0 100x30',
        '  layout: column',
        '  padding: 0',
        '',
        '  button "A" 100x20',
      ].join('\n');
      const doc = layout(source);
      // Should not crash — contentTop gets clamped
      assert.ok(doc.pages[0].controls[0].children[0].y >= 0);
    });
  });
});

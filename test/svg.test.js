import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { el, group, rect, text, circle, line, polyline, polygon, path, svg, textNode } from '../src/svg.js';

describe('svg builder', () => {
  describe('el()', () => {
    it('creates a node with tag, attrs, children', () => {
      const node = el('g', { id: 'test' }, el('rect', { x: 0 }));
      assert.equal(node.tag, 'g');
      assert.deepEqual(node.attrs, { id: 'test' });
      assert.equal(node.children.length, 1);
      assert.equal(node.children[0].tag, 'rect');
    });

    it('converts numeric attrs to strings', () => {
      const node = el('rect', { x: 10, y: 20.5, width: 100 });
      assert.equal(node.attrs.x, '10');
      assert.equal(node.attrs.y, '20.5');
      assert.equal(node.attrs.width, '100');
    });

    it('omits null/undefined attrs', () => {
      const node = el('rect', { x: 0, fill: null, stroke: undefined });
      assert.deepEqual(node.attrs, { x: '0' });
    });

    it('drops null children', () => {
      const node = el('g', {}, null, el('rect', {}), undefined, el('circle', {}));
      assert.equal(node.children.length, 2);
      assert.equal(node.children[0].tag, 'rect');
      assert.equal(node.children[1].tag, 'circle');
    });

    it('flattens array children', () => {
      const items = [el('rect', {}), el('circle', {})];
      const node = el('g', {}, items);
      assert.equal(node.children.length, 2);
    });

    it('drops nulls inside flattened arrays', () => {
      const items = [el('rect', {}), null, el('circle', {})];
      const node = el('g', {}, items);
      assert.equal(node.children.length, 2);
    });

    it('handles empty attrs', () => {
      const node = el('g', {});
      assert.deepEqual(node.attrs, {});
    });

    it('handles null attrs', () => {
      const node = el('g', null);
      assert.deepEqual(node.attrs, {});
    });

    it('accepts string children', () => {
      const node = el('text', {}, 'hello');
      assert.equal(node.children.length, 1);
      assert.equal(node.children[0], 'hello');
    });
  });

  describe('convenience constructors', () => {
    it('rect() sets x, y, width, height', () => {
      const node = rect(10, 20, 100, 50, { fill: 'red' });
      assert.equal(node.tag, 'rect');
      assert.equal(node.attrs.x, '10');
      assert.equal(node.attrs.y, '20');
      assert.equal(node.attrs.width, '100');
      assert.equal(node.attrs.height, '50');
      assert.equal(node.attrs.fill, 'red');
    });

    it('text() creates text element with content', () => {
      const node = text('Hello', 5, 10, { fill: 'blue' });
      assert.equal(node.tag, 'text');
      assert.equal(node.attrs.x, '5');
      assert.equal(node.attrs.y, '10');
      assert.equal(node.attrs.fill, 'blue');
      assert.equal(node.children[0], 'Hello');
    });

    it('circle() sets cx, cy, r', () => {
      const node = circle(50, 50, 25, { fill: 'green' });
      assert.equal(node.tag, 'circle');
      assert.equal(node.attrs.cx, '50');
      assert.equal(node.attrs.r, '25');
    });

    it('line() sets x1, y1, x2, y2', () => {
      const node = line(0, 0, 100, 100);
      assert.equal(node.tag, 'line');
      assert.equal(node.attrs.x2, '100');
    });

    it('polyline() sets points', () => {
      const node = polyline('0,0 10,10 20,0', { fill: 'none' });
      assert.equal(node.tag, 'polyline');
      assert.equal(node.attrs.points, '0,0 10,10 20,0');
    });

    it('polygon() sets points', () => {
      const node = polygon('0,0 10,10 20,0');
      assert.equal(node.tag, 'polygon');
    });

    it('path() sets d attribute', () => {
      const node = path('M0 0 L10 10');
      assert.equal(node.tag, 'path');
      assert.equal(node.attrs.d, 'M0 0 L10 10');
    });

    it('group() creates g element', () => {
      const node = group({ transform: 'translate(10,20)' }, rect(0, 0, 5, 5));
      assert.equal(node.tag, 'g');
      assert.equal(node.children[0].tag, 'rect');
    });

    it('svg() creates root SVG element with viewBox', () => {
      const node = svg(800, 600);
      assert.equal(node.tag, 'svg');
      assert.equal(node.attrs.xmlns, 'http://www.w3.org/2000/svg');
      assert.equal(node.attrs.width, '800');
      assert.equal(node.attrs.height, '600');
      assert.equal(node.attrs.viewBox, '0 0 800 600');
    });
  });

  describe('textNode()', () => {
    it('converts to string', () => {
      assert.equal(textNode(42), '42');
      assert.equal(textNode('hello'), 'hello');
    });
  });
});

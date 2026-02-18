import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { serialize } from '../src/serializer.js';
import { el, rect, text, circle, line, group, svg } from '../src/svg.js';

describe('serializer', () => {
  describe('basic elements', () => {
    it('serializes a self-closing element', () => {
      assert.equal(serialize(rect(0, 0, 100, 50)), '<rect x="0" y="0" width="100" height="50"/>');
    });

    it('serializes a circle', () => {
      assert.equal(serialize(circle(50, 50, 25)), '<circle cx="50" cy="50" r="25"/>');
    });

    it('serializes a line', () => {
      assert.equal(serialize(line(0, 0, 100, 100)), '<line x1="0" y1="0" x2="100" y2="100"/>');
    });

    it('serializes a text element with content', () => {
      assert.equal(serialize(text('Hello', 10, 20)), '<text x="10" y="20">Hello</text>');
    });

    it('serializes a group with children', () => {
      const g = group({}, rect(0, 0, 10, 10));
      assert.equal(serialize(g), '<g><rect x="0" y="0" width="10" height="10"/></g>');
    });
  });

  describe('escaping', () => {
    it('escapes text content', () => {
      const node = text('a < b & c > d', 0, 0);
      assert.equal(serialize(node), '<text x="0" y="0">a &lt; b &amp; c &gt; d</text>');
    });

    it('escapes attribute values', () => {
      const node = el('text', { 'font-family': '"Segoe UI"' }, 'x');
      assert.equal(serialize(node), '<text font-family="&quot;Segoe UI&quot;">x</text>');
    });

    it('escapes ampersands in attributes', () => {
      const node = el('rect', { fill: 'a&b' });
      assert.equal(serialize(node), '<rect fill="a&amp;b"/>');
    });
  });

  describe('nesting', () => {
    it('handles deeply nested structures', () => {
      const node = group({}, group({}, group({}, rect(0, 0, 1, 1))));
      assert.equal(serialize(node), '<g><g><g><rect x="0" y="0" width="1" height="1"/></g></g></g>');
    });

    it('handles multiple children', () => {
      const node = group({},
        rect(0, 0, 10, 10),
        rect(20, 0, 10, 10),
      );
      assert.equal(serialize(node),
        '<g><rect x="0" y="0" width="10" height="10"/><rect x="20" y="0" width="10" height="10"/></g>');
    });

    it('handles mixed text and element children', () => {
      const node = el('text', {}, 'before', el('tspan', {}, 'inner'), 'after');
      assert.equal(serialize(node), '<text>before<tspan>inner</tspan>after</text>');
    });
  });

  describe('non-self-closing elements', () => {
    it('g with no children uses open/close tags', () => {
      assert.equal(serialize(group({})), '<g></g>');
    });

    it('text with no children uses open/close tags', () => {
      assert.equal(serialize(el('text', {})), '<text></text>');
    });

    it('svg root element uses open/close tags', () => {
      const node = svg(100, 100);
      const result = serialize(node);
      assert.ok(result.startsWith('<svg'));
      assert.ok(result.endsWith('</svg>'));
    });
  });

  describe('string nodes', () => {
    it('serializes plain string', () => {
      assert.equal(serialize('hello'), 'hello');
    });

    it('escapes special chars in strings', () => {
      assert.equal(serialize('<script>'), '&lt;script&gt;');
    });
  });
});

/**
 * Vin virtual SVG DOM builder.
 *
 * Instead of concatenating SVG strings, the renderer builds a tree of SvgNode
 * objects. The serializer turns the tree into a string in a separate stage.
 *
 * Benefits:
 *  - Renderer is testable without string parsing
 *  - Enables future DOM rendering (swap serializer for DOM builder)
 *  - Conditional children: null/undefined children are silently dropped
 *  - Numeric attributes auto-convert to strings
 */

/**
 * @typedef {Object} SvgNode
 * @property {string} tag
 * @property {Object<string, string>} attrs
 * @property {Array<SvgNode | string>} children
 */

/**
 * Create an SVG element node.
 * Attributes with null/undefined values are omitted.
 * Numeric attribute values are converted to strings.
 * Null/undefined children are silently dropped.
 *
 * @param {string} tag
 * @param {Object<string, string|number|null>} attrs
 * @param {...(SvgNode|string|null|undefined)} children
 * @returns {SvgNode}
 */
export function el(tag, attrs, ...children) {
  const cleanAttrs = {};
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v != null) {
        cleanAttrs[k] = String(v);
      }
    }
  }

  const cleanChildren = [];
  for (const child of children) {
    if (child != null) {
      if (Array.isArray(child)) {
        for (const c of child) {
          if (c != null) cleanChildren.push(c);
        }
      } else {
        cleanChildren.push(child);
      }
    }
  }

  return { tag, attrs: cleanAttrs, children: cleanChildren };
}

/**
 * Create a text content node (raw string, will be escaped by serializer).
 * @param {string} text
 * @returns {string}
 */
export function textNode(text) {
  return String(text);
}

// ── Convenience constructors ──

export function group(attrs, ...children) {
  return el('g', attrs, ...children);
}

export function rect(x, y, width, height, attrs = {}) {
  return el('rect', { x, y, width, height, ...attrs });
}

export function text(content, x, y, attrs = {}) {
  return el('text', { x, y, ...attrs }, textNode(content));
}

export function circle(cx, cy, r, attrs = {}) {
  return el('circle', { cx, cy, r, ...attrs });
}

export function line(x1, y1, x2, y2, attrs = {}) {
  return el('line', { x1, y1, x2, y2, ...attrs });
}

export function polyline(points, attrs = {}) {
  return el('polyline', { points, ...attrs });
}

export function polygon(points, attrs = {}) {
  return el('polygon', { points, ...attrs });
}

export function path(d, attrs = {}) {
  return el('path', { d, ...attrs });
}

export function svg(width, height, attrs = {}, ...children) {
  return el('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width, height,
    viewBox: `0 0 ${width} ${height}`,
    ...attrs,
  }, ...children);
}

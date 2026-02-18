/**
 * Vin SVG serializer.
 *
 * Converts an SvgNode tree into an SVG markup string.
 * This is a pure function with zero external dependencies.
 */

/**
 * Escape text content for safe embedding in XML.
 */
function escapeText(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Escape an attribute value for safe embedding in double-quoted XML attributes.
 */
function escapeAttr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Self-closing SVG tags (no children expected) */
const SELF_CLOSING = new Set([
  'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'rect', 'use', 'image',
]);

/**
 * Serialize an SvgNode tree to an SVG string.
 *
 * @param {import('./svg.js').SvgNode} node
 * @returns {string}
 */
export function serialize(node) {
  if (typeof node === 'string') {
    return escapeText(node);
  }

  const { tag, attrs, children } = node;

  // Build attribute string
  let attrStr = '';
  for (const [key, value] of Object.entries(attrs)) {
    attrStr += ` ${key}="${escapeAttr(value)}"`;
  }

  // Self-closing element with no children
  if (children.length === 0 && SELF_CLOSING.has(tag)) {
    return `<${tag}${attrStr}/>`;
  }

  // Element with children
  let inner = '';
  for (const child of children) {
    inner += serialize(child);
  }

  return `<${tag}${attrStr}>${inner}</${tag}>`;
}

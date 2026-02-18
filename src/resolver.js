/**
 * Vin resolver — Stage 4.
 *
 * Transforms an AstDocument into a ResolvedDocument by:
 *   - Filling in default sizes from the control registry
 *   - Merging property defaults from the control schema
 *   - Preserving null positions (layout engine handles those)
 *
 * Pure function: does not mutate the input AST.
 */

import { warning } from './diagnostics.js';
import { getControl } from './registry.js';

/**
 * @typedef {Object} ResolvedNode
 * @property {string} type
 * @property {string} label
 * @property {string|null} id        - unique identifier (null when not specified)
 * @property {number|null} x        - null if unspecified (layout will resolve)
 * @property {number|null} y
 * @property {number} width          - guaranteed (default applied)
 * @property {number} height         - guaranteed (default applied)
 * @property {boolean} hasPosition
 * @property {Object} properties     - merged with schema defaults
 * @property {Object<string, import('./diagnostics.js').Span>} propertySpans - maps property key to its source span
 * @property {ResolvedNode[]} children
 * @property {Object} span
 */

/**
 * @typedef {Object} ResolvedPage
 * @property {string} title
 * @property {string|null} id        - unique identifier (null when not specified)
 * @property {number} width
 * @property {number} height
 * @property {Object} properties
 * @property {Object<string, import('./diagnostics.js').Span>} propertySpans - maps property key to its source span
 * @property {ResolvedNode[]} controls
 * @property {Object} span
 */

/**
 * @typedef {Object} ResolvedDocument
 * @property {ResolvedPage[]} pages
 */

/**
 * Resolve an AstDocument into a ResolvedDocument.
 *
 * @param {import('./parser.js').AstDocument} ast
 * @param {import('./diagnostics.js').Diagnostic[]} diagnostics
 * @returns {ResolvedDocument}
 */
export function resolve(ast, diagnostics) {
  return {
    pages: ast.pages.map(page => ({
      ...page,
      propertySpans: { ...page.propertySpans },
      controls: page.controls.map(node => resolveNode(node, diagnostics)),
    })),
  };
}

/**
 * Resolve a single AST node (and its children recursively).
 * Returns a new ResolvedNode — does not mutate the input.
 */
function resolveNode(node, diagnostics) {
  const def = getControl(node.type);

  // For unknown controls: preserve as-is with fallback defaults
  if (!def) {
    return {
      type: node.type,
      label: node.label,
      id: node.id,
      x: node.x,
      y: node.y,
      width: node.width ?? 100,
      height: node.height ?? 30,
      hasPosition: node.hasPosition,
      properties: { ...node.properties },
      propertySpans: { ...node.propertySpans },
      children: node.children.map(c => resolveNode(c, diagnostics)),
      span: node.span,
    };
  }

  // Apply default size
  const width = node.width ?? def.defaultSize[0];
  const height = node.height ?? def.defaultSize[1];

  // Merge property defaults from schema
  const properties = {};

  // Start with schema defaults
  for (const [key, schema] of Object.entries(def.properties)) {
    if (schema.default != null) {
      properties[key] = schema.default;
    }
  }

  // Override with user-specified properties
  for (const [key, value] of Object.entries(node.properties)) {
    properties[key] = value;
  }

  // Copy user-specified property spans (defaults don't have spans)
  const propertySpans = { ...node.propertySpans };

  return {
    type: node.type,
    label: node.label,
    id: node.id,
    x: node.x,
    y: node.y,
    width,
    height,
    hasPosition: node.hasPosition,
    properties,
    propertySpans,
    children: node.children.map(c => resolveNode(c, diagnostics)),
    span: node.span,
  };
}

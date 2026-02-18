/**
 * Vin validator — Stage 3.
 *
 * Walks the AstDocument and checks each control against the registry.
 * Produces non-blocking diagnostics (warnings) for:
 *   - Unknown control types (with "did you mean?" suggestions)
 *   - Unknown property names
 *   - Invalid property values (wrong type, out of enum range)
 *
 * Does NOT modify the AST — pure read-only analysis.
 */

import { warning } from './diagnostics.js';
import { hasControl, getControl, getControlTypes } from './registry.js';

/**
 * Validate an AstDocument against the control registry.
 *
 * @param {import('./parser.js').AstDocument} ast
 * @param {import('./diagnostics.js').Diagnostic[]} diagnostics
 */
export function validate(ast, diagnostics) {
  validateIds(ast, diagnostics);

  for (const page of ast.pages) {
    validatePageProperties(page, diagnostics);
    for (const node of page.controls) {
      validateNode(node, diagnostics);
    }
  }
}

/**
 * Validate a single AST node and its children recursively.
 */
function validateNode(node, diagnostics) {
  if (!node.type) return; // Skip nodes with no type (unparseable lines)

  if (!hasControl(node.type)) {
    const suggestion = findClosest(node.type, getControlTypes());
    const hint = suggestion ? ` (did you mean "${suggestion}"?)` : '';
    diagnostics.push(
      warning(`Unknown control "${node.type}"${hint}`, node.span, 'validator')
    );
    return; // Skip property validation for unknown controls
  }

  const def = getControl(node.type);

  // Validate properties
  for (const [key, value] of Object.entries(node.properties)) {
    // Skip layout properties — these are handled by the layout engine
    if (isLayoutProperty(key)) continue;
    // Skip universal properties — these are handled elsewhere
    if (isUniversalProperty(key)) continue;

    const propSpan = (node.propertySpans && node.propertySpans[key]) || node.span;
    const schema = def.properties[key];
    if (!schema) {
      // Check if it's a valid layout property on a non-layout control
      if (!isLayoutProperty(key)) {
        diagnostics.push(
          warning(`Unknown property "${key}" on "${node.type}"`, propSpan, 'validator')
        );
      }
      continue;
    }

    validatePropertyValue(node.type, key, value, schema, propSpan, diagnostics);
  }

  // Recursively validate children
  for (const child of node.children) {
    validateNode(child, diagnostics);
  }
}

/**
 * Validate properties on a page declaration.
 */
function validatePageProperties(page, diagnostics) {
  for (const [key, value] of Object.entries(page.properties)) {
    if (isUniversalProperty(key)) continue;

    const propSpan = (page.propertySpans && page.propertySpans[key]) || page.span;
    const schema = PAGE_PROPERTIES[key];
    if (!schema) {
      const suggestion = findClosest(key, Object.keys(PAGE_PROPERTIES));
      const hint = suggestion ? ` (did you mean "${suggestion}"?)` : '';
      diagnostics.push(
        warning(`Unknown property "${key}" on page "${page.title}"${hint}`, propSpan, 'validator')
      );
      continue;
    }

    validatePropertyValue('page', key, value, schema, propSpan, diagnostics);
  }
}

/** Layout properties recognized by the layout engine, valid on any container */
const LAYOUT_PROPS = new Set([
  'layout', 'padding', 'gap', 'align', 'justify', 'flex', 'align-self',
]);

/** Universal properties valid on any control (not control-specific) */
const UNIVERSAL_PROPS = new Set(['id']);

/** Schema for valid page-level properties */
const PAGE_PROPERTIES = {
  background: { type: 'string' },
};

function isLayoutProperty(key) {
  return LAYOUT_PROPS.has(key);
}

function isUniversalProperty(key) {
  return UNIVERSAL_PROPS.has(key);
}

/**
 * Validate that all IDs in the document are unique.
 * Collects IDs from pages and all controls (recursively).
 */
function validateIds(ast, diagnostics) {
  /** @type {Map<string, Object>} id → first span */
  const seen = new Map();

  for (const page of ast.pages) {
    if (page.id != null) {
      if (seen.has(page.id)) {
        const first = seen.get(page.id);
        const firstLine = first ? ` (first defined at line ${first.start.line})` : '';
        diagnostics.push(
          warning(`Duplicate id "${page.id}"${firstLine}`, page.span, 'validator')
        );
      } else {
        seen.set(page.id, page.span);
      }
    }
    for (const node of page.controls) {
      collectIds(node, seen, diagnostics);
    }
  }
}

/**
 * Recursively collect IDs from a node and its children, checking for duplicates.
 */
function collectIds(node, seen, diagnostics) {
  if (node.id != null) {
    if (seen.has(node.id)) {
      const first = seen.get(node.id);
      const firstLine = first ? ` (first defined at line ${first.start.line})` : '';
      diagnostics.push(
        warning(`Duplicate id "${node.id}"${firstLine}`, node.span, 'validator')
      );
    } else {
      seen.set(node.id, node.span);
    }
  }
  for (const child of node.children) {
    collectIds(child, seen, diagnostics);
  }
}

/**
 * Validate a single property value against its schema.
 */
function validatePropertyValue(controlType, key, value, schema, span, diagnostics) {
  switch (schema.type) {
    case 'boolean':
      if (typeof value !== 'boolean') {
        diagnostics.push(
          warning(`Property "${key}" on "${controlType}" should be a boolean, got "${value}"`, span, 'validator')
        );
      }
      break;
    case 'number':
      if (typeof value !== 'number') {
        diagnostics.push(
          warning(`Property "${key}" on "${controlType}" should be a number, got "${value}"`, span, 'validator')
        );
      }
      break;
    case 'enum':
      if (schema.values && !schema.values.includes(value)) {
        diagnostics.push(
          warning(
            `Property "${key}" on "${controlType}" should be one of [${schema.values.join(', ')}], got "${value}"`,
            span, 'validator'
          )
        );
      }
      break;
    case 'list':
      if (!Array.isArray(value)) {
        diagnostics.push(
          warning(`Property "${key}" on "${controlType}" should be a list, got "${value}"`, span, 'validator')
        );
      }
      break;
    // 'string' — no validation needed, anything coerces
  }
}

/**
 * Find the closest match to `target` from `candidates` using Levenshtein distance.
 * Returns null if no candidate is within threshold (max distance = 3).
 */
function findClosest(target, candidates) {
  const MAX_DIST = 3;
  let best = null;
  let bestDist = MAX_DIST + 1;

  for (const candidate of candidates) {
    const dist = levenshtein(target, candidate);
    if (dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }

  return bestDist <= MAX_DIST ? best : null;
}

/**
 * Levenshtein distance between two strings.
 */
function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

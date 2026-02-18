/**
 * Vin parser — Stage 2.
 *
 * Builds an AstDocument from a token array using indentation-based nesting.
 * The parser is a pure function: it does not mutate its input and produces
 * a clean AST with null values for unspecified positions/sizes.
 *
 * Supports multiple page declarations — each page owns the controls that
 * follow it until the next page declaration.
 */

import { warning } from './diagnostics.js';

/**
 * @typedef {Object} AstNode
 * @property {string} type
 * @property {string} label
 * @property {string|null} id     - unique identifier (null when not specified)
 * @property {number|null} x      - null when not specified (not 0)
 * @property {number|null} y
 * @property {number|null} width   - null when not specified
 * @property {number|null} height
 * @property {boolean} hasPosition
 * @property {Object} properties
 * @property {Object<string, import('./diagnostics.js').Span>} propertySpans - maps property key to its source span
 * @property {AstNode[]} children
 * @property {Object} span
 */

/**
 * @typedef {Object} AstPage
 * @property {string} title
 * @property {string|null} id     - unique identifier (null when not specified)
 * @property {number} width
 * @property {number} height
 * @property {Object} properties
 * @property {Object<string, import('./diagnostics.js').Span>} propertySpans - maps property key to its source span
 * @property {AstNode[]} controls
 * @property {Object} span
 */

/**
 * @typedef {Object} AstDocument
 * @property {number} version    - Format version (from vin-format header, default 1)
 * @property {AstPage[]} pages
 */

/**
 * Parse a token array into an AstDocument.
 *
 * @param {import('./tokenizer.js').Token[]} tokens
 * @param {import('./diagnostics.js').Diagnostic[]} diagnostics
 * @returns {AstDocument}
 */
export function parse(tokens, diagnostics) {
  const result = { pages: [], version: 1 };

  // Stack for indentation-based nesting: [{indent, node}]
  const stack = [];
  let seenContent = false;
  let currentPage = null;

  for (const token of tokens) {
    // Skip blanks and comments — do NOT pop the stack
    if (token.type === 'BLANK' || token.type === 'COMMENT') {
      continue;
    }

    // Version header: vin-format property at indent 0 before any content
    if (!seenContent && token.type === 'PROPERTY' && token.key === 'vin-format' && token.indent === 0) {
      const version = token.value;
      if (typeof version === 'number' && Number.isInteger(version) && version >= 1) {
        result.version = version;
        if (version > 1) {
          diagnostics.push(
            warning(`Unrecognized vin-format version ${version}; this tool supports version 1`, token.span, 'parser')
          );
        }
      } else {
        diagnostics.push(
          warning(`Invalid vin-format version "${version}"; expected a positive integer`, token.span, 'parser')
        );
      }
      continue;
    }

    seenContent = true;
    const indent = token.indent;

    // Pop stack to find the parent at a lower indent level
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }

    if (token.type === 'PROPERTY') {
      // Attach property to nearest control on stack
      if (stack.length > 0) {
        const parent = stack[stack.length - 1].node;
        // Promote id property to first-class field
        if (token.key === 'id') {
          const idVal = token.value;
          if (typeof idVal !== 'string' || !/^[\w][\w-]*$/.test(idVal)) {
            diagnostics.push(
              warning(`Invalid property-form id: must be a string matching [\\w][\\w-]* (got ${JSON.stringify(idVal)})`, token.span, 'parser')
            );
          } else {
            parent.id = parent.id || idVal;
          }
        } else {
          parent.properties[token.key] = token.value;
          parent.propertySpans[token.key] = token.span;
        }
      } else {
        diagnostics.push(
          warning(`Orphan property "${token.key}" has no parent control`, token.span, 'parser')
        );
      }
      continue;
    }

    if (token.type === 'CONTROL') {
      // Handle page declaration
      if (token.controlType === 'page') {
        // Warn if page is nested inside another control
        if (indent > 0) {
          diagnostics.push(
            warning(`Page declaration should be at the top level (indent 0)`, token.span, 'parser')
          );
        }

        // Push the current page (if any) and start a new one
        if (currentPage) {
          result.pages.push(currentPage);
        }

        currentPage = {
          title: token.label || 'Untitled',
          id: token.id || null,
          width: token.sizeW || 800,
          height: token.sizeH || 600,
          properties: {},
          propertySpans: {},
          controls: [],
          span: token.span,
        };
        // Reset stack so page-level properties can attach
        stack.length = 0;
        stack.push({ indent, node: currentPage });
        continue;
      }

      // Ensure a current page exists (implicit default page for controls before any page declaration)
      if (!currentPage) {
        currentPage = {
          title: 'Untitled',
          id: null,
          width: 800,
          height: 600,
          properties: {},
          propertySpans: {},
          controls: [],
          span: null,
        };
      }

      // Build AstNode
      const node = {
        type: token.controlType,
        label: token.label,
        id: token.id || null,
        x: token.hasPosition ? token.posX : null,
        y: token.hasPosition ? token.posY : null,
        width: token.sizeW,
        height: token.sizeH,
        hasPosition: token.hasPosition,
        properties: {},
        propertySpans: {},
        children: [],
        span: token.span,
      };

      if (stack.length > 0 && stack[stack.length - 1].node.children) {
        // Nested child — add to parent's children
        stack[stack.length - 1].node.children.push(node);
      } else {
        // Top-level control — add to current page
        currentPage.controls.push(node);
      }

      stack.push({ indent, node });
    }
  }

  // Push the final page
  if (currentPage) {
    result.pages.push(currentPage);
  }

  // Default page if none specified (empty source or comments-only)
  if (result.pages.length === 0) {
    result.pages.push({
      title: 'Untitled',
      id: null,
      width: 800,
      height: 600,
      properties: {},
      propertySpans: {},
      controls: [],
      span: null,
    });
  }

  return result;
}

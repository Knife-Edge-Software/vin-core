/**
 * Vin tokenizer — Stage 1.
 *
 * Classifies each source line into a token type and extracts structured
 * fields. All regex parsing is confined to this module.
 *
 * Token types:
 *   BLANK    — empty line (no content after trimming)
 *   COMMENT  — comment line (starts with #)
 *   PROPERTY — key: value property line
 *   CONTROL  — control declaration line
 */

import { warning } from './diagnostics.js';

/** @typedef {'BLANK' | 'COMMENT' | 'PROPERTY' | 'CONTROL'} TokenType */

/**
 * @typedef {Object} Token
 * @property {TokenType} type
 * @property {number} indent     - Measured indentation (spaces; tab = 2)
 * @property {string} raw        - Original line text
 * @property {Object} span       - Source location
 * @property {number} span.start.line
 * @property {number} span.start.column
 * @property {number} span.end.line
 * @property {number} span.end.column
 *
 * CONTROL tokens additionally have:
 * @property {string} [controlType]
 * @property {string} [label]
 * @property {number|null} [posX]
 * @property {number|null} [posY]
 * @property {number|null} [sizeW]
 * @property {number|null} [sizeH]
 * @property {boolean} [hasPosition]
 * @property {string|null} [id]
 *
 * PROPERTY tokens additionally have:
 * @property {string} [key]
 * @property {*} [value]
 */

// ── Regex patterns ──

const RE_PROPERTY = /^([\w][\w-]*)\s*:\s*(.+)$/;
const RE_CONTROL_TYPE = /^([\w][\w-]*)/;
const RE_LABEL = /^"((?:[^"\\]|\\.)*)"/;
const RE_POSITION = /^(\d+)\s*,\s*(\d+)/;
const RE_SIZE = /^(\d+)\s*x\s*(\d+)/;
const RE_ID = /^id:\s*([\w][\w-]*)/;

/**
 * Tokenize a .vin source string into an array of tokens.
 *
 * @param {string} source
 * @param {import('./diagnostics.js').Diagnostic[]} diagnostics - Mutable array to push warnings into
 * @returns {Token[]}
 */
export function tokenize(source, diagnostics) {
  const lines = source.split('\n');
  const tokens = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();
    const lineNum = i + 1; // 1-based
    const indent = measureIndent(raw);

    const span = {
      start: { line: lineNum, column: 1 },
      end: { line: lineNum, column: raw.length + 1 },
    };

    // Blank line
    if (!trimmed) {
      tokens.push({ type: 'BLANK', indent, raw, span });
      continue;
    }

    // Comment
    if (trimmed.startsWith('#')) {
      tokens.push({ type: 'COMMENT', indent, raw, span });
      continue;
    }

    // Property line (key: value)
    if (isPropertyLine(trimmed)) {
      const prop = parsePropertyValue(trimmed);
      tokens.push({
        type: 'PROPERTY',
        indent,
        raw,
        span,
        key: prop.key,
        value: prop.value,
      });
      continue;
    }

    // Control line
    const ctrl = parseControlParts(trimmed, span, diagnostics);
    tokens.push({
      type: 'CONTROL',
      indent,
      raw,
      span,
      controlType: ctrl.controlType,
      label: ctrl.label,
      posX: ctrl.posX,
      posY: ctrl.posY,
      sizeW: ctrl.sizeW,
      sizeH: ctrl.sizeH,
      hasPosition: ctrl.hasPosition,
      id: ctrl.id,
    });
  }

  return tokens;
}

// ── Internal helpers ──

/**
 * Measure leading whitespace. Tab counts as 2 spaces.
 */
function measureIndent(line) {
  let count = 0;
  for (const ch of line) {
    if (ch === ' ') count++;
    else if (ch === '\t') count += 2;
    else break;
  }
  return count;
}

/**
 * Test whether a trimmed line is a property (key: value) vs a control.
 */
function isPropertyLine(trimmed) {
  return RE_PROPERTY.test(trimmed);
}

/**
 * Parse a control declaration line into its component parts.
 */
function parseControlParts(line, span, diagnostics) {
  const result = {
    controlType: null,
    label: '',
    posX: null,
    posY: null,
    sizeW: null,
    sizeH: null,
    hasPosition: false,
    id: null,
  };

  // Type
  const typeMatch = line.match(RE_CONTROL_TYPE);
  if (!typeMatch) {
    diagnostics.push(warning(`Unparseable line: "${line}"`, span, 'tokenizer'));
    return result;
  }
  result.controlType = typeMatch[1];
  let rest = line.slice(typeMatch[0].length).trim();

  // Label
  const labelMatch = rest.match(RE_LABEL);
  if (labelMatch) {
    result.label = unescapeString(labelMatch[1]);
    rest = rest.slice(labelMatch[0].length).trim();
  }

  // Position (x,y — must have comma)
  const posMatch = rest.match(RE_POSITION);
  if (posMatch) {
    result.posX = parseInt(posMatch[1]);
    result.posY = parseInt(posMatch[2]);
    result.hasPosition = true;
    rest = rest.slice(posMatch[0].length).trim();
  }

  // Size (widthxheight)
  const sizeMatch = rest.match(RE_SIZE);
  if (sizeMatch) {
    result.sizeW = parseInt(sizeMatch[1]);
    result.sizeH = parseInt(sizeMatch[2]);
    rest = rest.slice(sizeMatch[0].length).trim();
  }

  // Inline id (id: value)
  const idMatch = rest.match(RE_ID);
  if (idMatch) {
    result.id = idMatch[1];
  }

  return result;
}

/**
 * Parse a property line value with type coercion.
 */
function parsePropertyValue(trimmed) {
  const match = trimmed.match(RE_PROPERTY);
  const key = match[1];
  let value = match[2].trim();

  // Boolean
  if (value === 'true') return { key, value: true };
  if (value === 'false') return { key, value: false };

  // Integer
  if (/^[+-]?\d+$/.test(value)) return { key, value: parseInt(value) };

  // Float
  if (/^[+-]?\d+\.\d+$/.test(value)) return { key, value: parseFloat(value) };

  // Pipe-delimited list (split on unescaped pipes)
  if (value.includes('|')) {
    return {
      key,
      value: splitOnUnescapedPipe(value).map(s => {
        s = s.trim();
        const strMatch = s.match(/^"((?:[^"\\]|\\.)*)"$/);
        return strMatch ? unescapeString(strMatch[1]) : unescapeString(s);
      }),
    };
  }

  // Quoted string
  const strMatch = value.match(/^"((?:[^"\\]|\\.)*)"$/);
  if (strMatch) return { key, value: unescapeString(strMatch[1]) };

  // Unquoted string
  return { key, value };
}

/**
 * Process backslash escape sequences in a string.
 * Supports: \" \\ \| and passes through unknown escapes by stripping the backslash.
 */
function unescapeString(s) {
  return s.replace(/\\(.)/g, (_match, ch) => ch);
}

/**
 * Split a string on unescaped pipe characters.
 * A pipe preceded by a backslash is treated as a literal pipe, not a delimiter.
 */
function splitOnUnescapedPipe(s) {
  const parts = [];
  let current = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && i + 1 < s.length) {
      current += s[i] + s[i + 1];
      i++;
    } else if (s[i] === '|') {
      parts.push(current);
      current = '';
    } else {
      current += s[i];
    }
  }
  parts.push(current);
  return parts;
}

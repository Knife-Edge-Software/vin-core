/**
 * Vin diagnostic types and formatting.
 *
 * Every pipeline stage can produce diagnostics. Diagnostics are non-blocking
 * (warnings/info) or blocking (errors) and carry source location spans.
 */

/** @typedef {'error' | 'warning' | 'info'} Severity */
/** @typedef {'tokenizer' | 'parser' | 'validator' | 'resolver'} DiagnosticSource */

/**
 * @typedef {Object} Span
 * @property {{line: number, column: number}} start - 1-based line and column
 * @property {{line: number, column: number}} end
 */

/**
 * @typedef {Object} Diagnostic
 * @property {Severity} severity
 * @property {string} message
 * @property {Span | null} span
 * @property {DiagnosticSource} source
 */

/**
 * Create a diagnostic object.
 */
export function diagnostic(severity, message, span, source) {
  return { severity, message, span: span ?? null, source };
}

/**
 * Convenience constructors.
 */
export function error(message, span, source) {
  return diagnostic('error', message, span, source);
}

export function warning(message, span, source) {
  return diagnostic('warning', message, span, source);
}

export function info(message, span, source) {
  return diagnostic('info', message, span, source);
}

/**
 * Format a diagnostic for display.
 *
 * Examples:
 *   "Error:42:5: Unknown control \"buttton\""
 *   "Warning: Missing page declaration"
 */
export function formatDiagnostic(d) {
  const label = d.severity.charAt(0).toUpperCase() + d.severity.slice(1);
  const loc = d.span ? `:${d.span.start.line}:${d.span.start.column}` : '';
  return `${label}${loc}: ${d.message}`;
}

/**
 * Return true if any diagnostic has error severity.
 */
export function hasErrors(diagnostics) {
  return diagnostics.some(d => d.severity === 'error');
}

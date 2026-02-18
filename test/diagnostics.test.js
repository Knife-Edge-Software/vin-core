import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { diagnostic, error, warning, info, formatDiagnostic, hasErrors } from '../src/diagnostics.js';

describe('diagnostics', () => {
  describe('constructors', () => {
    it('creates a diagnostic with all fields', () => {
      const span = { start: { line: 1, column: 1 }, end: { line: 1, column: 10 } };
      const d = diagnostic('error', 'bad', span, 'parser');
      assert.equal(d.severity, 'error');
      assert.equal(d.message, 'bad');
      assert.deepEqual(d.span, span);
      assert.equal(d.source, 'parser');
    });

    it('defaults span to null when omitted', () => {
      const d = diagnostic('warning', 'msg', undefined, 'tokenizer');
      assert.equal(d.span, null);
    });

    it('error() creates error severity', () => {
      const d = error('oops', null, 'parser');
      assert.equal(d.severity, 'error');
    });

    it('warning() creates warning severity', () => {
      const d = warning('hmm', null, 'validator');
      assert.equal(d.severity, 'warning');
    });

    it('info() creates info severity', () => {
      const d = info('fyi', null, 'resolver');
      assert.equal(d.severity, 'info');
    });
  });

  describe('formatDiagnostic', () => {
    it('formats with source location', () => {
      const span = { start: { line: 42, column: 5 }, end: { line: 42, column: 15 } };
      const d = error('Unknown control "buttton"', span, 'validator');
      assert.equal(formatDiagnostic(d), 'Error:42:5: Unknown control "buttton"');
    });

    it('formats without source location', () => {
      const d = warning('Missing page declaration', null, 'parser');
      assert.equal(formatDiagnostic(d), 'Warning: Missing page declaration');
    });

    it('formats info severity', () => {
      const d = info('Unused property', null, 'validator');
      assert.equal(formatDiagnostic(d), 'Info: Unused property');
    });
  });

  describe('hasErrors', () => {
    it('returns true when errors present', () => {
      assert.equal(hasErrors([
        warning('w', null, 'parser'),
        error('e', null, 'parser'),
      ]), true);
    });

    it('returns false when no errors', () => {
      assert.equal(hasErrors([
        warning('w', null, 'parser'),
        info('i', null, 'parser'),
      ]), false);
    });

    it('returns false for empty array', () => {
      assert.equal(hasErrors([]), false);
    });
  });
});

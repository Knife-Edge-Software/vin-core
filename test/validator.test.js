import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';

// Register controls before importing validator
import '../src/controls/index.js';
import { validate } from '../src/validator.js';
import { tokenize } from '../src/tokenizer.js';
import { parse } from '../src/parser.js';

function check(source) {
  const diagnostics = [];
  const tokens = tokenize(source, diagnostics);
  const ast = parse(tokens, diagnostics);
  validate(ast, diagnostics);
  return diagnostics.filter(d => d.source === 'validator');
}

describe('validator', () => {
  describe('unknown controls', () => {
    it('warns about unknown control types', () => {
      const diags = check('buttton "OK" 10,10');
      assert.equal(diags.length, 1);
      assert.ok(diags[0].message.includes('Unknown control "buttton"'));
    });

    it('suggests corrections for typos', () => {
      const diags = check('buton "OK" 10,10');
      assert.ok(diags[0].message.includes('did you mean "button"'));
    });

    it('no suggestion for very different names', () => {
      const diags = check('xyzfoobar "OK" 10,10');
      assert.ok(!diags[0].message.includes('did you mean'));
    });
  });

  describe('unknown properties', () => {
    it('warns about unknown properties', () => {
      const source = 'button "OK" 10,10\n  color: red';
      const diags = check(source);
      assert.equal(diags.length, 1);
      assert.ok(diags[0].message.includes('Unknown property "color"'));
    });

    it('does not warn about layout properties', () => {
      const source = 'panel "P" 0,0 200x200\n  layout: column\n  padding: 12\n  gap: 8\n  align: center\n  justify: end';
      const diags = check(source);
      assert.equal(diags.length, 0);
    });

    it('does not warn about flex and align-self', () => {
      const source = 'panel "P" 0,0 200x200\n  button "OK" 100x34\n    flex: 1\n    align-self: center';
      const diags = check(source);
      assert.equal(diags.length, 0);
    });
  });

  describe('property validation', () => {
    it('warns about invalid enum values', () => {
      const source = 'button "OK" 10,10\n  variant: huge';
      const diags = check(source);
      assert.equal(diags.length, 1);
      assert.ok(diags[0].message.includes('should be one of'));
    });

    it('accepts valid enum values', () => {
      const source = 'button "OK" 10,10\n  variant: primary';
      const diags = check(source);
      assert.equal(diags.length, 0);
    });

    it('warns about wrong boolean type', () => {
      const source = 'checkbox "OK" 10,10\n  checked: yes';
      const diags = check(source);
      assert.equal(diags.length, 1);
      assert.ok(diags[0].message.includes('should be a boolean'));
    });
  });

  describe('valid documents', () => {
    it('produces no warnings for valid controls', () => {
      const source = [
        'page "Test" 400x300',
        'button "OK" 10,10 80x34',
        '  variant: primary',
        'textfield "name" 10,50 200x32',
        '  placeholder: "Name"',
        'checkbox "agree" 10,100',
        '  checked: true',
      ].join('\n');
      const diags = check(source);
      assert.equal(diags.length, 0);
    });
  });

  describe('id validation', () => {
    it('produces no warnings for unique ids', () => {
      const source = [
        'page "A" 400x300 id: page-a',
        'button "OK" id: btn-ok',
        'button "Cancel" id: btn-cancel',
      ].join('\n');
      const diags = check(source);
      assert.equal(diags.length, 0);
    });

    it('warns about duplicate control ids', () => {
      const source = [
        'button "A" id: my-btn',
        'button "B" id: my-btn',
      ].join('\n');
      const diags = check(source);
      assert.equal(diags.length, 1);
      assert.ok(diags[0].message.includes('Duplicate id "my-btn"'));
    });

    it('warns about duplicate page and control id', () => {
      const source = [
        'page "Home" 400x300 id: home',
        'button "OK" id: home',
      ].join('\n');
      const diags = check(source);
      assert.equal(diags.length, 1);
      assert.ok(diags[0].message.includes('Duplicate id "home"'));
    });

    it('warns about duplicate page ids', () => {
      const source = [
        'page "A" 400x300 id: main',
        'page "B" 400x300 id: main',
      ].join('\n');
      const diags = check(source);
      assert.equal(diags.length, 1);
      assert.ok(diags[0].message.includes('Duplicate id "main"'));
    });

    it('includes first definition line in duplicate warning', () => {
      const source = [
        'button "A" id: dup',
        'button "B" id: dup',
      ].join('\n');
      const diags = check(source);
      assert.ok(diags[0].message.includes('line 1'));
    });

    it('detects duplicates in nested controls', () => {
      const source = [
        'panel "P" 0,0 200x200',
        '  button "A" id: nested',
        'button "B" id: nested',
      ].join('\n');
      const diags = check(source);
      assert.equal(diags.length, 1);
      assert.ok(diags[0].message.includes('Duplicate id "nested"'));
    });

    it('does not warn about id as unknown property', () => {
      const source = 'button "OK" id: my-btn';
      const diags = check(source);
      assert.equal(diags.length, 0);
    });

    it('detects duplicates across pages and controls via property-form ids', () => {
      const source = [
        'page "A" 400x300',
        '  id: shared',
        'button "OK" id: shared',
      ].join('\n');
      const diags = check(source);
      assert.ok(diags.some(d => d.message.includes('Duplicate id "shared"')));
    });
  });

  describe('page property validation', () => {
    it('warns on unknown page property', () => {
      const source = [
        'page "Login" 400x300',
        '  nonsense: whatever',
      ].join('\n');
      const diags = check(source);
      assert.equal(diags.length, 1);
      assert.ok(diags[0].message.includes('Unknown property "nonsense" on page "Login"'));
    });

    it('accepts known page property', () => {
      const source = [
        'page "Login" 400x300',
        '  background: blue',
      ].join('\n');
      const diags = check(source);
      assert.equal(diags.length, 0);
    });

    it('suggests close matches for typos', () => {
      const source = [
        'page "Login" 400x300',
        '  backgroud: blue',
      ].join('\n');
      const diags = check(source);
      assert.equal(diags.length, 1);
      assert.ok(diags[0].message.includes('did you mean "background"'));
    });

    it('does not warn about id property on page', () => {
      const source = [
        'page "Login" 400x300',
        '  id: login',
      ].join('\n');
      const diags = check(source);
      assert.equal(diags.length, 0);
    });

    it('warns on multiple unknown page properties', () => {
      const source = [
        'page "Login" 400x300',
        '  foo: bar',
        '  baz: qux',
      ].join('\n');
      const diags = check(source);
      assert.equal(diags.length, 2);
    });
  });

  describe('property-level spans in diagnostics', () => {
    it('points at property line for invalid enum value', () => {
      const source = [
        'button "OK" 10,10',
        '  variant: huge',
      ].join('\n');
      const diags = check(source);
      assert.equal(diags.length, 1);
      assert.equal(diags[0].span.start.line, 2);
    });

    it('points at property line for unknown property', () => {
      const source = [
        'button "OK" 10,10',
        '  color: red',
      ].join('\n');
      const diags = check(source);
      assert.equal(diags.length, 1);
      assert.equal(diags[0].span.start.line, 2);
    });

    it('points at correct line for each invalid property', () => {
      const source = [
        'button "OK" 10,10',
        '  variant: primary',
        '  color: red',
        '  bogus: whatever',
      ].join('\n');
      const diags = check(source);
      assert.equal(diags.length, 2);
      assert.equal(diags[0].span.start.line, 3);
      assert.equal(diags[1].span.start.line, 4);
    });

    it('points at property line for unknown page property', () => {
      const source = [
        'page "Login" 400x300',
        '  nonsense: whatever',
      ].join('\n');
      const diags = check(source);
      assert.equal(diags.length, 1);
      assert.equal(diags[0].span.start.line, 2);
    });

    it('points at correct line for wrong boolean type', () => {
      const source = [
        'checkbox "OK" 10,10',
        '  checked: yes',
      ].join('\n');
      const diags = check(source);
      assert.equal(diags.length, 1);
      assert.equal(diags[0].span.start.line, 2);
    });
  });

  describe('nested validation', () => {
    it('validates nested children', () => {
      const source = [
        'panel "P" 0,0 200x200',
        '  buttton "Bad" 80x34',
      ].join('\n');
      const diags = check(source);
      assert.equal(diags.length, 1);
      assert.ok(diags[0].message.includes('Unknown control "buttton"'));
    });
  });
});

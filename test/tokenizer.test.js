import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { tokenize } from '../src/tokenizer.js';

describe('tokenizer', () => {
  function tok(source) {
    const diagnostics = [];
    const tokens = tokenize(source, diagnostics);
    return { tokens, diagnostics };
  }

  describe('line classification', () => {
    it('classifies empty lines as BLANK', () => {
      const { tokens } = tok('\n  \n');
      assert.equal(tokens[0].type, 'BLANK');
      assert.equal(tokens[1].type, 'BLANK');
      assert.equal(tokens[2].type, 'BLANK');
    });

    it('classifies comment lines as COMMENT', () => {
      const { tokens } = tok('# this is a comment');
      assert.equal(tokens[0].type, 'COMMENT');
    });

    it('classifies indented comments as COMMENT', () => {
      const { tokens } = tok('  # indented comment');
      assert.equal(tokens[0].type, 'COMMENT');
    });

    it('classifies property lines as PROPERTY', () => {
      const { tokens } = tok('  variant: primary');
      assert.equal(tokens[0].type, 'PROPERTY');
      assert.equal(tokens[0].key, 'variant');
      assert.equal(tokens[0].value, 'primary');
    });

    it('classifies control lines as CONTROL', () => {
      const { tokens } = tok('button "Click me" 10,20 100x34');
      assert.equal(tokens[0].type, 'CONTROL');
      assert.equal(tokens[0].controlType, 'button');
    });
  });

  describe('control parsing', () => {
    it('extracts type, label, position, and size', () => {
      const { tokens } = tok('button "Save" 20,40 120x36');
      const t = tokens[0];
      assert.equal(t.controlType, 'button');
      assert.equal(t.label, 'Save');
      assert.equal(t.posX, 20);
      assert.equal(t.posY, 40);
      assert.equal(t.sizeW, 120);
      assert.equal(t.sizeH, 36);
      assert.equal(t.hasPosition, true);
    });

    it('handles control with no label', () => {
      const { tokens } = tok('separator 10,20 200x2');
      const t = tokens[0];
      assert.equal(t.controlType, 'separator');
      assert.equal(t.label, '');
      assert.equal(t.hasPosition, true);
    });

    it('handles control with label only', () => {
      const { tokens } = tok('heading "Welcome"');
      const t = tokens[0];
      assert.equal(t.controlType, 'heading');
      assert.equal(t.label, 'Welcome');
      assert.equal(t.hasPosition, false);
      assert.equal(t.posX, null);
      assert.equal(t.posY, null);
    });

    it('handles control with size only (no position)', () => {
      const { tokens } = tok('button "OK" 80x34');
      const t = tokens[0];
      assert.equal(t.controlType, 'button');
      assert.equal(t.label, 'OK');
      assert.equal(t.hasPosition, false);
      assert.equal(t.sizeW, 80);
      assert.equal(t.sizeH, 34);
    });

    it('handles type-only control', () => {
      const { tokens } = tok('separator');
      const t = tokens[0];
      assert.equal(t.controlType, 'separator');
      assert.equal(t.label, '');
      assert.equal(t.hasPosition, false);
      assert.equal(t.sizeW, null);
    });

    it('handles page declaration', () => {
      const { tokens } = tok('page "Settings" 500x400');
      const t = tokens[0];
      assert.equal(t.controlType, 'page');
      assert.equal(t.label, 'Settings');
      assert.equal(t.sizeW, 500);
      assert.equal(t.sizeH, 400);
    });

    it('handles hyphenated control types', () => {
      const { tokens } = tok('my-control "Test" 100x50');
      assert.equal(tokens[0].controlType, 'my-control');
    });

    it('parses label with escaped quote', () => {
      const { tokens } = tok('button "Click \\"here\\""');
      assert.equal(tokens[0].label, 'Click "here"');
    });

    it('parses label with escaped backslash', () => {
      const { tokens } = tok('button "path\\\\to"');
      assert.equal(tokens[0].label, 'path\\to');
    });

    it('parses label with escaped backslash before quote', () => {
      const { tokens } = tok('button "end\\\\\\""');
      assert.equal(tokens[0].label, 'end\\"');
    });
  });

  describe('inline id parsing', () => {
    it('extracts id from page declaration', () => {
      const { tokens } = tok('page "Login" 400x450 id: login');
      const t = tokens[0];
      assert.equal(t.controlType, 'page');
      assert.equal(t.label, 'Login');
      assert.equal(t.sizeW, 400);
      assert.equal(t.sizeH, 450);
      assert.equal(t.id, 'login');
    });

    it('extracts id from control with label only', () => {
      const { tokens } = tok('button "OK" id: my-btn');
      const t = tokens[0];
      assert.equal(t.controlType, 'button');
      assert.equal(t.label, 'OK');
      assert.equal(t.id, 'my-btn');
    });

    it('extracts id with hyphenated value', () => {
      const { tokens } = tok('modal "Confirm" id: confirm-modal');
      assert.equal(tokens[0].id, 'confirm-modal');
    });

    it('extracts id with underscored value', () => {
      const { tokens } = tok('button "OK" id: my_button');
      assert.equal(tokens[0].id, 'my_button');
    });

    it('returns null id when not specified', () => {
      const { tokens } = tok('button "OK" 80x34');
      assert.equal(tokens[0].id, null);
    });

    it('extracts id after position and size', () => {
      const { tokens } = tok('button "Save" 20,40 120x36 id: save-btn');
      const t = tokens[0];
      assert.equal(t.posX, 20);
      assert.equal(t.posY, 40);
      assert.equal(t.sizeW, 120);
      assert.equal(t.sizeH, 36);
      assert.equal(t.id, 'save-btn');
    });
  });

  describe('property parsing', () => {
    it('parses boolean true', () => {
      const { tokens } = tok('  checked: true');
      assert.equal(tokens[0].value, true);
    });

    it('parses boolean false', () => {
      const { tokens } = tok('  disabled: false');
      assert.equal(tokens[0].value, false);
    });

    it('parses integer', () => {
      const { tokens } = tok('  value: 42');
      assert.equal(tokens[0].value, 42);
    });

    it('parses negative integer', () => {
      const { tokens } = tok('  offset-x: -10');
      assert.equal(tokens[0].value, -10);
    });

    it('parses positive signed integer', () => {
      const { tokens } = tok('  value: +10');
      assert.equal(tokens[0].value, 10);
    });

    it('parses float', () => {
      const { tokens } = tok('  opacity: 0.5');
      assert.equal(tokens[0].value, 0.5);
    });

    it('parses negative float', () => {
      const { tokens } = tok('  offset: -0.5');
      assert.equal(tokens[0].value, -0.5);
    });

    it('parses positive signed float', () => {
      const { tokens } = tok('  offset: +0.5');
      assert.equal(tokens[0].value, 0.5);
    });

    it('parses quoted string', () => {
      const { tokens } = tok('  placeholder: "Enter text"');
      assert.equal(tokens[0].value, 'Enter text');
    });

    it('parses quoted string with escaped quote', () => {
      const { tokens } = tok('  placeholder: "Say \\"hello\\""');
      assert.equal(tokens[0].value, 'Say "hello"');
    });

    it('parses quoted string with escaped backslash', () => {
      const { tokens } = tok('  path: "C:\\\\Users"');
      assert.equal(tokens[0].value, 'C:\\Users');
    });

    it('parses unquoted string', () => {
      const { tokens } = tok('  variant: primary');
      assert.equal(tokens[0].value, 'primary');
    });

    it('parses pipe-delimited list', () => {
      const { tokens } = tok('  items: "Home" | "Settings" | "Profile"');
      assert.deepEqual(tokens[0].value, ['Home', 'Settings', 'Profile']);
    });

    it('parses pipe list with unquoted values', () => {
      const { tokens } = tok('  items: a | b | c');
      assert.deepEqual(tokens[0].value, ['a', 'b', 'c']);
    });

    it('parses pipe list with escaped pipe', () => {
      const { tokens } = tok('  items: Foo|Bar\\|Baz');
      assert.deepEqual(tokens[0].value, ['Foo', 'Bar|Baz']);
    });

    it('parses pipe list with escaped pipe in quoted item', () => {
      const { tokens } = tok('  items: "A\\|B" | "C"');
      assert.deepEqual(tokens[0].value, ['A|B', 'C']);
    });

    it('handles hyphenated property keys', () => {
      const { tokens } = tok('  font-size: large');
      assert.equal(tokens[0].key, 'font-size');
      assert.equal(tokens[0].value, 'large');
    });
  });

  describe('indentation', () => {
    it('measures space indentation', () => {
      const { tokens } = tok('    button "Test"');
      assert.equal(tokens[0].indent, 4);
    });

    it('treats tab as 2 spaces', () => {
      const { tokens } = tok('\tbutton "Test"');
      assert.equal(tokens[0].indent, 2);
    });

    it('handles mixed tabs and spaces', () => {
      const { tokens } = tok('\t  button "Test"');
      assert.equal(tokens[0].indent, 4); // tab(2) + 2 spaces
    });
  });

  describe('spans', () => {
    it('assigns 1-based line numbers', () => {
      const { tokens } = tok('page "Test" 800x600\nbutton "OK"');
      assert.equal(tokens[0].span.start.line, 1);
      assert.equal(tokens[1].span.start.line, 2);
    });

    it('assigns column range', () => {
      const { tokens } = tok('  button "OK"');
      assert.equal(tokens[0].span.start.column, 1);
      assert.equal(tokens[0].span.end.column, 14);
    });
  });

  describe('full document', () => {
    it('tokenizes a complete document', () => {
      const source = [
        'page "Test" 400x300',
        '',
        '# A button',
        'button "OK" 10,20 80x34',
        '  variant: primary',
      ].join('\n');
      const { tokens, diagnostics } = tok(source);

      assert.equal(tokens.length, 5);
      assert.equal(tokens[0].type, 'CONTROL'); // page
      assert.equal(tokens[1].type, 'BLANK');
      assert.equal(tokens[2].type, 'COMMENT');
      assert.equal(tokens[3].type, 'CONTROL'); // button
      assert.equal(tokens[4].type, 'PROPERTY');
      assert.equal(diagnostics.length, 0);
    });
  });
});

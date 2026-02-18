import { describe, it, before } from 'node:test';
import { strict as assert } from 'node:assert';
import { getControl, hasControl, getControlTypes, getAllControls, clearRegistry } from '../src/registry.js';

// Register all built-in controls
import '../src/controls/index.js';

describe('registry', () => {
  describe('built-in controls', () => {
    it('registers all 39 controls', () => {
      const types = getControlTypes();
      assert.equal(types.length, 39);
    });

    it('has all expected control types', () => {
      const expected = [
        'label', 'heading', 'link',
        'button', 'textfield', 'textarea', 'checkbox', 'radio', 'dropdown', 'toggle', 'slider',
        'searchfield',
        'row', 'column', 'stack', 'frame', 'panel', 'card', 'separator', 'image', 'splitter', 'modal',
        'navbar', 'sidebar', 'divider',
        'list', 'table',
        'progress', 'badge', 'icon',
        'stepper', 'skeleton',
        'tabs', 'avatar', 'breadcrumb', 'tooltip',
        'menu', 'chip', 'toast',
      ];
      for (const type of expected) {
        assert.ok(hasControl(type), `Missing control: ${type}`);
      }
    });
  });

  describe('getControl()', () => {
    it('returns a control definition', () => {
      const btn = getControl('button');
      assert.ok(btn);
      assert.equal(btn.type, 'button');
      assert.equal(btn.category, 'input');
      assert.deepEqual(btn.defaultSize, [100, 34]);
    });

    it('returns undefined for unknown types', () => {
      assert.equal(getControl('nonexistent'), undefined);
    });
  });

  describe('control definition structure', () => {
    it('every control has required fields', () => {
      for (const def of getAllControls()) {
        assert.equal(typeof def.type, 'string', `${def.type || 'unknown'}: type should be string`);
        assert.equal(typeof def.category, 'string', `${def.type}: category should be string`);
        assert.ok(Array.isArray(def.defaultSize), `${def.type}: defaultSize should be array`);
        assert.equal(def.defaultSize.length, 2, `${def.type}: defaultSize should have 2 elements`);
        assert.equal(typeof def.properties, 'object', `${def.type}: properties should be object`);
        assert.equal(typeof def.render, 'function', `${def.type}: render should be function`);
      }
    });

    it('layout controls have implicitLayout set', () => {
      assert.equal(getControl('row').implicitLayout, 'row');
      assert.equal(getControl('column').implicitLayout, 'column');
      assert.equal(getControl('stack').implicitLayout, 'column');
    });

    it('container controls have contentOffset', () => {
      const panel = getControl('panel');
      assert.equal(typeof panel.contentOffset, 'function');
      assert.deepEqual(panel.contentOffset({ label: 'Test' }), { top: 28 });
      assert.deepEqual(panel.contentOffset({ label: '' }), { top: 0 });

      const frame = getControl('frame');
      assert.deepEqual(frame.contentOffset({ label: 'Title' }), { top: 16 });

      const card = getControl('card');
      assert.deepEqual(card.contentOffset({ label: 'Card' }), { top: 32 });
    });
  });
});

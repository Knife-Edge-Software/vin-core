import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { defaultTheme, createTheme } from '../src/theme.js';

describe('theme', () => {
  describe('defaultTheme', () => {
    it('has all required font properties', () => {
      assert.equal(typeof defaultTheme.font, 'string');
      assert.equal(typeof defaultTheme.size, 'number');
      assert.equal(typeof defaultTheme.sizeSmall, 'number');
      assert.equal(typeof defaultTheme.sizeLarge, 'number');
    });

    it('has all required color properties', () => {
      const colorKeys = [
        'text', 'textMuted', 'placeholder',
        'fill', 'bg', 'border', 'borderLight',
        'accent', 'accentDark', 'accentText',
        'danger', 'dangerStroke', 'dangerText',
        'success', 'warning', 'info',
        'selection',
        'disabledFill', 'disabledStroke', 'disabledText',
      ];
      for (const key of colorKeys) {
        assert.equal(typeof defaultTheme[key], 'string', `${key} should be a string`);
      }
    });

    it('has border radius', () => {
      assert.equal(typeof defaultTheme.radius, 'number');
    });
  });

  describe('createTheme()', () => {
    it('returns default theme when no overrides', () => {
      const theme = createTheme({});
      assert.deepEqual(theme, defaultTheme);
    });

    it('overrides specific values', () => {
      const theme = createTheme({ accent: '#ff0000', radius: 8 });
      assert.equal(theme.accent, '#ff0000');
      assert.equal(theme.radius, 8);
      // Untouched values preserved
      assert.equal(theme.text, defaultTheme.text);
      assert.equal(theme.fill, defaultTheme.fill);
    });

    it('does not mutate defaultTheme', () => {
      const original = defaultTheme.accent;
      createTheme({ accent: '#000' });
      assert.equal(defaultTheme.accent, original);
    });
  });
});

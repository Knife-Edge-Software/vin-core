/**
 * Vin theme system.
 *
 * The theme object flows through the render pipeline. Controls receive
 * the theme as a parameter — no globals, no module-level state.
 */

export const defaultTheme = {
  font: "-apple-system, 'Segoe UI', Roboto, sans-serif",

  // Font sizes
  size: 13,
  sizeSmall: 11,
  sizeLarge: 18,

  // Text colors
  text: '#333333',
  textMuted: '#888888',
  placeholder: '#aaaaaa',

  // Surfaces
  fill: '#ffffff',
  bg: '#f5f5f5',
  border: '#a0a0a0',
  borderLight: '#d0d0d0',

  // Accent (links, primary buttons, selections)
  accent: '#4a90d9',
  accentDark: '#3a7bc8',
  accentText: '#ffffff',

  // Semantic colors
  danger: '#d94a4a',
  dangerStroke: '#b33a3a',
  dangerText: '#ffffff',
  success: '#4caf50',
  warning: '#ff9800',
  info: '#4a90d9',

  // Interactive states
  selection: '#e3f0ff',
  disabledFill: '#e0e0e0',
  disabledStroke: '#c0c0c0',
  disabledText: '#999999',

  // Border radius
  radius: 4,
};

/**
 * Create a new theme by merging overrides into the default theme.
 *
 * @param {Partial<typeof defaultTheme>} overrides
 * @returns {typeof defaultTheme}
 */
export function createTheme(overrides) {
  return { ...defaultTheme, ...overrides };
}

import { group, rect, text, circle, line, path } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'toast',
  category: 'display',
  defaultSize: [320, 48],
  properties: {
    variant: { type: 'enum', values: ['info', 'success', 'error', 'warning'], default: 'info' },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const variant = node.properties?.variant || 'info';
    const w = node.width;
    const h = node.height;
    const label = node.label || '';

    let accentColor, iconChar;
    if (variant === 'success') {
      accentColor = theme.success;
      iconChar = '\u2713'; // checkmark
    } else if (variant === 'error') {
      accentColor = theme.danger;
      iconChar = '!';
    } else if (variant === 'warning') {
      accentColor = theme.warning;
      iconChar = '!';
    } else {
      accentColor = theme.info;
      iconChar = 'i';
    }

    return group({},
      // Background
      rect(0, 0, w, h, {
        fill: theme.fill,
        stroke: theme.borderLight,
        rx: theme.radius,
      }),
      // Left accent bar
      rect(0, 0, 4, h, {
        fill: accentColor,
        rx: 2,
      }),
      // Icon circle
      circle(24, h / 2, 10, {
        fill: accentColor,
      }),
      // Icon character
      text(iconChar, 24, h / 2 + 4, {
        ...fontAttrs(theme, theme.sizeSmall),
        fill: '#fff',
        'text-anchor': 'middle',
        'font-weight': 'bold',
      }),
      // Message text
      text(label, 42, h / 2 + 5, {
        ...fontAttrs(theme),
        fill: theme.text,
      }),
    );
  },
};

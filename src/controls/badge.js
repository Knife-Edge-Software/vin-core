import { group, rect, text } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'badge',
  category: 'indicator',
  defaultSize: [60, 22],
  properties: {
    variant: { type: 'enum', values: ['default', 'success', 'warning', 'error', 'info'], default: 'default' },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const variant = node.properties?.variant || 'default';
    const w = node.width;
    const h = node.height;

    let fill, textColor;

    if (variant === 'success') {
      fill = '#4caf50';
      textColor = '#fff';
    } else if (variant === 'warning') {
      fill = '#ff9800';
      textColor = '#fff';
    } else if (variant === 'error') {
      fill = theme.danger;
      textColor = '#fff';
    } else if (variant === 'info') {
      fill = theme.accent;
      textColor = '#fff';
    } else {
      fill = theme.bg;
      textColor = theme.text;
    }

    return group({},
      rect(0, 0, w, h, { fill, rx: h / 2 }),
      text(node.label || '', w / 2, h / 2 + 4, {
        ...fontAttrs(theme, theme.sizeSmall),
        fill: textColor,
        'text-anchor': 'middle',
      }),
    );
  },
};

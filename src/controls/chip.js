import { group, rect, text, line } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'chip',
  category: 'display',
  defaultSize: [80, 28],
  properties: {
    dismissible: { type: 'boolean', default: false },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const w = node.width;
    const h = node.height;
    const dismissible = node.properties?.dismissible || false;
    const label = node.label || '';
    const cy = h / 2;

    const children = [
      // Pill background
      rect(0, 0, w, h, {
        fill: theme.bg,
        stroke: theme.borderLight,
        rx: h / 2,
      }),
    ];

    if (dismissible) {
      // Label shifted left to make room for ×
      children.push(
        text(label, (w - 12) / 2, cy + 4, {
          ...fontAttrs(theme, theme.sizeSmall),
          fill: theme.text,
          'text-anchor': 'middle',
        }),
      );

      // × dismiss icon
      const xCenter = w - 14;
      const d = 3;
      children.push(
        line(xCenter - d, cy - d, xCenter + d, cy + d, {
          stroke: theme.textMuted,
          'stroke-width': 1.5,
          'stroke-linecap': 'round',
        }),
        line(xCenter + d, cy - d, xCenter - d, cy + d, {
          stroke: theme.textMuted,
          'stroke-width': 1.5,
          'stroke-linecap': 'round',
        }),
      );
    } else {
      children.push(
        text(label, w / 2, cy + 4, {
          ...fontAttrs(theme, theme.sizeSmall),
          fill: theme.text,
          'text-anchor': 'middle',
        }),
      );
    }

    return group({}, ...children);
  },
};

import { group, rect, text, circle, line } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'searchfield',
  category: 'input',
  defaultSize: [220, 34],
  properties: {
    placeholder: { type: 'string', default: 'Search...' },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const w = node.width;
    const h = node.height;
    const placeholder = node.properties?.placeholder || 'Search...';
    const displayText = node.label || placeholder;
    const isPlaceholder = !node.label;

    // Magnifying glass icon positioned in left padding
    const iconCx = 14;
    const iconCy = h / 2;
    const iconR = 5;

    return group({},
      // Input background
      rect(0, 0, w, h, {
        fill: theme.fill,
        stroke: theme.border,
        rx: theme.radius,
      }),
      // Magnifying glass circle
      circle(iconCx, iconCy, iconR, {
        fill: 'none',
        stroke: theme.textMuted,
        'stroke-width': 1.5,
      }),
      // Magnifying glass handle
      line(iconCx + 4, iconCy + 4, iconCx + 7, iconCy + 7, {
        stroke: theme.textMuted,
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
      }),
      // Text
      text(displayText, 28, h / 2 + 5, {
        ...fontAttrs(theme),
        fill: isPlaceholder ? theme.placeholder : theme.text,
      }),
    );
  },
};

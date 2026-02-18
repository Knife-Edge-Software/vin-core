import { group, rect, text, line } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'navbar',
  category: 'layout',
  defaultSize: [800, 48],
  properties: {
    items: { type: 'list', default: [] },
  },
  implicitLayout: 'row',
  contentOffset: null,

  render(node, theme) {
    const items = node.properties?.items || [];
    const w = node.width;
    const h = node.height;
    const cy = h / 2 + 5;

    const children = [
      rect(0, 0, w, h, { fill: theme.fill, stroke: theme.borderLight }),
      line(0, h, w, h, { stroke: theme.border, 'stroke-width': 1 }),
    ];

    // Logo area from label
    if (node.label) {
      children.push(
        text(node.label, 16, cy, {
          ...fontAttrs(theme, theme.sizeLarge),
          fill: theme.text,
          'font-weight': 'bold',
        }),
      );
    }

    // Nav links on the right side
    const linkStartX = w - items.length * 80 - 16;
    for (let i = 0; i < items.length; i++) {
      const x = linkStartX + i * 80 + 40;
      children.push(
        text(items[i], x, cy, {
          ...fontAttrs(theme),
          fill: theme.accent,
          'text-anchor': 'middle',
        }),
      );
    }

    return group({}, ...children);
  },
};

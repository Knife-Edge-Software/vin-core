import { group, rect, text, line } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'menu',
  category: 'display',
  defaultSize: [180, 200],
  properties: {
    items: { type: 'list', default: [] },
    active: { type: 'number', default: -1 },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const items = node.properties?.items || [];
    const active = node.properties?.active ?? -1;
    const w = node.width;
    const h = node.height;
    const itemH = 32;

    const children = [
      // Menu background with shadow-like border
      rect(0, 0, w, h, {
        fill: theme.fill,
        stroke: theme.borderLight,
        rx: theme.radius,
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
      }),
    ];

    for (let i = 0; i < items.length; i++) {
      const y = i * itemH;
      const item = items[i];

      // Separator support: item is "---" or "-"
      if (item === '---' || item === '-') {
        children.push(
          line(8, y + itemH / 2, w - 8, y + itemH / 2, {
            stroke: theme.borderLight,
            'stroke-width': 1,
          }),
        );
        continue;
      }

      // Active/hover highlight
      if (i === active) {
        children.push(
          rect(4, y + 2, w - 8, itemH - 4, {
            fill: theme.selection,
            rx: theme.radius,
          }),
        );
      }

      children.push(
        text(item, 12, y + itemH / 2 + 5, {
          ...fontAttrs(theme),
          fill: i === active ? theme.accent : theme.text,
        }),
      );
    }

    return group({}, ...children);
  },
};

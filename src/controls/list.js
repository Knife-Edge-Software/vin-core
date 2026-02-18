import { group, rect, text } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'list',
  category: 'data',
  defaultSize: [200, 120],
  properties: {
    items: { type: 'list', default: [] },
    selected: { type: 'number', default: null },
    numbered: { type: 'boolean', default: false },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const items = node.properties?.items || [];
    const selected = node.properties?.selected;
    const numbered = node.properties?.numbered || false;
    const w = node.width;
    const h = node.height;
    const rowHeight = 24;

    const children = [
      rect(0, 0, w, h, { fill: theme.fill, stroke: theme.borderLight, rx: theme.radius }),
    ];

    for (let i = 0; i < items.length; i++) {
      const y = i * rowHeight;
      if (y + rowHeight > h) break;

      if (i === selected) {
        children.push(
          rect(1, y + 1, w - 2, rowHeight, { fill: theme.selection, rx: 2 }),
        );
      }

      const prefix = numbered ? `${i + 1}. ` : '\u2022 ';
      children.push(
        text(prefix + items[i], 10, y + 16, {
          ...fontAttrs(theme),
          fill: theme.text,
        }),
      );
    }

    return group({}, ...children);
  },
};

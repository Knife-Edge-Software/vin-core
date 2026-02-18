import { group, rect, text, line } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'tabs',
  category: 'display',
  defaultSize: [300, 34],
  properties: {
    items: { type: 'list', default: [] },
    active: { type: 'number', default: 0 },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const items = node.properties?.items || [];
    const active = node.properties?.active || 0;
    const w = node.width;
    const h = node.height;
    const tabCount = items.length || 1;
    const tabWidth = w / tabCount;

    const children = [
      // Background
      rect(0, 0, w, h, { fill: theme.bg }),
      // Bottom line
      line(0, h, w, h, { stroke: theme.borderLight }),
    ];

    for (let i = 0; i < items.length; i++) {
      const isActive = i === active;
      const cx = i * tabWidth + tabWidth / 2;

      children.push(
        text(items[i], cx, h / 2 + 5, {
          ...fontAttrs(theme),
          fill: isActive ? theme.accent : theme.textMuted,
          'font-weight': isActive ? 'bold' : 'normal',
          'text-anchor': 'middle',
        }),
      );

      if (isActive) {
        children.push(
          rect(i * tabWidth, h - 3, tabWidth, 3, { fill: theme.accent }),
        );
      }
    }

    return group({}, ...children);
  },
};

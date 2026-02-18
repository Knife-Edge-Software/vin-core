import { group, rect, text, circle } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'sidebar',
  category: 'layout',
  defaultSize: [220, 400],
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
    const itemH = 40;
    const headerH = node.label ? 48 : 0;

    const children = [
      // Dark background
      rect(0, 0, w, h, { fill: '#2c2c2c' }),
    ];

    // Title / brand area
    if (node.label) {
      children.push(
        text(node.label, 16, 30, {
          ...fontAttrs(theme, theme.sizeLarge),
          fill: '#ffffff',
          'font-weight': 'bold',
        }),
      );
    }

    for (let i = 0; i < items.length; i++) {
      const y = headerH + i * itemH;
      const isActive = i === active;

      // Active highlight
      if (isActive) {
        children.push(
          rect(0, y, w, itemH, { fill: 'rgba(255,255,255,0.1)' }),
          // Left accent bar
          rect(0, y, 3, itemH, { fill: theme.accent }),
        );
      }

      // Icon placeholder circle
      children.push(
        circle(28, y + itemH / 2, 8, {
          fill: 'none',
          stroke: isActive ? theme.accent : '#888888',
          'stroke-width': 1.5,
        }),
      );

      // Label
      children.push(
        text(items[i], 46, y + itemH / 2 + 5, {
          ...fontAttrs(theme),
          fill: isActive ? '#ffffff' : '#bbbbbb',
        }),
      );
    }

    return group({}, ...children);
  },
};

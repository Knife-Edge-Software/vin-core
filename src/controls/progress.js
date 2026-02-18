import { group, rect } from '../svg.js';

export default {
  type: 'progress',
  category: 'indicator',
  defaultSize: [200, 8],
  properties: {
    value: { type: 'number', default: 0 },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const pct = Math.max(0, Math.min(100, node.properties?.value || 0));
    const w = node.width;
    const h = node.height;
    const fillWidth = (pct / 100) * w;

    return group({},
      // Track
      rect(0, 0, w, h, {
        fill: theme.bg,
        stroke: theme.borderLight,
        rx: h / 2,
      }),
      // Fill
      rect(0, 0, fillWidth, h, {
        fill: theme.accent,
        rx: h / 2,
      }),
    );
  },
};

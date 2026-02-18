import { group, rect } from '../svg.js';

export default {
  type: 'skeleton',
  category: 'indicator',
  defaultSize: [200, 60],
  properties: {
    lines: { type: 'number', default: 3 },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const lines = Math.max(1, node.properties?.lines || 3);
    const w = node.width;
    const h = node.height;
    const lineH = 12;
    const gap = 8;
    const totalNeeded = lines * lineH + (lines - 1) * gap;
    const startY = Math.max(0, (h - totalNeeded) / 2);

    const children = [];

    for (let i = 0; i < lines; i++) {
      const y = startY + i * (lineH + gap);
      // Last line is shorter to look natural
      const lineW = i === lines - 1 ? w * 0.6 : w;

      children.push(
        rect(0, y, lineW, lineH, {
          fill: theme.borderLight,
          rx: 4,
        }),
      );
    }

    return group({}, ...children);
  },
};

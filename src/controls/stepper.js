import { group, rect, text, circle, line } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'stepper',
  category: 'indicator',
  defaultSize: [300, 32],
  properties: {
    steps: { type: 'number', default: 3 },
    current: { type: 'number', default: 0 },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const steps = Math.max(1, node.properties?.steps || 3);
    const current = node.properties?.current || 0;
    const w = node.width;
    const h = node.height;
    const cy = h / 2;
    const r = 12;

    // Spread step circles evenly across width
    const padding = r + 4;
    const span = w - padding * 2;
    const gap = steps > 1 ? span / (steps - 1) : 0;

    const children = [];

    for (let i = 0; i < steps; i++) {
      const cx = steps === 1 ? w / 2 : padding + i * gap;
      const done = i < current;
      const active = i === current;

      // Connecting line to next step
      if (i < steps - 1) {
        const nextCx = padding + (i + 1) * gap;
        children.push(
          line(cx + r, cy, nextCx - r, cy, {
            stroke: done ? theme.accent : theme.borderLight,
            'stroke-width': 2,
          }),
        );
      }

      // Step circle
      children.push(
        circle(cx, cy, r, {
          fill: done || active ? theme.accent : theme.fill,
          stroke: done || active ? theme.accent : theme.border,
          'stroke-width': 2,
        }),
      );

      // Step number
      children.push(
        text(String(i + 1), cx, cy + 4, {
          ...fontAttrs(theme, theme.sizeSmall),
          fill: done || active ? theme.accentText : theme.textMuted,
          'text-anchor': 'middle',
        }),
      );
    }

    return group({}, ...children);
  },
};

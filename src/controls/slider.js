import { group, rect, circle, text } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'slider',
  category: 'input',
  defaultSize: [200, 20],
  properties: {
    value: { type: 'number', default: 50 },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const pct = Math.max(0, Math.min(100, node.properties?.value ?? 50));
    const w = node.width;
    const h = node.height;
    const trackY = h / 2;
    const trackH = 4;
    const thumbX = (pct / 100) * w;
    const thumbR = 8;

    const children = [
      // Track background
      rect(0, trackY - trackH / 2, w, trackH, {
        fill: theme.borderLight,
        rx: trackH / 2,
      }),
      // Filled portion
      rect(0, trackY - trackH / 2, thumbX, trackH, {
        fill: theme.accent,
        rx: trackH / 2,
      }),
      // Thumb
      circle(thumbX, trackY, thumbR, {
        fill: theme.fill,
        stroke: theme.accent,
        'stroke-width': 2,
      }),
    ];

    if (node.label) {
      children.push(
        text(node.label, w + 10, trackY + 4, {
          ...fontAttrs(theme, theme.sizeSmall),
          fill: theme.textMuted,
        }),
      );
    }

    return group({}, ...children);
  },
};

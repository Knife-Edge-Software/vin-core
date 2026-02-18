import { group, circle, text } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'avatar',
  category: 'display',
  defaultSize: [40, 40],
  properties: {
    variant: { type: 'enum', values: ['default', 'blue', 'green', 'orange', 'red', 'purple'], default: 'default' },
    status: { type: 'string', default: '' },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const variant = node.properties?.variant || 'default';
    const status = node.properties?.status || '';
    const w = node.width;
    const h = node.height;
    const r = Math.min(w, h) / 2;
    const cx = r;
    const cy = r;

    const variantColors = {
      blue: '#4a90d9',
      green: '#4caf50',
      orange: '#ff9800',
      red: '#d94a4a',
      purple: '#9c27b0',
    };
    const fill = variantColors[variant] || theme.border;

    const initials = node.label || '?';
    const fontSize = r * 0.8;

    const children = [
      circle(cx, cy, r, { fill }),
      text(initials, cx, cy + fontSize * 0.35, {
        ...fontAttrs(theme, fontSize),
        fill: '#fff',
        'text-anchor': 'middle',
      }),
    ];

    if (status) {
      const dotR = r * 0.25;
      const statusColors = {
        online: '#4caf50',
        busy: '#d94a4a',
        away: '#ff9800',
      };
      const dotColor = statusColors[status] || theme.border;

      children.push(
        circle(cx + r * 0.7, cy + r * 0.7, dotR, {
          fill: dotColor,
          stroke: theme.fill,
          'stroke-width': 2,
        }),
      );
    }

    return group({}, ...children);
  },
};

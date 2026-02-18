import { el, group, rect, text, line } from '../svg.js';
import { icons } from '../icons.js';
import { resolveIcon } from '../icon-aliases.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'icon',
  category: 'indicator',
  defaultSize: [24, 24],
  properties: {
    name: { type: 'string', default: '' },
    color: { type: 'string', default: '' },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const name = node.properties?.name || node.label || '';
    const color = node.properties?.color || theme.textMuted;
    const w = node.width;
    const h = node.height;
    const scale = Math.min(w, h) / 24;

    const iconSvg = resolveIcon(name, icons);

    if (iconSvg) {
      return el('g', {
        transform: `scale(${scale})`,
        fill: 'none',
        stroke: color,
        'stroke-width': 2,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }, iconSvg);
    }

    // Fallback: dashed rect with name
    return group({},
      rect(0, 0, w, h, {
        fill: 'none',
        stroke: theme.borderLight,
        'stroke-dasharray': '4 2',
        rx: theme.radius,
      }),
      text(name, w / 2, h / 2 + 4, {
        ...fontAttrs(theme, theme.sizeSmall),
        fill: theme.textMuted,
        'text-anchor': 'middle',
      }),
    );
  },
};

import { group, rect, line, text } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'image',
  category: 'layout',
  defaultSize: [150, 100],
  properties: {
    alt: { type: 'string', default: '' },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const w = node.width;
    const h = node.height;
    const label = node.properties.alt || node.label || 'Image';

    return group({},
      rect(0, 0, w, h, {
        fill: theme.bg,
        stroke: theme.borderLight,
        rx: theme.radius,
      }),
      line(0, 0, w, h, {
        stroke: theme.borderLight,
        'stroke-width': 1,
      }),
      line(w, 0, 0, h, {
        stroke: theme.borderLight,
        'stroke-width': 1,
      }),
      text(label, w / 2, h / 2 + 5, {
        ...fontAttrs(theme, theme.sizeSmall),
        'text-anchor': 'middle',
        fill: theme.placeholder,
      }),
    );
  },
};

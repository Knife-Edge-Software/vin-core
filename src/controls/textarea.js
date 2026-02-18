import { group, rect, text, line } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'textarea',
  category: 'input',
  defaultSize: [200, 80],
  properties: {
    placeholder: { type: 'string', default: '' },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const placeholder = node.properties.placeholder || '';

    const w = node.width;
    const h = node.height;

    const children = [
      rect(0, 0, w, h, { fill: theme.fill, stroke: theme.borderLight, rx: theme.radius }),
      text(placeholder, 8, 20, {
        ...fontAttrs(theme),
        fill: theme.placeholder,
      }),
    ];

    for (let y = 34; y <= h - 8; y += 18) {
      children.push(
        line(8, y, w - 8, y, { stroke: '#eee', 'stroke-width': 1 }),
      );
    }

    return group({}, ...children);
  },
};

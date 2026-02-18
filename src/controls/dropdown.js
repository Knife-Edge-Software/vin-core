import { group, rect, text, polyline } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'dropdown',
  category: 'input',
  defaultSize: [200, 32],
  properties: {
    items: { type: 'list', default: [] },
    selected: { type: 'number', default: null },
    placeholder: { type: 'string', default: '' },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const items = node.properties.items || [];
    const selected = node.properties.selected;
    const placeholder = node.properties.placeholder || '';

    const w = node.width;
    const h = node.height;

    let display;
    if (selected != null && items[selected] != null) {
      display = items[selected];
    } else {
      display = placeholder || node.label || '';
    }

    const chevronX = w - 20;
    const midY = h / 2;

    return group({},
      rect(0, 0, w, h, { fill: theme.fill, stroke: theme.borderLight, rx: theme.radius }),
      text(display, 8, h / 2 + 5, {
        ...fontAttrs(theme),
        fill: theme.text,
      }),
      polyline(`${chevronX},${midY - 3} ${chevronX + 6},${midY + 3} ${chevronX + 12},${midY - 3}`, {
        fill: 'none',
        stroke: theme.border,
        'stroke-width': 1.5,
      }),
    );
  },
};

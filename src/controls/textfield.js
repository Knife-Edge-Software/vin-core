import { group, rect, text } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'textfield',
  category: 'input',
  defaultSize: [200, 32],
  properties: {
    placeholder: { type: 'string', default: '' },
    value: { type: 'string', default: '' },
    mask: { type: 'boolean', default: false },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const placeholder = node.properties.placeholder || '';
    const value = node.properties.value || '';
    const mask = node.properties.mask || false;

    const w = node.width;
    const h = node.height;

    let display, color;
    if (value) {
      display = mask ? '\u2022'.repeat(value.length) : value;
      color = theme.text;
    } else {
      display = placeholder || node.label || '';
      color = theme.placeholder;
    }

    return group({},
      rect(0, 0, w, h, { fill: theme.fill, stroke: theme.borderLight, rx: theme.radius }),
      text(display, 8, h / 2 + 5, {
        ...fontAttrs(theme),
        fill: color,
      }),
    );
  },
};

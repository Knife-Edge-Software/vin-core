import { group, rect, text, polyline } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'checkbox',
  category: 'input',
  defaultSize: [120, 20],
  properties: {
    checked: { type: 'boolean', default: false },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const checked = node.properties.checked || false;

    const children = [
      rect(0, 2, 14, 14, { fill: theme.fill, stroke: theme.border, rx: 2 }),
    ];

    if (checked) {
      children.push(
        polyline('3,9 6,13 11,4', {
          fill: 'none',
          stroke: theme.accent,
          'stroke-width': 2,
        }),
      );
    }

    children.push(
      text(node.label || '', 20, 14, {
        ...fontAttrs(theme),
        fill: theme.text,
      }),
    );

    return group({}, ...children);
  },
};

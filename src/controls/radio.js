import { group, circle, text } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'radio',
  category: 'input',
  defaultSize: [120, 20],
  properties: {
    selected: { type: 'boolean', default: false },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const selected = node.properties.selected || false;

    const children = [
      circle(8, 9, 7, { fill: theme.fill, stroke: theme.border }),
    ];

    if (selected) {
      children.push(
        circle(8, 9, 4, { fill: theme.accent }),
      );
    }

    children.push(
      text(node.label || '', 22, 14, {
        ...fontAttrs(theme),
        fill: theme.text,
      }),
    );

    return group({}, ...children);
  },
};

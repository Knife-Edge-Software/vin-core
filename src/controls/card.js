import { group, rect, text } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'card',
  category: 'layout',
  defaultSize: [280, 180],
  properties: {
    elevated: { type: 'boolean', default: true },
  },
  implicitLayout: null,
  contentOffset(node) {
    return { top: node.label ? 32 : 0 };
  },

  render(node, theme) {
    const elevated = node.properties.elevated !== false;
    const children = [];

    if (elevated) {
      children.push(
        rect(2, 3, node.width, node.height, {
          rx: 6,
          fill: '#00000018',
        }),
      );
    }

    children.push(
      rect(0, 0, node.width, node.height, {
        rx: 6,
        fill: theme.fill,
        stroke: theme.borderLight,
      }),
    );

    if (node.label) {
      children.push(
        text(node.label, 16, 24, {
          ...fontAttrs(theme),
          'font-weight': 'bold',
          fill: theme.text,
        }),
      );
    }

    return group({}, ...children);
  },
};

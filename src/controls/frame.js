import { group, rect, text } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'frame',
  category: 'layout',
  defaultSize: [300, 200],
  properties: {},
  implicitLayout: null,
  contentOffset(node) {
    return { top: node.label ? 16 : 0 };
  },

  render(node, theme) {
    const children = [
      rect(0, 8, node.width, node.height - 8, {
        rx: theme.radius,
        fill: 'none',
        stroke: theme.border,
      }),
    ];

    if (node.label) {
      const titleWidth = node.label.length * 7.5 + 16;
      children.push(
        rect(8, 0, titleWidth, 16, { fill: theme.fill }),
        text(node.label, 16, 13, {
          ...fontAttrs(theme, theme.sizeSmall),
          fill: theme.textMuted,
        }),
      );
    }

    return group({}, ...children);
  },
};

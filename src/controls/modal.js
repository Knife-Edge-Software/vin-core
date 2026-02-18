import { group, rect, text, line } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'modal',
  category: 'layout',
  defaultSize: [400, 250],
  properties: {},
  implicitLayout: null,
  contentOffset: null,
  render(node, theme) {
    const inset = 40;
    const dw = node.width - inset * 2;
    const dh = node.height - inset * 2;
    const closeX = inset + dw - 24;

    return group({},
      // Backdrop
      rect(0, 0, node.width, node.height, { fill: '#00000066', rx: theme.radius }),
      // Dialog body
      rect(inset, inset, dw, dh, { rx: 8, fill: theme.fill, stroke: theme.borderLight }),
      // Title bar background
      rect(inset, inset, dw, 36, { rx: 8, fill: theme.bg }),
      // Square-off bottom of title bar corners
      rect(inset, inset + 28, dw, 8, { fill: theme.bg }),
      // Title bar divider
      line(inset, inset + 36, inset + dw, inset + 36, { stroke: theme.borderLight }),
      // Title text
      node.label
        ? text(node.label, inset + 12, inset + 24, { ...fontAttrs(theme), 'font-weight': 'bold', fill: theme.text })
        : null,
      // Close X
      line(closeX, inset + 12, closeX + 12, inset + 24, { stroke: theme.textMuted, 'stroke-width': 1.5 }),
      line(closeX + 12, inset + 12, closeX, inset + 24, { stroke: theme.textMuted, 'stroke-width': 1.5 }),
    );
  },
};

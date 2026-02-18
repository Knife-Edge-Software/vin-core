import { group, text } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'breadcrumb',
  category: 'display',
  defaultSize: [300, 20],
  properties: {
    items: { type: 'list', default: [] },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const items = node.properties?.items || [];
    const children = [];
    let currentX = 0;

    for (let i = 0; i < items.length; i++) {
      const isLast = i === items.length - 1;
      const color = isLast ? theme.text : theme.accent;

      const attrs = {
        ...fontAttrs(theme, theme.sizeSmall),
        fill: color,
      };

      if (!isLast) {
        attrs['text-decoration'] = 'underline';
      }

      children.push(
        text(items[i], currentX, 14, attrs),
      );

      currentX += items[i].length * 7 + 4;

      if (!isLast) {
        children.push(
          text('/', currentX, 14, {
            ...fontAttrs(theme, theme.sizeSmall),
            fill: theme.textMuted,
          }),
        );
        currentX += 12;
      }
    }

    return group({}, ...children);
  },
};

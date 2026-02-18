import { group, rect, text } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'panel',
  category: 'layout',
  defaultSize: [300, 200],
  properties: {
    variant: { type: 'enum', values: ['default', 'dark', 'accent'], default: 'default' },
  },
  implicitLayout: null,
  contentOffset(node) {
    return { top: node.label ? 28 : 0 };
  },

  render(node, theme) {
    const variant = node.properties.variant || 'default';

    let fill, stroke;
    if (variant === 'dark') {
      fill = '#2a2a2a';
      stroke = '#444';
    } else if (variant === 'accent') {
      fill = '#e8f0fe';
      stroke = theme.accentDark;
    } else {
      fill = theme.bg;
      stroke = theme.borderLight;
    }

    const children = [
      rect(0, 0, node.width, node.height, { rx: theme.radius, fill, stroke }),
    ];

    if (node.label) {
      const textColor = variant === 'dark' ? '#ccc' : theme.text;
      children.push(
        text(node.label, 12, 20, {
          ...fontAttrs(theme, theme.sizeSmall),
          'font-weight': 'bold',
          fill: textColor,
        }),
      );
    }

    return group({}, ...children);
  },
};

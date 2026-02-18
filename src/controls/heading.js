import { text } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

const levelSizeMap = {
  1: 24,
  2: 20,
  3: 16,
};

export default {
  type: 'heading',
  category: 'text',
  defaultSize: [200, 32],
  properties: {
    level: { type: 'enum', values: [1, 2, 3], default: 1 },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const level = node.properties.level || 1;
    const size = levelSizeMap[level] || 24;

    return text(node.label || '', 0, size, {
      ...fontAttrs(theme, size),
      fill: theme.text,
      'font-weight': 'bold',
    });
  },
};

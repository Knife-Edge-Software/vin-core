import { line } from '../svg.js';

export default {
  type: 'separator',
  category: 'layout',
  defaultSize: [200, 2],
  properties: {
    direction: { type: 'enum', values: ['horizontal', 'vertical'], default: 'horizontal' },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const direction = node.properties.direction || 'horizontal';

    if (direction === 'vertical') {
      return line(1, 0, 1, node.height, {
        stroke: theme.borderLight,
        'stroke-width': 1,
      });
    }

    return line(0, 1, node.width, 1, {
      stroke: theme.borderLight,
      'stroke-width': 1,
    });
  },
};

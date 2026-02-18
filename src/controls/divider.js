import { line } from '../svg.js';

export default {
  type: 'divider',
  category: 'layout',
  defaultSize: [200, 1],
  properties: {},
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    return line(0, 0, node.width, 0, {
      stroke: theme.borderLight,
      'stroke-width': 1,
    });
  },
};

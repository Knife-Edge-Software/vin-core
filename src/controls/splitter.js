import { group, rect, line } from '../svg.js';

export default {
  type: 'splitter',
  category: 'layout',
  defaultSize: [200, 8],
  properties: {
    direction: { type: 'enum', values: ['horizontal', 'vertical'], default: 'horizontal' },
  },
  implicitLayout: null,
  contentOffset: null,
  render(node, theme) {
    const vertical = node.properties.direction === 'vertical';
    const midX = node.width / 2;
    const midY = node.height / 2;

    if (vertical) {
      return group({},
        line(midX, 0, midX, node.height, { stroke: theme.borderLight, 'stroke-width': 1 }),
        rect(midX - 8, midY - 12, 16, 24, { rx: 3, fill: theme.bg, stroke: theme.border }),
        line(midX - 3, midY - 4, midX + 3, midY - 4, { stroke: theme.border, 'stroke-width': 1 }),
        line(midX - 3, midY, midX + 3, midY, { stroke: theme.border, 'stroke-width': 1 }),
        line(midX - 3, midY + 4, midX + 3, midY + 4, { stroke: theme.border, 'stroke-width': 1 }),
      );
    }

    return group({},
      line(0, midY, node.width, midY, { stroke: theme.borderLight, 'stroke-width': 1 }),
      rect(midX - 12, midY - 8, 24, 16, { rx: 3, fill: theme.bg, stroke: theme.border }),
      line(midX - 4, midY - 3, midX - 4, midY + 3, { stroke: theme.border, 'stroke-width': 1 }),
      line(midX, midY - 3, midX, midY + 3, { stroke: theme.border, 'stroke-width': 1 }),
      line(midX + 4, midY - 3, midX + 4, midY + 3, { stroke: theme.border, 'stroke-width': 1 }),
    );
  },
};

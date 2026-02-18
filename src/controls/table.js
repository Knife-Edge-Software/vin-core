import { group, rect, text, line } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'table',
  category: 'data',
  defaultSize: [300, 150],
  properties: {
    columns: { type: 'list', default: [] },
    rows: { type: 'number', default: 3 },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const columns = node.properties?.columns || [];
    const rows = node.properties?.rows || 3;
    const w = node.width;
    const h = node.height;
    const headerHeight = 28;
    const rowHeight = 24;
    const colCount = columns.length || 1;
    const colWidth = w / colCount;

    const children = [
      // Outer border
      rect(0, 0, w, h, { fill: theme.fill, stroke: theme.borderLight, rx: theme.radius }),
      // Header background
      rect(0, 0, w, headerHeight, { fill: theme.bg, rx: theme.radius }),
      // Line below header
      line(0, headerHeight, w, headerHeight, { stroke: theme.borderLight }),
    ];

    // Column headers and vertical dividers
    for (let i = 0; i < columns.length; i++) {
      children.push(
        text(columns[i], i * colWidth + 8, 18, {
          ...fontAttrs(theme, theme.sizeSmall),
          'font-weight': 'bold',
          fill: theme.text,
        }),
      );

      if (i > 0) {
        children.push(
          line(i * colWidth, 0, i * colWidth, h, { stroke: theme.borderLight }),
        );
      }
    }

    // Row dividers
    for (let r = 0; r < rows; r++) {
      const y = headerHeight + r * rowHeight;
      if (y > h) break;
      if (r > 0) {
        children.push(
          line(0, y, w, y, { stroke: theme.borderLight }),
        );
      }
    }

    return group({}, ...children);
  },
};

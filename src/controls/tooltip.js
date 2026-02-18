import { group, rect, polygon, text } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'tooltip',
  category: 'display',
  defaultSize: [120, 32],
  properties: {
    position: { type: 'enum', values: ['top', 'bottom', 'left', 'right'], default: 'top' },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const position = node.properties?.position || 'top';
    const w = node.width;
    const h = node.height;
    const arrowSize = 6;
    const midX = w / 2;
    const midY = h / 2;

    const children = [
      // Dark tooltip body
      rect(0, 0, w, h, { fill: '#333', stroke: '#444', rx: 4 }),
      // Centered text
      text(node.label || '', w / 2, h / 2 + 4, {
        ...fontAttrs(theme, theme.sizeSmall),
        fill: '#fff',
        'text-anchor': 'middle',
      }),
    ];

    let arrowPoints;

    if (position === 'top') {
      // Arrow at bottom center (pointing down)
      arrowPoints = `${midX - arrowSize},${h} ${midX},${h + arrowSize} ${midX + arrowSize},${h}`;
    } else if (position === 'bottom') {
      // Arrow at top center (pointing up)
      arrowPoints = `${midX - arrowSize},0 ${midX},${-arrowSize} ${midX + arrowSize},0`;
    } else if (position === 'left') {
      // Arrow at right center (pointing right)
      arrowPoints = `${w},${midY - arrowSize} ${w + arrowSize},${midY} ${w},${midY + arrowSize}`;
    } else {
      // Arrow at left center (pointing left)
      arrowPoints = `0,${midY - arrowSize} ${-arrowSize},${midY} 0,${midY + arrowSize}`;
    }

    children.push(
      polygon(arrowPoints, { fill: '#333' }),
    );

    return group({}, ...children);
  },
};

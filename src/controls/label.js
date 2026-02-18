import { text } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

const sizeMap = {
  small: (theme) => theme.sizeSmall,
  normal: (theme) => theme.size,
  large: (theme) => theme.sizeLarge,
};

const anchorMap = {
  left: 'start',
  center: 'middle',
  right: 'end',
};

export default {
  type: 'label',
  category: 'text',
  defaultSize: [100, 20],
  properties: {
    'font-size': { type: 'enum', values: ['small', 'normal', 'large'], default: 'normal' },
    align: { type: 'enum', values: ['left', 'center', 'right'], default: 'left' },
    bold: { type: 'boolean', default: false },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const fs = node.properties['font-size'] || 'normal';
    const align = node.properties.align || 'left';
    const bold = node.properties.bold || false;

    const fontSize = (sizeMap[fs] || sizeMap.normal)(theme);
    const anchor = anchorMap[align] || 'start';

    let x = 0;
    if (align === 'center') x = node.width / 2;
    else if (align === 'right') x = node.width;

    const attrs = {
      ...fontAttrs(theme, fontSize),
      fill: theme.text,
      'text-anchor': anchor,
    };

    if (bold) {
      attrs['font-weight'] = 'bold';
    }

    return text(node.label || '', x, fontSize, attrs);
  },
};

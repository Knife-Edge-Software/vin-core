import { group, rect, text } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'button',
  category: 'input',
  defaultSize: [100, 34],
  properties: {
    variant: { type: 'enum', values: ['default', 'primary', 'danger'], default: 'default' },
    disabled: { type: 'boolean', default: false },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const variant = node.properties.variant || 'default';
    const disabled = node.properties.disabled || false;

    let fill, stroke, textColor;

    if (disabled) {
      fill = theme.disabledFill;
      stroke = theme.disabledStroke;
      textColor = theme.disabledText;
    } else if (variant === 'primary') {
      fill = theme.accent;
      stroke = theme.accentDark;
      textColor = theme.accentText;
    } else if (variant === 'danger') {
      fill = theme.danger;
      stroke = theme.dangerStroke;
      textColor = theme.dangerText;
    } else {
      fill = theme.bg;
      stroke = theme.border;
      textColor = theme.text;
    }

    const w = node.width;
    const h = node.height;

    return group({},
      rect(0, 0, w, h, { fill, stroke, rx: theme.radius }),
      text(node.label || '', w / 2, h / 2 + 5, {
        ...fontAttrs(theme),
        fill: textColor,
        'text-anchor': 'middle',
      }),
    );
  },
};

import { text } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'link',
  category: 'text',
  defaultSize: [80, 20],
  properties: {},
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    return text(node.label || '', 0, 14, {
      ...fontAttrs(theme),
      fill: theme.accent,
      'text-decoration': 'underline',
    });
  },
};

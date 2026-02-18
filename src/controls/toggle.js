import { group, rect, circle, text } from '../svg.js';

function fontAttrs(theme, size) {
  return { 'font-family': theme.font, 'font-size': size || theme.size };
}

export default {
  type: 'toggle',
  category: 'input',
  defaultSize: [140, 22],
  properties: {
    on: { type: 'boolean', default: false },
    checked: { type: 'boolean', default: false },
  },
  implicitLayout: null,
  contentOffset: null,

  render(node, theme) {
    const on = node.properties.on || false;
    const checked = node.properties.checked || false;
    const active = on || checked;

    const trackW = 36;
    const trackH = 18;
    const trackY = 1;
    const knobR = 7;

    const trackFill = active ? theme.accent : theme.borderLight;
    const knobCX = active ? trackW - knobR - 2 : knobR + 2;

    const children = [
      rect(0, trackY, trackW, trackH, {
        fill: trackFill,
        rx: trackH / 2,
      }),
      circle(knobCX, trackY + trackH / 2, knobR, {
        fill: theme.fill,
      }),
    ];

    if (node.label) {
      children.push(
        text(node.label, trackW + 8, 15, {
          ...fontAttrs(theme),
          fill: theme.text,
        }),
      );
    }

    return group({}, ...children);
  },
};

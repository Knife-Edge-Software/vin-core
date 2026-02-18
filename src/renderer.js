/**
 * Vin renderer — Stage 6.
 *
 * Converts a LayoutDocument (where every node has concrete x, y, width, height)
 * into an SvgNode tree.
 *
 * Pure function: LayoutDocument + Theme → SvgNode tree.
 * No mutation, no globals.
 */

import { el, rect, group, svg as svgRoot } from './svg.js';
import { getControl } from './registry.js';
import { defaultTheme } from './theme.js';

/**
 * Render a single page into an SvgNode tree.
 *
 * @param {import('./layout.js').LayoutPage} page
 * @param {import('./theme.js').defaultTheme} [theme]
 * @returns {{ svg: import('./svg.js').SvgNode, warnings: string[] }}
 */
export function render(page, theme) {
  const t = theme || defaultTheme;
  const warnings = [];

  const children = [
    // Page background
    rect(0, 0, page.width, page.height, { fill: '#fff', stroke: '#ccc', 'stroke-width': 1 }),
  ];

  // Render all controls
  for (const ctrl of page.controls) {
    const node = renderControl(ctrl, t, warnings);
    if (node) children.push(node);
  }

  const root = svgRoot(page.width, page.height, {}, ...children);
  return { svg: root, warnings };
}

/**
 * Render a single LayoutBox and its children recursively.
 * Returns an SvgNode (g element with translate transform).
 */
function renderControl(box, theme, warnings) {
  const def = getControl(box.type);

  if (!def) {
    warnings.push(`Unknown control: "${box.type}"`);
    return null;
  }

  const childNodes = [];

  // Render the control's own visual
  try {
    const visual = def.render(box, theme);
    if (visual) childNodes.push(visual);
  } catch (e) {
    warnings.push(`Error rendering ${box.type} "${box.label}": ${e.message}`);
    // Error placeholder
    childNodes.push(
      group({},
        rect(0, 0, box.width, box.height, { fill: '#fee', stroke: '#d94a4a', 'stroke-dasharray': '4,2' }),
        el('text', { x: 4, y: 14, 'font-size': 10, fill: '#d94a4a' }, `${box.type}: error`),
      )
    );
  }

  // Render children recursively
  for (const child of box.children) {
    const childNode = renderControl(child, theme, warnings);
    if (childNode) childNodes.push(childNode);
  }

  return group({ transform: `translate(${box.x}, ${box.y})` }, ...childNodes);
}

/**
 * Vin layout engine — Stage 5.
 *
 * Transforms a ResolvedDocument into a LayoutDocument where every node
 * has concrete x, y, width, height values.
 *
 * Pure function: does not mutate input. Returns new LayoutBox objects.
 *
 * Layout modes:
 *   - column: vertical stack
 *   - row: horizontal flow
 *   - wrap: horizontal flow with line wrapping
 *   - (none): children use their own x,y (absolute positioning)
 */

import { getControl } from './registry.js';

/**
 * @typedef {Object} LayoutBox
 * @property {string} type
 * @property {string} label
 * @property {string|null} id    - unique identifier (null when not specified)
 * @property {number} x          - guaranteed (0 if unspecified at top level)
 * @property {number} y
 * @property {number} width      - guaranteed
 * @property {number} height     - guaranteed
 * @property {Object} properties
 * @property {LayoutBox[]} children
 * @property {Object} span
 */

/**
 * @typedef {Object} LayoutPage
 * @property {string} title
 * @property {string|null} id    - unique identifier (null when not specified)
 * @property {number} width
 * @property {number} height
 * @property {Object} properties
 * @property {LayoutBox[]} controls
 * @property {Object} span
 */

/**
 * @typedef {Object} LayoutDocument
 * @property {LayoutPage[]} pages
 */

/**
 * Compute layout for a ResolvedDocument.
 *
 * @param {import('./resolver.js').ResolvedDocument} doc
 * @returns {LayoutDocument}
 */
export function computeLayout(doc) {
  return {
    pages: doc.pages.map(page => ({
      ...page,
      controls: page.controls.map(node => layoutNode(node)),
    })),
  };
}

/**
 * Create a LayoutBox from a ResolvedNode, recursively laying out children.
 */
function layoutNode(node) {
  const def = getControl(node.type);

  // Determine layout mode
  const layoutMode = def?.implicitLayout || node.properties.layout || null;

  // Determine content offset (for containers with title bars)
  let contentTop = 0;
  if (def?.contentOffset) {
    const offset = def.contentOffset(node);
    contentTop = offset.top || 0;
  }

  // Recursively resolve children first (to get their natural sizes)
  let children;
  if (node.children.length > 0 && layoutMode) {
    children = layoutChildren(node.children, layoutMode, node.width, node.height, node.properties, contentTop);
  } else {
    // No layout — children use their own positions (absolute) or defaults
    children = node.children.map(child => layoutNode(child));
  }

  return {
    type: node.type,
    label: node.label,
    id: node.id,
    x: node.x ?? 0,
    y: node.y ?? 0,
    width: node.width,
    height: node.height,
    properties: node.properties,
    children,
    span: node.span,
  };
}

/**
 * Layout children within a container.
 * Returns an array of LayoutBox with positions assigned.
 */
function layoutChildren(children, mode, containerW, containerH, props, contentTop) {
  const padding = props.padding || 0;
  const gap = (props.gap != null) ? props.gap : 8;
  const align = props.align || 'stretch';
  const justify = props.justify || 'start';

  // Clamp contentTop so inner dimensions stay non-negative
  if (containerH - contentTop - padding * 2 < 0) {
    contentTop = Math.max(0, containerH - padding * 2);
  }

  const innerW = Math.max(0, containerW - padding * 2);
  const innerH = Math.max(0, containerH - contentTop - padding * 2);

  // Separate absolute vs flow children
  const absoluteChildren = [];
  const flowChildren = [];
  for (const child of children) {
    if (child.hasPosition) {
      absoluteChildren.push(child);
    } else {
      flowChildren.push(child);
    }
  }

  // Layout flow children
  let laidOutFlow;
  if (flowChildren.length === 0) {
    laidOutFlow = [];
  } else if (mode === 'column') {
    laidOutFlow = layoutAxis(flowChildren, 'column', padding, contentTop + padding, gap, innerW, innerH, align, justify);
  } else if (mode === 'row') {
    laidOutFlow = layoutAxis(flowChildren, 'row', padding, contentTop + padding, gap, innerW, innerH, align, justify);
  } else if (mode === 'wrap') {
    laidOutFlow = layoutWrap(flowChildren, padding, contentTop + padding, gap, innerW, innerH, align);
  } else {
    laidOutFlow = flowChildren.map(child => layoutNode(child));
  }

  // Absolute children: just recurse (preserve their positions)
  const laidOutAbsolute = absoluteChildren.map(child => layoutNode(child));

  // Merge back in original order
  const result = [];
  let flowIdx = 0;
  let absIdx = 0;
  for (const child of children) {
    if (child.hasPosition) {
      result.push(laidOutAbsolute[absIdx++]);
    } else {
      result.push(laidOutFlow[flowIdx++]);
    }
  }

  return result;
}

/**
 * Lay out children along a single axis (column = vertical, row = horizontal).
 * Returns new LayoutBox objects with positions assigned.
 */
function layoutAxis(flow, axis, padX, padY, gap, innerW, innerH, align, justify) {
  const isCol = (axis === 'column');
  const mainSize = isCol ? innerH : innerW;
  const crossSize = isCol ? innerW : innerH;

  // Resolve sizes for each child
  const items = flow.map(child => {
    let w, h;
    if (isCol) {
      w = child.width ?? (align === 'stretch' ? innerW : child.width);
      h = child.height;
    } else {
      w = child.width;
      h = child.height ?? (align === 'stretch' ? innerH : child.height);
    }
    // Apply stretch for explicit width/height that match defaults
    if (isCol && align === 'stretch' && child.width != null) {
      // In column mode, stretch sets width to container width
      // unless child has an explicit width that differs from default
      w = child.width;
    }
    if (!isCol && align === 'stretch' && child.height != null) {
      h = child.height;
    }

    const flex = child.properties.flex || 0;
    return { child, w, h, flex };
  });

  // Calculate total fixed size + gaps along main axis
  const totalGaps = (items.length - 1) * gap;
  let totalFixed = 0;
  let totalFlex = 0;
  for (const item of items) {
    if (item.flex > 0) {
      totalFlex += item.flex;
    } else {
      totalFixed += isCol ? item.h : item.w;
    }
  }

  // Distribute remaining space to flex items
  const remaining = Math.max(0, mainSize - totalFixed - totalGaps);
  if (totalFlex > 0) {
    for (const item of items) {
      if (item.flex > 0) {
        const flexSize = (item.flex / totalFlex) * remaining;
        if (isCol) item.h = flexSize;
        else item.w = flexSize;
      }
    }
  }

  // Calculate total content length for justify
  let totalContent = totalGaps;
  for (const item of items) {
    totalContent += isCol ? item.h : item.w;
  }

  // Starting position along main axis
  const mainStart = isCol ? padY : padX;
  const crossStart = isCol ? padX : padY;
  let mainPos;
  let extraGap = 0;
  if (justify === 'center') {
    mainPos = mainStart + (mainSize - totalContent) / 2;
  } else if (justify === 'end') {
    mainPos = mainStart + mainSize - totalContent;
  } else if (justify === 'space-between' && items.length > 1) {
    mainPos = mainStart;
    extraGap = (mainSize - totalContent + totalGaps) / (items.length - 1) - gap;
  } else {
    mainPos = mainStart;
  }
  // Clamp: don't start before the padding boundary
  mainPos = Math.max(mainPos, mainStart);

  // Build LayoutBoxes
  const result = [];
  for (const item of items) {
    const selfAlign = item.child.properties['align-self'] || align;

    let crossPos;
    const itemCross = isCol ? item.w : item.h;
    if (selfAlign === 'center') {
      crossPos = crossStart + (crossSize - itemCross) / 2;
    } else if (selfAlign === 'end') {
      crossPos = crossStart + crossSize - itemCross;
    } else {
      crossPos = crossStart;
    }
    // Clamp: don't position before the padding boundary
    crossPos = Math.max(crossPos, crossStart);

    const x = isCol ? crossPos : mainPos;
    const y = isCol ? mainPos : crossPos;
    const w = item.w;
    const h = item.h;

    // Recursively layout this child's own children
    const childNode = { ...item.child, x, y, width: w, height: h };
    result.push(layoutNode(childNode));

    mainPos += (isCol ? h : w) + gap + extraGap;
  }

  return result;
}

/**
 * Wrap layout: flow left-to-right, wrapping to next row when full.
 * Returns new LayoutBox objects.
 */
function layoutWrap(flow, padX, padY, gap, innerW, innerH, align) {
  let curX = padX;
  let curY = padY;
  let rowHeight = 0;

  const result = [];
  for (const child of flow) {
    const w = child.width;
    const h = child.height;

    // Wrap to next line if this child exceeds the row
    if (curX + w > padX + innerW && curX > padX) {
      curX = padX;
      curY += rowHeight + gap;
      rowHeight = 0;
    }

    const childNode = { ...child, x: curX, y: curY, width: w, height: h };
    result.push(layoutNode(childNode));

    curX += w + gap;
    rowHeight = Math.max(rowHeight, h);
  }

  return result;
}

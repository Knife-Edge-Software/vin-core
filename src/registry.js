/**
 * Vin control registry.
 *
 * Controls register themselves with schema-driven definitions.
 * The registry is the single source of truth for:
 *  - Which control types exist
 *  - Their default sizes
 *  - Their property schemas (types, defaults, allowed values)
 *  - Their implicit layout mode
 *  - Their content offset
 *  - Their render function
 */

/** @type {Map<string, ControlDefinition>} */
const registry = new Map();

/**
 * @typedef {Object} PropertySchema
 * @property {'string'|'boolean'|'number'|'enum'|'list'} type
 * @property {*} [default]
 * @property {string[]} [values] - For enum type: allowed values
 */

/**
 * @typedef {Object} ControlDefinition
 * @property {string} type
 * @property {string} category
 * @property {[number, number]} defaultSize - [width, height]
 * @property {Object<string, PropertySchema>} properties
 * @property {string|null} implicitLayout - 'row'|'column'|null
 * @property {((node: Object) => {top: number})|null} contentOffset
 * @property {(node: Object, theme: Object) => import('./svg.js').SvgNode} render
 */

/**
 * Register a control definition.
 * @param {ControlDefinition} def
 */
export function registerControl(def) {
  if (registry.has(def.type)) {
    throw new Error(`Control "${def.type}" is already registered`);
  }
  registry.set(def.type, def);
}

/**
 * Get a control definition by type name.
 * @param {string} type
 * @returns {ControlDefinition|undefined}
 */
export function getControl(type) {
  return registry.get(type);
}

/**
 * Check if a control type is registered.
 * @param {string} type
 * @returns {boolean}
 */
export function hasControl(type) {
  return registry.has(type);
}

/**
 * Get all registered control type names.
 * @returns {string[]}
 */
export function getControlTypes() {
  return [...registry.keys()];
}

/**
 * Get all registered control definitions.
 * @returns {ControlDefinition[]}
 */
export function getAllControls() {
  return [...registry.values()];
}

/**
 * Clear the registry (for testing).
 */
export function clearRegistry() {
  registry.clear();
}

import { group } from '../svg.js';

export default {
  type: 'row',
  category: 'layout',
  defaultSize: [300, 40],
  properties: {},
  implicitLayout: 'row',
  contentOffset: null,

  render(node, theme) {
    return group({});
  },
};

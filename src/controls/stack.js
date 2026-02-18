import { group } from '../svg.js';

export default {
  type: 'stack',
  category: 'layout',
  defaultSize: [300, 200],
  properties: {},
  implicitLayout: 'column',
  contentOffset: null,

  render(node, theme) {
    return group({});
  },
};

/**
 * Registers all built-in Vin controls.
 *
 * Import this module once at startup to populate the registry.
 */

import { registerControl } from '../registry.js';

// Text
import label from './label.js';
import heading from './heading.js';
import link from './link.js';

// Inputs
import button from './button.js';
import textfield from './textfield.js';
import textarea from './textarea.js';
import checkbox from './checkbox.js';
import radio from './radio.js';
import dropdown from './dropdown.js';
import toggle from './toggle.js';
import slider from './slider.js';

// Layout
import row from './row.js';
import column from './column.js';
import stack from './stack.js';
import frame from './frame.js';
import panel from './panel.js';
import card from './card.js';
import separator from './separator.js';
import image from './image.js';
import splitter from './splitter.js';
import modal from './modal.js';

// Data
import list from './list.js';
import table from './table.js';

// Indicators
import progress from './progress.js';
import badge from './badge.js';
import icon from './icon.js';

// Display
import tabs from './tabs.js';
import avatar from './avatar.js';
import breadcrumb from './breadcrumb.js';
import tooltip from './tooltip.js';
import menu from './menu.js';
import chip from './chip.js';
import toast from './toast.js';

// Additional inputs
import searchfield from './searchfield.js';

// Additional layout
import navbar from './navbar.js';
import sidebar from './sidebar.js';
import divider from './divider.js';

// Additional indicators
import stepper from './stepper.js';
import skeleton from './skeleton.js';

const allControls = [
  label, heading, link,
  button, textfield, textarea, checkbox, radio, dropdown, toggle, slider,
  searchfield,
  row, column, stack, frame, panel, card, separator, image, splitter, modal,
  navbar, sidebar, divider,
  list, table,
  progress, badge, icon,
  stepper, skeleton,
  tabs, avatar, breadcrumb, tooltip,
  menu, chip, toast,
];

for (const def of allControls) {
  registerControl(def);
}

/**
 * Vin control definitions
 * Each control defines a defaultSize and a render(control) function
 * that returns an SVG fragment string.
 *
 * The control object passed to render() has:
 *   type, label, x, y, width, height, properties
 * Width and height are guaranteed (defaults applied by renderer).
 */

import { icons } from './icons.js';

// Common aliases so wireframe authors can use intuitive short names
const iconAliases = {
  'home': 'house',
  'edit': 'square-pen',
  'unlock': 'lock-open',
  'close': 'x',
  'add': 'plus',
  'remove': 'minus',
  'delete': 'trash-2',
  'back': 'arrow-left',
  'forward': 'arrow-right',
  'up': 'arrow-up',
  'down': 'arrow-down',
  'dropdown': 'chevron-down',
  'expand': 'chevron-right',
  'collapse': 'chevron-down',
  'more': 'ellipsis',
  'dots': 'ellipsis',
  'options': 'ellipsis-vertical',
  'profile': 'user',
  'account': 'circle-user',
  'email': 'mail',
  'send': 'send',
  'attach': 'paperclip',
  'photo': 'image',
  'video': 'video',
  'audio': 'volume-2',
  'mute': 'volume-x',
  'play': 'play',
  'pause': 'pause',
  'stop': 'square',
  'next': 'skip-forward',
  'prev': 'skip-back',
  'like': 'heart',
  'favorite': 'star',
  'bookmark': 'bookmark',
  'tag': 'tag',
  'filter': 'filter',
  'sort': 'arrow-up-down',
  'refresh': 'rotate-cw',
  'sync': 'refresh-cw',
  'save': 'save',
  'copy': 'copy',
  'paste': 'clipboard',
  'cut': 'scissors',
  'undo': 'undo-2',
  'redo': 'redo-2',
  'zoom-in': 'zoom-in',
  'zoom-out': 'zoom-out',
  'fullscreen': 'maximize-2',
  'minimize': 'minimize-2',
  'pin': 'pin',
  'location': 'map-pin',
  'time': 'clock',
  'date': 'calendar',
  'notification': 'bell',
  'warning': 'triangle-alert',
  'error': 'circle-x',
  'success': 'circle-check',
  'info': 'info',
  'help': 'circle-help',
  'gear': 'settings',
  'config': 'sliders-horizontal',
  'dashboard': 'layout-dashboard',
  'list': 'list',
  'grid': 'grid-3x3',
  'table': 'table',
  'chart': 'chart-bar',
  'graph': 'chart-line',
  'pie': 'chart-pie',
  'code': 'code',
  'terminal': 'terminal',
  'bug': 'bug',
  'wifi': 'wifi',
  'bluetooth': 'bluetooth',
  'battery': 'battery',
  'power': 'power',
  'logout': 'log-out',
  'login': 'log-in',
  'signup': 'user-plus',
  'cart': 'shopping-cart',
  'bag': 'shopping-bag',
  'payment': 'credit-card',
  'receipt': 'receipt',
  'print': 'printer',
  'export': 'external-link',
  'import': 'import',
  'cloud': 'cloud',
  'database': 'database',
  'server': 'server',
  'key': 'key',
  'shield': 'shield',
  'flag': 'flag',
  'thumbs-up': 'thumbs-up',
  'thumbs-down': 'thumbs-down',
  'comment': 'message-circle',
  'chat': 'message-square',
  'reply': 'reply',
  'repost': 'repeat',
  'people': 'users',
  'team': 'users',
  'org': 'building-2',
  'company': 'building-2',
  'document': 'file-text',
  'spreadsheet': 'sheet',
  'presentation': 'projector',
  'music': 'music',
  'mic': 'mic',
  'speaker': 'volume-2',
  'headphones': 'headphones',
  'monitor': 'monitor',
  'mobile': 'smartphone',
  'tablet': 'tablet',
  'watch': 'watch',
  'lightbulb': 'lightbulb',
  'idea': 'lightbulb',
  'rocket': 'rocket',
  'sparkle': 'sparkles',
  'magic': 'wand-sparkles',
  'ai': 'brain',
  'robot': 'bot',
};

function resolveIcon(name) {
  return icons[name] || icons[iconAliases[name]] || null;
}

const S = {
  font: "-apple-system, 'Segoe UI', Roboto, sans-serif",
  size: 13,
  sizeSmall: 11,
  sizeLarge: 18,
  border: '#a0a0a0',
  borderLight: '#d0d0d0',
  fill: '#ffffff',
  bg: '#f5f5f5',
  text: '#333333',
  textMuted: '#888888',
  placeholder: '#aaaaaa',
  accent: '#4a90d9',
  accentDark: '#3a7bc8',
  accentText: '#ffffff',
  danger: '#d94a4a',
  dangerText: '#ffffff',
  selection: '#e3f0ff',
  radius: 4,
};

function font(size = S.size) {
  return `font-family="${S.font}" font-size="${size}"`;
}

function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const controls = {

  // --- Text ---

  label: {
    defaultSize: [100, 20],
    render(c) {
      const size = c.properties['font-size'] === 'large' ? S.sizeLarge
                 : c.properties['font-size'] === 'small' ? S.sizeSmall
                 : S.size;
      const weight = c.properties.bold ? ' font-weight="bold"' : '';
      const anchor = c.properties.align === 'center' ? 'middle'
                   : c.properties.align === 'right' ? 'end' : 'start';
      const x = c.properties.align === 'center' ? c.width / 2
              : c.properties.align === 'right' ? c.width : 0;
      return `<text x="${x}" y="${size}" ${font(size)} fill="${S.text}" text-anchor="${anchor}"${weight}>${esc(c.label)}</text>`;
    },
  },

  heading: {
    defaultSize: [200, 32],
    render(c) {
      const level = c.properties.level || 1;
      const size = level === 1 ? 24 : level === 2 ? 20 : 16;
      return `<text x="0" y="${size}" ${font(size)} font-weight="bold" fill="${S.text}">${esc(c.label)}</text>`;
    },
  },

  link: {
    defaultSize: [80, 20],
    render(c) {
      return `<text x="0" y="14" ${font()} fill="${S.accent}" text-decoration="underline">${esc(c.label)}</text>`;
    },
  },

  // --- Inputs ---

  button: {
    defaultSize: [100, 34],
    render(c) {
      const v = c.properties.variant || 'default';
      const disabled = c.properties.disabled;
      let fill, stroke, textColor;
      if (disabled) {
        fill = '#e0e0e0'; stroke = '#c0c0c0'; textColor = '#999';
      } else if (v === 'primary') {
        fill = S.accent; stroke = S.accentDark; textColor = S.accentText;
      } else if (v === 'danger') {
        fill = S.danger; stroke = '#b33a3a'; textColor = S.dangerText;
      } else {
        fill = S.bg; stroke = S.border; textColor = S.text;
      }
      return `<rect width="${c.width}" height="${c.height}" rx="${S.radius}" fill="${fill}" stroke="${stroke}"/>` +
             `<text x="${c.width / 2}" y="${c.height / 2 + 5}" text-anchor="middle" ${font()} fill="${textColor}">${esc(c.label)}</text>`;
    },
  },

  textfield: {
    defaultSize: [200, 32],
    render(c) {
      const placeholder = c.properties.placeholder || c.label;
      const value = c.properties.value;
      const mask = c.properties.mask;
      const display = value ? (mask ? '\u2022'.repeat(value.length) : value) : placeholder;
      const color = value ? S.text : S.placeholder;
      return `<rect width="${c.width}" height="${c.height}" rx="${S.radius}" fill="${S.fill}" stroke="${S.borderLight}"/>` +
             `<text x="8" y="${c.height / 2 + 5}" ${font()} fill="${color}">${esc(display)}</text>`;
    },
  },

  textarea: {
    defaultSize: [200, 80],
    render(c) {
      const placeholder = c.properties.placeholder || c.label;
      let svg = `<rect width="${c.width}" height="${c.height}" rx="${S.radius}" fill="${S.fill}" stroke="${S.borderLight}"/>`;
      svg += `<text x="8" y="20" ${font()} fill="${S.placeholder}">${esc(placeholder)}</text>`;
      for (let y = 34; y < c.height - 8; y += 18) {
        svg += `<line x1="8" y1="${y}" x2="${c.width - 8}" y2="${y}" stroke="#eee"/>`;
      }
      return svg;
    },
  },

  checkbox: {
    defaultSize: [120, 20],
    render(c) {
      let svg = `<rect x="0" y="2" width="14" height="14" rx="2" fill="${S.fill}" stroke="${S.border}"/>`;
      if (c.properties.checked) {
        svg += `<polyline points="3,9 6,13 11,4" fill="none" stroke="${S.accent}" stroke-width="2"/>`;
      }
      svg += `<text x="20" y="14" ${font()} fill="${S.text}">${esc(c.label)}</text>`;
      return svg;
    },
  },

  radio: {
    defaultSize: [120, 20],
    render(c) {
      let svg = `<circle cx="8" cy="9" r="7" fill="${S.fill}" stroke="${S.border}"/>`;
      if (c.properties.selected) {
        svg += `<circle cx="8" cy="9" r="4" fill="${S.accent}"/>`;
      }
      svg += `<text x="22" y="14" ${font()} fill="${S.text}">${esc(c.label)}</text>`;
      return svg;
    },
  },

  dropdown: {
    defaultSize: [200, 32],
    render(c) {
      const items = c.properties.items;
      const selected = c.properties.selected;
      const placeholder = c.properties.placeholder || c.label;
      const display = (selected != null && items) ? (items[selected] || placeholder) : placeholder;
      const chevronX = c.width - 20;
      const midY = c.height / 2;
      return `<rect width="${c.width}" height="${c.height}" rx="${S.radius}" fill="${S.fill}" stroke="${S.borderLight}"/>` +
             `<text x="8" y="${midY + 5}" ${font()} fill="${S.text}">${esc(display)}</text>` +
             `<polyline points="${chevronX},${midY - 3} ${chevronX + 6},${midY + 3} ${chevronX + 12},${midY - 3}" fill="none" stroke="${S.border}" stroke-width="1.5"/>`;
    },
  },

  // --- Layout ---

  row: {
    defaultSize: [300, 40],
    implicitLayout: 'row',
    render() { return ''; },
  },

  column: {
    defaultSize: [300, 200],
    implicitLayout: 'column',
    render() { return ''; },
  },

  stack: {
    defaultSize: [300, 200],
    implicitLayout: 'column',
    render() { return ''; },
  },

  frame: {
    defaultSize: [300, 200],
    contentOffset(c) { return { top: c.label ? 16 : 0 }; },
    render(c) {
      const titleWidth = c.label ? c.label.length * 7.5 + 16 : 0;
      let svg = `<rect x="0" y="8" width="${c.width}" height="${c.height - 8}" rx="${S.radius}" fill="none" stroke="${S.border}"/>`;
      if (c.label) {
        svg += `<rect x="8" y="0" width="${titleWidth}" height="16" fill="${S.fill}"/>`;
        svg += `<text x="16" y="13" ${font(S.sizeSmall)} fill="${S.textMuted}">${esc(c.label)}</text>`;
      }
      return svg;
    },
  },

  separator: {
    defaultSize: [200, 2],
    render(c) {
      if (c.properties.direction === 'vertical') {
        return `<line x1="1" y1="0" x2="1" y2="${c.height}" stroke="${S.borderLight}" stroke-width="1"/>`;
      }
      return `<line x1="0" y1="1" x2="${c.width}" y2="1" stroke="${S.borderLight}" stroke-width="1"/>`;
    },
  },

  image: {
    defaultSize: [150, 100],
    render(c) {
      const alt = c.properties.alt || c.label || 'Image';
      return `<rect width="${c.width}" height="${c.height}" fill="${S.bg}" stroke="${S.borderLight}" rx="${S.radius}"/>` +
             `<line x1="0" y1="0" x2="${c.width}" y2="${c.height}" stroke="${S.borderLight}"/>` +
             `<line x1="${c.width}" y1="0" x2="0" y2="${c.height}" stroke="${S.borderLight}"/>` +
             `<text x="${c.width / 2}" y="${c.height / 2 + 5}" text-anchor="middle" ${font(S.sizeSmall)} fill="${S.placeholder}">${esc(alt)}</text>`;
    },
  },

  // --- Data ---

  list: {
    defaultSize: [200, 120],
    render(c) {
      const items = c.properties.items || [];
      const selectedIdx = c.properties.selected;
      const numbered = c.properties.numbered;
      const rowHeight = 24;

      let svg = `<rect width="${c.width}" height="${c.height}" rx="${S.radius}" fill="${S.fill}" stroke="${S.borderLight}"/>`;

      items.forEach((item, i) => {
        const y = i * rowHeight;
        if (y + rowHeight > c.height) return;

        if (i === selectedIdx) {
          svg += `<rect x="1" y="${y + 1}" width="${c.width - 2}" height="${rowHeight}" fill="${S.selection}" rx="2"/>`;
        }
        const prefix = numbered ? `${i + 1}. ` : '\u2022 ';
        svg += `<text x="10" y="${y + 16}" ${font()} fill="${S.text}">${esc(prefix + item)}</text>`;
      });

      return svg;
    },
  },

  table: {
    defaultSize: [300, 150],
    render(c) {
      const columns = c.properties.columns || [];
      const rows = c.properties.rows || 3;
      const headerHeight = 28;
      const rowHeight = 24;
      const colCount = columns.length || 1;
      const colWidth = c.width / colCount;

      let svg = `<rect width="${c.width}" height="${c.height}" fill="${S.fill}" stroke="${S.borderLight}"/>`;

      // Header background
      svg += `<rect width="${c.width}" height="${headerHeight}" fill="${S.bg}"/>`;
      svg += `<line x1="0" y1="${headerHeight}" x2="${c.width}" y2="${headerHeight}" stroke="${S.borderLight}"/>`;

      // Column headers and vertical dividers
      columns.forEach((col, i) => {
        const x = i * colWidth;
        svg += `<text x="${x + 8}" y="18" ${font(S.sizeSmall)} font-weight="bold" fill="${S.text}">${esc(col)}</text>`;
        if (i > 0) {
          svg += `<line x1="${x}" y1="0" x2="${x}" y2="${c.height}" stroke="${S.borderLight}"/>`;
        }
      });

      // Row dividers
      for (let r = 1; r <= rows; r++) {
        const y = headerHeight + r * rowHeight;
        if (y >= c.height) break;
        svg += `<line x1="0" y1="${y}" x2="${c.width}" y2="${y}" stroke="${S.borderLight}"/>`;
      }

      return svg;
    },
  },

  // --- Indicators ---

  progress: {
    defaultSize: [200, 8],
    render(c) {
      const pct = Math.max(0, Math.min(100, c.properties.value || 0));
      const fillWidth = (pct / 100) * c.width;
      return `<rect width="${c.width}" height="${c.height}" rx="${c.height / 2}" fill="${S.bg}" stroke="${S.borderLight}"/>` +
             `<rect width="${fillWidth}" height="${c.height}" rx="${c.height / 2}" fill="${S.accent}"/>`;
    },
  },

  badge: {
    defaultSize: [60, 22],
    render(c) {
      const variant = c.properties.variant || 'default';
      let fill, textColor;
      if (variant === 'success') { fill = '#4caf50'; textColor = '#fff'; }
      else if (variant === 'warning') { fill = '#ff9800'; textColor = '#fff'; }
      else if (variant === 'error') { fill = S.danger; textColor = '#fff'; }
      else if (variant === 'info') { fill = S.accent; textColor = '#fff'; }
      else { fill = S.bg; textColor = S.text; }
      return `<rect width="${c.width}" height="${c.height}" rx="${c.height / 2}" fill="${fill}"/>` +
             `<text x="${c.width / 2}" y="${c.height / 2 + 4}" text-anchor="middle" ${font(S.sizeSmall)} fill="${textColor}">${esc(c.label)}</text>`;
    },
  },

  icon: {
    defaultSize: [24, 24],
    render(c) {
      const name = c.label || c.properties.name || '?';
      const iconSvg = resolveIcon(name);
      if (iconSvg) {
        const scale = Math.min(c.width, c.height) / 24;
        const color = c.properties.color || S.textMuted;
        return `<g transform="scale(${scale})" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</g>`;
      }
      // Fallback: dashed placeholder for unknown icon names
      return `<rect width="${c.width}" height="${c.height}" rx="2" fill="none" stroke="${S.borderLight}" stroke-dasharray="3,2"/>` +
             `<text x="${c.width / 2}" y="${c.height / 2 + 4}" text-anchor="middle" ${font(S.sizeSmall)} fill="${S.textMuted}">${esc(name)}</text>`;
    },
  },

  // --- Layout (extended) ---

  panel: {
    defaultSize: [300, 200],
    contentOffset(c) { return { top: c.label ? 28 : 0 }; },
    render(c) {
      const variant = c.properties.variant || 'default';
      let fill, stroke;
      if (variant === 'dark') { fill = '#2a2a2a'; stroke = '#444'; }
      else if (variant === 'accent') { fill = '#e8f0fe'; stroke = S.accentDark; }
      else { fill = S.bg; stroke = S.borderLight; }
      let svg = `<rect width="${c.width}" height="${c.height}" rx="${S.radius}" fill="${fill}" stroke="${stroke}"/>`;
      if (c.label) {
        svg += `<text x="12" y="20" ${font(S.sizeSmall)} font-weight="bold" fill="${variant === 'dark' ? '#ccc' : S.text}">${esc(c.label)}</text>`;
      }
      return svg;
    },
  },

  card: {
    defaultSize: [280, 180],
    contentOffset(c) { return { top: c.label ? 32 : 0 }; },
    render(c) {
      const elevated = c.properties.elevated !== false;
      let svg = '';
      if (elevated) {
        svg += `<rect x="2" y="3" width="${c.width}" height="${c.height}" rx="6" fill="#00000018"/>`;
      }
      svg += `<rect width="${c.width}" height="${c.height}" rx="6" fill="${S.fill}" stroke="${S.borderLight}"/>`;
      if (c.label) {
        svg += `<text x="16" y="24" ${font()} font-weight="bold" fill="${S.text}">${esc(c.label)}</text>`;
      }
      return svg;
    },
  },

  splitter: {
    defaultSize: [200, 8],
    render(c) {
      const vertical = c.properties.direction === 'vertical';
      if (vertical) {
        const midX = c.width / 2;
        const midY = c.height / 2;
        let svg = `<line x1="${midX}" y1="0" x2="${midX}" y2="${c.height}" stroke="${S.borderLight}" stroke-width="1"/>`;
        svg += `<rect x="${midX - 8}" y="${midY - 12}" width="16" height="24" rx="3" fill="${S.bg}" stroke="${S.border}"/>`;
        svg += `<line x1="${midX - 3}" y1="${midY - 4}" x2="${midX + 3}" y2="${midY - 4}" stroke="${S.border}" stroke-width="1"/>`;
        svg += `<line x1="${midX - 3}" y1="${midY}" x2="${midX + 3}" y2="${midY}" stroke="${S.border}" stroke-width="1"/>`;
        svg += `<line x1="${midX - 3}" y1="${midY + 4}" x2="${midX + 3}" y2="${midY + 4}" stroke="${S.border}" stroke-width="1"/>`;
        return svg;
      }
      const midX = c.width / 2;
      const midY = c.height / 2;
      let svg = `<line x1="0" y1="${midY}" x2="${c.width}" y2="${midY}" stroke="${S.borderLight}" stroke-width="1"/>`;
      svg += `<rect x="${midX - 12}" y="${midY - 8}" width="24" height="16" rx="3" fill="${S.bg}" stroke="${S.border}"/>`;
      svg += `<line x1="${midX - 4}" y1="${midY - 3}" x2="${midX - 4}" y2="${midY + 3}" stroke="${S.border}" stroke-width="1"/>`;
      svg += `<line x1="${midX}" y1="${midY - 3}" x2="${midX}" y2="${midY + 3}" stroke="${S.border}" stroke-width="1"/>`;
      svg += `<line x1="${midX + 4}" y1="${midY - 3}" x2="${midX + 4}" y2="${midY + 3}" stroke="${S.border}" stroke-width="1"/>`;
      return svg;
    },
  },

  modal: {
    defaultSize: [400, 250],
    render(c) {
      let svg = `<rect width="${c.width}" height="${c.height}" fill="#00000066" rx="${S.radius}"/>`;
      const inset = 40;
      const dw = c.width - inset * 2;
      const dh = c.height - inset * 2;
      svg += `<rect x="${inset}" y="${inset}" width="${dw}" height="${dh}" rx="8" fill="${S.fill}" stroke="${S.borderLight}"/>`;
      svg += `<rect x="${inset}" y="${inset}" width="${dw}" height="36" rx="8" fill="${S.bg}"/>`;
      svg += `<rect x="${inset}" y="${inset + 28}" width="${dw}" height="8" fill="${S.bg}"/>`;
      svg += `<line x1="${inset}" y1="${inset + 36}" x2="${inset + dw}" y2="${inset + 36}" stroke="${S.borderLight}"/>`;
      if (c.label) {
        svg += `<text x="${inset + 12}" y="${inset + 24}" ${font()} font-weight="bold" fill="${S.text}">${esc(c.label)}</text>`;
      }
      const closeX = inset + dw - 24;
      svg += `<line x1="${closeX}" y1="${inset + 12}" x2="${closeX + 12}" y2="${inset + 24}" stroke="${S.textMuted}" stroke-width="1.5"/>`;
      svg += `<line x1="${closeX + 12}" y1="${inset + 12}" x2="${closeX}" y2="${inset + 24}" stroke="${S.textMuted}" stroke-width="1.5"/>`;
      return svg;
    },
  },

  // --- Inputs (extended) ---

  toggle: {
    defaultSize: [140, 22],
    render(c) {
      const on = c.properties.on || c.properties.checked;
      const trackW = 36;
      const trackH = 18;
      const trackY = 1;
      const knobR = 7;
      const trackFill = on ? S.accent : S.borderLight;
      const knobCX = on ? trackW - knobR - 2 : knobR + 2;
      let svg = `<rect width="${trackW}" height="${trackH}" y="${trackY}" rx="${trackH / 2}" fill="${trackFill}"/>`;
      svg += `<circle cx="${knobCX}" cy="${trackY + trackH / 2}" r="${knobR}" fill="${S.fill}"/>`;
      if (c.label) {
        svg += `<text x="${trackW + 8}" y="15" ${font()} fill="${S.text}">${esc(c.label)}</text>`;
      }
      return svg;
    },
  },

  slider: {
    defaultSize: [200, 20],
    render(c) {
      const pct = Math.max(0, Math.min(100, c.properties.value || 50));
      const trackY = c.height / 2;
      const trackH = 4;
      const thumbX = (pct / 100) * c.width;
      const thumbR = 8;
      let svg = `<rect x="0" y="${trackY - trackH / 2}" width="${c.width}" height="${trackH}" rx="${trackH / 2}" fill="${S.borderLight}"/>`;
      svg += `<rect x="0" y="${trackY - trackH / 2}" width="${thumbX}" height="${trackH}" rx="${trackH / 2}" fill="${S.accent}"/>`;
      svg += `<circle cx="${thumbX}" cy="${trackY}" r="${thumbR}" fill="${S.fill}" stroke="${S.accent}" stroke-width="2"/>`;
      if (c.label) {
        svg += `<text x="${c.width + 10}" y="${trackY + 4}" ${font(S.sizeSmall)} fill="${S.textMuted}">${esc(c.label)}</text>`;
      }
      return svg;
    },
  },

  tabs: {
    defaultSize: [300, 34],
    render(c) {
      const items = c.properties.items || [];
      const active = c.properties.active || 0;
      const tabCount = items.length || 1;
      const tabWidth = c.width / tabCount;
      let svg = `<rect width="${c.width}" height="${c.height}" fill="${S.bg}"/>`;
      svg += `<line x1="0" y1="${c.height - 1}" x2="${c.width}" y2="${c.height - 1}" stroke="${S.borderLight}"/>`;
      items.forEach((item, i) => {
        const tx = i * tabWidth;
        const isActive = (i === active);
        const textColor = isActive ? S.accent : S.textMuted;
        const weight = isActive ? ' font-weight="bold"' : '';
        svg += `<text x="${tx + tabWidth / 2}" y="${c.height / 2 + 5}" text-anchor="middle" ${font()} fill="${textColor}"${weight}>${esc(item)}</text>`;
        if (isActive) {
          svg += `<rect x="${tx}" y="${c.height - 3}" width="${tabWidth}" height="3" fill="${S.accent}"/>`;
        }
      });
      return svg;
    },
  },

  // --- Display (extended) ---

  avatar: {
    defaultSize: [40, 40],
    render(c) {
      const r = Math.min(c.width, c.height) / 2;
      const cx = r;
      const cy = r;
      const initials = c.label || '?';
      const variant = c.properties.variant || 'default';
      let fill;
      if (variant === 'blue') fill = '#4a90d9';
      else if (variant === 'green') fill = '#4caf50';
      else if (variant === 'orange') fill = '#ff9800';
      else if (variant === 'red') fill = '#d94a4a';
      else if (variant === 'purple') fill = '#9c27b0';
      else fill = S.border;
      let svg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;
      const fontSize = r * 0.8;
      svg += `<text x="${cx}" y="${cy + fontSize * 0.35}" text-anchor="middle" ${font(fontSize)} fill="#fff">${esc(initials)}</text>`;
      if (c.properties.status) {
        const dotR = r * 0.25;
        const dotColor = c.properties.status === 'online' ? '#4caf50'
                       : c.properties.status === 'busy' ? '#d94a4a'
                       : c.properties.status === 'away' ? '#ff9800' : S.border;
        svg += `<circle cx="${cx + r * 0.7}" cy="${cy + r * 0.7}" r="${dotR}" fill="${dotColor}" stroke="${S.fill}" stroke-width="2"/>`;
      }
      return svg;
    },
  },

  breadcrumb: {
    defaultSize: [300, 20],
    render(c) {
      const items = c.properties.items || [];
      let svg = '';
      let x = 0;
      items.forEach((item, i) => {
        const isLast = (i === items.length - 1);
        const color = isLast ? S.text : S.accent;
        const decoration = isLast ? '' : ' text-decoration="underline"';
        svg += `<text x="${x}" y="14" ${font(S.sizeSmall)} fill="${color}"${decoration}>${esc(item)}</text>`;
        x += item.length * 7 + 4;
        if (!isLast) {
          svg += `<text x="${x}" y="14" ${font(S.sizeSmall)} fill="${S.textMuted}">/</text>`;
          x += 12;
        }
      });
      return svg;
    },
  },

  tooltip: {
    defaultSize: [120, 32],
    render(c) {
      const pos = c.properties.position || 'top';
      const arrowSize = 6;
      let svg = `<rect width="${c.width}" height="${c.height}" rx="4" fill="#333" stroke="#444"/>`;
      svg += `<text x="${c.width / 2}" y="${c.height / 2 + 4}" text-anchor="middle" ${font(S.sizeSmall)} fill="#fff">${esc(c.label)}</text>`;
      const midX = c.width / 2;
      if (pos === 'top') {
        svg += `<polygon points="${midX - arrowSize},${c.height} ${midX + arrowSize},${c.height} ${midX},${c.height + arrowSize}" fill="#333"/>`;
      } else if (pos === 'bottom') {
        svg += `<polygon points="${midX - arrowSize},0 ${midX + arrowSize},0 ${midX},${-arrowSize}" fill="#333"/>`;
      } else if (pos === 'left') {
        const midY = c.height / 2;
        svg += `<polygon points="${c.width},${midY - arrowSize} ${c.width},${midY + arrowSize} ${c.width + arrowSize},${midY}" fill="#333"/>`;
      } else if (pos === 'right') {
        const midY = c.height / 2;
        svg += `<polygon points="0,${midY - arrowSize} 0,${midY + arrowSize} ${-arrowSize},${midY}" fill="#333"/>`;
      }
      return svg;
    },
  },
};

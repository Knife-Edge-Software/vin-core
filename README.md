# @vin/core

Text-based wireframe markup language — parser, renderer, and CLI.

Write simple, readable markup describing UI controls — buttons, text fields, panels, tables — and Vin compiles it to SVG. The format is designed to be easy to write by hand and easy to generate with AI.

## Install

```bash
npm install @vin/core
```

## Usage

### As a library

```js
import { compile } from '@vin/core';

const source = `
page "Hello" 300x200

heading "Welcome" 20,20

button "Click me" 20,60 120x36
  variant: primary
`;

const { svg, pages, diagnostics } = compile(source);
// svg: SVG string for the first page
// pages: array of { title, svg, width, height } for all pages
// diagnostics: array of warnings/errors
```

### CLI

```
vin render <files...> [options]
```

| Option | Description |
|--------|-------------|
| `-o, --output <file>` | Output file path (single file mode) |
| `--outdir <dir>` | Output directory (batch mode) |
| `-f, --format <fmt>` | `svg` (default) or `png` |
| `--scale <n>` | PNG scale factor (default: 2) |
| `--page <p>` | Page to render: 0-based index or title |
| `--quiet` | Suppress non-error output |

```bash
vin render login.vin                          # SVG to stdout
vin render login.vin -o login.svg             # write to file
vin render examples/*.vin --outdir ./output   # batch render
vin render login.vin -o login.png             # PNG (requires @resvg/resvg-js)
```

## Format Overview

A `.vin` file starts with a `page` declaration, followed by controls. Each control has a type, an optional label, optional position and size, and indented properties:

```
page "Settings" 400x300

heading "Account" 20,20
  level: 2

label "Name" 20,65

textfield "name" 20,85 300x32
  placeholder: "Enter your name"

checkbox "Email notifications" 20,135
  checked: true

button "Save" 20,180 120x36
  variant: primary
```

Controls can be nested inside containers with auto-layout:

```
panel "Form" 20,20 360x200
  layout: column
  padding: 16
  gap: 12

  label "Name"
  textfield "name" 320x32
  label "Email"
  textfield "email" 320x32

  row 320x40
    justify: end
    button "Save" 80x34
      variant: primary
```

See [docs/FORMAT.md](docs/FORMAT.md) for the complete specification, including all 39 control types, layout options, and property reference.

## Viewer

A browser-based viewer is included for live preview, drag-and-drop file loading, and SVG/PNG export:

```bash
npm run viewer
# → http://localhost:3030
```

## Examples

The [examples/](examples/) directory contains 28 wireframes covering common UI patterns: login forms, dashboards, settings pages, chat interfaces, multi-page flows, and more. All examples are pre-loaded in the viewer.

## API

### `compile(source, options?)`

Compiles a `.vin` source string to SVG.

**Parameters:**
- `source` — `.vin` format string
- `options.theme` — Theme overrides (merged with default theme)

**Returns:** `{ svg, pages, diagnostics }`

### Pipeline stages (advanced)

Individual pipeline stages are also exported for advanced use:

```js
import { tokenize, parse, validate, resolve, computeLayout, render, serialize } from '@vin/core';
```

### Theme

```js
import { defaultTheme, createTheme } from '@vin/core';
```

### Registry

```js
import { registerControl, getControl, hasControl, getControlTypes } from '@vin/core';
```

## License

MIT

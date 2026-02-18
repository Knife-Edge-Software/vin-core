# Vin Markup Format (.vin)

A simple, text-based format for describing UI wireframes. Designed to be human-readable, AI-friendly, and easy to parse.

## Quick Example

```
vin-format: 1
page "Settings" 500x400

heading "Account Settings" 20,20
  level: 2

label "Display Name" 20,65

textfield "name" 20,85 300x32
  placeholder: "Enter your name"

checkbox "Email notifications" 20,135
  checked: true

button "Save" 20,180 120x36
  variant: primary

button "Cancel" 150,180 120x36
```

## Version Header

A `.vin` file may begin with an optional version declaration:

```
vin-format: 1
```

This must appear before the `page` declaration or any controls. Blank lines and comments are allowed before it.

| Detail | Behavior |
|--------|----------|
| Omitted | Defaults to version `1` — all existing files remain valid |
| Current version | `1` |
| Future version | Parser warns: *"Unrecognized vin-format version N"* but continues |

## Structure

A `.vin` file is a sequence of **control blocks** separated by blank lines.

Each block has a **declaration line** followed by optional indented **property lines**:

```
controltype "label" x,y [widthxheight]
  property: value
  property: value
```

**Comments** start with `#` and are ignored.

## Declaration Line

```
type "label" x,y widthxheight
```

| Part | Required | Description |
|------|----------|-------------|
| `type` | yes | Control type name (see list below) |
| `"label"` | no | Display text in double quotes |
| `x,y` | no | Position in pixels (default: 0,0) |
| `widthxheight` | no | Size in pixels (default: per control type) |

## Property Lines

Indented lines below a declaration. Format: `key: value`

Value types:
- **String:** `placeholder: "Enter text"` or `placeholder: Enter text`
- **Boolean:** `checked: true`
- **Number:** `value: 72` or `offset: -10`
- **List:** `items: "Home" | "Settings" | "Profile"`

Escape sequences in quoted strings and labels:
- `\"` — literal double quote
- `\\` — literal backslash
- `\|` — literal pipe (in pipe-delimited lists)

## Page

Every file should start with a page declaration that sets the canvas size:

```
page "Page Title" widthxheight
```

If omitted, defaults to 800x600.

## Multi-Page

A single `.vin` file can define multiple screens by using multiple `page` declarations. Each `page` starts a new screen, and all controls following it belong to that page until the next `page` declaration:

```
page "Login" 400x500
button "Sign In" 20,20 100x34

page "Dashboard" 800x600
heading "Welcome" 20,20
```

Rules:
- Each `page` declaration creates a new screen with its own canvas size
- Controls after a `page` belong to that page
- Controls before any `page` declaration are assigned to an implicit default page (800x600)
- Pages can have different sizes
- The viewer shows page tabs for switching between pages
- The CLI exports each page as a separate file when using `--outdir`

**Multi-page example (3-page onboarding flow):**

```
page "Welcome" 400x500
heading "Welcome to Acme" 40,40
  level: 1
button "Get Started" 40,350 320x40
  variant: primary

page "Sign Up" 400x500
heading "Create Account" 40,40
  level: 2
textfield "email" 40,100 320x32
  placeholder: "you@example.com"
button "Create Account" 40,200 320x40
  variant: primary

page "Done" 400x500
heading "You're All Set!" 40,80
  level: 1
button "Go to Dashboard" 40,200 320x40
  variant: primary
```

## Controls

### Text

| Type | Description | Key Properties |
|------|-------------|----------------|
| `label` | Static text | `font-size` (small/normal/large), `align` (left/center/right), `bold` |
| `heading` | Bold heading | `level` (1/2/3 — maps to size 24/20/16) |
| `link` | Underlined link text | — |

### Inputs

| Type | Description | Default Size | Key Properties |
|------|-------------|-------------|----------------|
| `button` | Clickable button | 100x34 | `variant` (default/primary/danger), `disabled` |
| `textfield` | Single-line input | 200x32 | `placeholder`, `value`, `mask` (boolean, shows dots) |
| `textarea` | Multi-line input | 200x80 | `placeholder` |
| `checkbox` | Checkbox with label | 120x20 | `checked` |
| `radio` | Radio button with label | 120x20 | `selected` |
| `dropdown` | Select/combobox | 200x32 | `items` (list), `selected` (index), `placeholder` |
| `toggle` | Toggle switch | 140x22 | `on` or `checked` (boolean) |
| `slider` | Range slider | 200x20 | `value` (number, 0–100, default 50) |
| `searchfield` | Search input with icon | 220x34 | `placeholder` (default "Search...") |

### Navigation

| Type | Description | Default Size | Key Properties |
|------|-------------|-------------|----------------|
| `tabs` | Tab bar | 300x34 | `items` (list), `active` (index, default 0) |
| `menu` | Dropdown menu | 180x200 | `items` (list, `"---"` for separator), `active` (index) |
| `navbar` | Top navigation bar | 800x48 | `items` (list of link labels); implicit `row` layout |
| `sidebar` | Vertical sidebar nav | 220x400 | `items` (list), `active` (index, default 0) |
| `breadcrumb` | Breadcrumb trail | 300x20 | `items` (list of path segments) |

### Layout

| Type | Description | Default Size | Key Properties |
|------|-------------|-------------|----------------|
| `frame` | Bordered box with title | 300x200 | — |
| `panel` | Styled container with title | 300x200 | `variant` (default/dark/accent) |
| `card` | Card container with shadow | 280x180 | `elevated` (boolean, default true) |
| `modal` | Modal dialog overlay | 400x250 | — |
| `separator` | Divider line | 200x2 | `direction` (horizontal/vertical) |
| `splitter` | Resizable divider | 200x8 | `direction` (horizontal/vertical) |
| `divider` | Simple horizontal line | 200x1 | — |
| `image` | Image placeholder (X) | 150x100 | `alt` |

### Data

| Type | Description | Default Size | Key Properties |
|------|-------------|-------------|----------------|
| `list` | Bulleted/numbered list | 200x120 | `items` (list), `selected` (index), `numbered` |
| `table` | Data table with headers | 300x150 | `columns` (list), `rows` (number) |

### Indicators

| Type | Description | Default Size | Key Properties |
|------|-------------|-------------|----------------|
| `progress` | Progress bar | 200x8 | `value` (0–100) |
| `badge` | Status pill | 60x22 | `variant` (default/success/warning/error/info) |
| `icon` | Icon (Lucide set) | 24x24 | `name`, `color` (hex string) |
| `avatar` | User avatar with initials | 40x40 | `variant` (default/blue/green/orange/red/purple), `status` (online/busy/away) |
| `tooltip` | Tooltip with arrow | 120x32 | `position` (top/bottom/left/right) |
| `chip` | Dismissible tag/pill | 80x28 | `dismissible` (boolean) |
| `toast` | Toast notification | 320x48 | `variant` (info/success/error/warning) |
| `stepper` | Step indicator | 300x32 | `steps` (number, default 3), `current` (index) |
| `skeleton` | Loading placeholder | 200x60 | `lines` (number, default 3) |

## Universal Properties

These properties are available on every control:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | Unique identifier for the control (must be unique within the page) |

## Positioning

By default, all positions are **absolute** relative to the page origin (top-left = 0,0). You place each control explicitly with `x,y` coordinates.

When size is omitted, the control uses its default size (listed above).

## Nesting Syntax

Controls can be nested inside containers using **indentation** (2 spaces per level). Indented lines below a control are either **property lines** (containing `:`) or **child controls**.

```
panel "sidebar" 0,0 200x600
  layout: column
  padding: 12
  gap: 8

  button "Home" 200x34
  button "Settings" 200x34
    variant: primary
  button "Profile" 200x34
```

Rules:
- Property lines are identified by the `key: value` pattern (colon after word characters)
- Everything else at a deeper indent level is parsed as a child control
- Blank lines and comments do not break nesting — indentation level determines parent/child relationships
- Children can themselves have properties and children (arbitrary nesting depth)

## Layout Containers

Add `layout: column|row|wrap` to any container control (`panel`, `frame`, `card`) to enable auto-layout for its children. Children omit `x,y` — positions are assigned by the layout engine.

### Invisible Layout Controls

Three invisible container types always auto-layout (no `layout:` property needed):

| Type | Behavior | Default Size |
|------|----------|-------------|
| `row` | Horizontal flow (`layout: row`) | 300x40 |
| `column` | Vertical stack (`layout: column`) | 300x200 |
| `stack` | Alias for `column` | 300x200 |

These render no visual chrome — they exist purely for layout.

### Container Properties

| Property | Values | Default | Description |
|----------|--------|---------|-------------|
| `layout` | `column`, `row`, `wrap` | _(none)_ | Enable auto-layout |
| `padding` | number | `0` | Inner padding on all sides |
| `gap` | number | `8` | Space between children |
| `align` | `start`, `center`, `end`, `stretch` | `stretch` | Cross-axis alignment |
| `justify` | `start`, `center`, `end`, `space-between` | `start` | Main-axis distribution |

### Child Properties

| Property | Values | Default | Description |
|----------|--------|---------|-------------|
| `flex` | number | `0` | Flex grow factor (0 = use natural size) |
| `align-self` | `start`, `center`, `end`, `stretch` | _(inherit)_ | Override parent's `align` |

### Mixed Positioning

A child with explicit `x,y` coordinates is positioned **absolutely** within the container, bypassing the layout flow. Children without `x,y` participate in auto-layout.

### Auto-Layout Examples

**Vertical form (column layout):**
```
panel "Settings" 20,20 400x300
  layout: column
  padding: 16
  gap: 12

  heading "Account"
    level: 2

  label "Display Name"
  textfield "name" 360x32
    placeholder: "Enter your name"

  label "Email"
  textfield "email" 360x32
    placeholder: "you@example.com"

  row 360x40
    gap: 8
    justify: end

    button "Cancel" 80x34
    button "Save" 80x34
      variant: primary
```

**Horizontal toolbar (row layout):**
```
panel "toolbar" 0,0 800x48
  layout: row
  padding: 8
  gap: 4
  align: center

  button "New" 60x32
    variant: primary
  button "Open" 60x32
  button "Save" 60x32
  separator "sep" 2x24
    direction: vertical
  button "Undo" 60x32
  button "Redo" 60x32
```

**Tag cloud (wrap layout):**
```
panel "tags" 20,20 300x120
  layout: wrap
  padding: 12
  gap: 6

  badge "Design" 60x22
  badge "Code" 50x22
  badge "UX" 40x22
  badge "Frontend" 72x22
  badge "React" 55x22
  badge "CSS" 45x22
```

## Tips for AI Agents

1. Start with `page "Title" widthxheight` to set the canvas
2. Use `frame` controls to visually group related elements
3. **Prefer auto-layout** (`layout: column` / `layout: row`) for forms, toolbars, and lists — it's easier and more maintainable than manual positioning
4. Use `row` and `column` invisible containers for sub-groups within a layout
5. Position elements with enough spacing (8–16px gaps between controls)
6. Use `heading` for section titles, `label` for form labels
7. Common form pattern with layout: `column` with `label` then `textfield` children
8. Use `separator` to divide sections visually
9. Button rows: use a `row` container with `justify: end` for right-aligned buttons
10. For absolute positioning: place controls with `x,y` coordinates explicitly
11. Use **multiple `page` declarations** to document multi-screen flows (onboarding, settings, error states) in a single file

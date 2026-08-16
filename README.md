# AI Visual Website Builder

React + Tailwind CSS MVP for an Elementor-style visual website builder.

## Features

- Visual editor with left widget panel, canvas, and right settings panel
- Page manager with create, rename, duplicate, delete, and open page actions
- Widget registry for sections, containers, flex, grid, cards, text, images, buttons, dropdowns, forms, header, and footer
- Drag and drop widgets into the canvas and nested containers
- Inline text editing
- Responsive desktop, tablet, and mobile preview widths
- Templates, reusable components, global colors, undo/redo, and LocalStorage persistence
- AI assistant UI that applies structured editor operations
- HTML/CSS import starter flow that converts common markup into editable nodes

## Local Development

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173
```

## Production Build

```bash
npm run build
```

The static production output is generated in `dist/`.

## Hostinger Deployment

For Hostinger Git deployment:

1. Connect this GitHub repository in Hostinger.
2. Use build command:

```bash
npm install && npm run build
```

3. Use publish/output directory:

```text
dist
```

This is a frontend-only Vite app. No Node server is required for the current MVP.

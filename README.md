# Mindmap (Mermaid → Beautiful)

Browser-only webapp with **two panes**:
- **Left**: Mermaid mindmap syntax
- **Right**: a **prettier mindmap renderer** (does not use Mermaid for rendering)

## Run locally

This app uses **native ES modules** (`import` / `type="module"`). Browsers **do not** allow loading those from `file://` URLs (you will see CORS or “Failed to load module script” errors). Use **HTTP** instead.

Install dependencies (includes **CodeMirror** for the left editor; those use bare `import` specifiers that only work when Vite resolves them from `node_modules`):

```bash
npm install
npm run dev
```

Vite prints a URL (defaults to `http://localhost:5173/`); it may open your browser automatically.

A plain `python3 -m http.server` against **source** files is **not** enough: the browser cannot resolve `@codemirror/...` without Vite. For a static server, use the **production build** (below).

If you double-click `index.html`, the page explains why `file://` does not work.

## Production build & GitHub Pages

Deploy the **built** app, not the raw `src/` tree. Vite bundles npm packages (e.g. CodeMirror) into `./dist`.

```bash
npm install
npm run build
```

Publish **everything inside `dist/`** as the site root (for example: GitHub Pages “Deploy from GitHub Actions” using the included workflow, or upload the `dist` contents to the `gh-pages` branch).

The repo `index.html` at the root is only the **Vite entry** for `npm run dev` / `npm run build`. GitHub Pages must serve `dist/index.html` and `dist/assets/*`, or you will see errors like `Failed to resolve module specifier "@codemirror/view"`.

## Features
- Live render as you type
- Light/dark themes
- Autosave to `localStorage`
- Share via URL hash (“Copy link”)
- Export to SVG/PNG


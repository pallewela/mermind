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

A plain `python3 -m http.server` is **not** enough anymore: the browser cannot resolve `@codemirror/...` package names without this toolchain.

If you double-click `index.html`, the page explains why `file://` does not work.

## Features
- Live render as you type
- Light/dark themes
- Autosave to `localStorage`
- Share via URL hash (“Copy link”)
- Export to SVG/PNG


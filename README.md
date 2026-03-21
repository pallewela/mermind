# Mindmap (Mermaid → Beautiful)

Browser-only webapp with **two panes**:
- **Left**: Mermaid mindmap syntax
- **Right**: a **mindmap diagram** (the app parses Mermaid; rendering uses a separate library, not Mermaid’s own renderer)

## Mindmap renderers (build-time choice)

The same Mermaid text is parsed once (`parseMermaidMindmap`). The resulting tree is then converted for whichever renderer you choose at **build time** via `VITE_RENDERER`:

| Value | Library | Notes |
|--------|---------|--------|
| *(unset or anything other than `markmap`)* | **[MindElixir](https://github.com/SSShooter/mind-elixir)** | Default. DOM-based map with custom zoom/pan and toolbar. |
| `markmap` | **[markmap](https://github.com/markmap/markmap)** ([markmap-view](https://github.com/markmap/markmap)) | SVG + D3; zoom/pan and fold/unfold are built in. Data path: `toMarkmapData.js` → markmap `IPureNode` (`content` + `children`). |

**Local dev**

```bash
npm run dev              # MindElixir (default)
npm run dev:markmap      # markmap
```

**Production build**

```bash
npm run build            # MindElixir (default)
npm run build:markmap    # markmap
```

Set the variable yourself if you prefer:

```bash
VITE_RENDERER=markmap npm run build
```

GitHub Actions / CI: pass `VITE_RENDERER=markmap` in the build step environment if you want the markmap build deployed to Pages.

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
- Light/dark themes (both renderers; markmap text colors follow app theme)
- Autosave to `localStorage`
- Share via URL hash (“Copy link”)
- Export to SVG/PNG

**markmap-specific:** wheel zoom, drag-to-pan, and clicking nodes to fold/unfold come from markmap-view. The toolbar adds **+ / − / Fit** plus **Tier−** / **Tier+** to collapse or reveal one depth level at a time (using markmap’s `initialExpandLevel`). Editing the Mermaid text resets tier expansion to fully open.


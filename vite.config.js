import { defineConfig } from "vite";

// Use "./" so asset URLs work when the site is served from a subpath (e.g. GitHub Pages project sites).
export default defineConfig({
  base: "./",
  server: {
    port: 5173,
    open: true,
  },
});

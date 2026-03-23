import * as htmlToImage from "https://esm.sh/html-to-image@1.11.11";

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function getBgColor() {
  return (
    getComputedStyle(document.documentElement).getPropertyValue("--mind-bg") ||
    "#ffffff"
  );
}

// ── Renderer detection ──────────────────────────────────────────────

function findMarkmap(exportRoot) {
  const svg = exportRoot.querySelector("svg.__markmap, svg.markmapSvg");
  return svg?.__markmap ?? null;
}

function findMindElixir(exportRoot) {
  const container = exportRoot.querySelector(".mind-elixir");
  return container?.__mindElixir ?? null;
}

// ── Markmap (SVG-native) export ─────────────────────────────────────

const EXPORT_PADDING = 30;

function markmapContentRect(mm) {
  const { x1, y1, x2, y2 } = mm.state.rect;
  const w = x2 - x1 + EXPORT_PADDING * 2;
  const h = y2 - y1 + EXPORT_PADDING * 2;
  const vb = `${x1 - EXPORT_PADDING} ${y1 - EXPORT_PADDING} ${w} ${h}`;
  return { w, h, vb };
}

/**
 * Temporarily set the live SVG to show the full content (reset viewBox
 * and g transform), run `captureFn`, then restore everything.
 */
async function withMarkmapFullView(mm, captureFn) {
  const svgEl = mm.svg.node();
  const gEl = mm.g.node();
  const { w, h, vb } = markmapContentRect(mm);

  const saved = {
    viewBox: svgEl.getAttribute("viewBox"),
    width: svgEl.getAttribute("width"),
    height: svgEl.getAttribute("height"),
    style: svgEl.style.cssText,
    gTransform: gEl.getAttribute("transform"),
  };

  svgEl.setAttribute("viewBox", vb);
  svgEl.setAttribute("width", w);
  svgEl.setAttribute("height", h);
  svgEl.style.cssText = `position:fixed;left:0;top:0;width:${w}px;height:${h}px;z-index:-1;pointer-events:none;`;
  if (gEl) gEl.removeAttribute("transform");

  try {
    return await captureFn(svgEl, w, h);
  } finally {
    const restore = (attr, val) =>
      val != null
        ? svgEl.setAttribute(attr, val)
        : svgEl.removeAttribute(attr);
    restore("viewBox", saved.viewBox);
    restore("width", saved.width);
    restore("height", saved.height);
    svgEl.style.cssText = saved.style;
    if (saved.gTransform) gEl.setAttribute("transform", saved.gTransform);
  }
}

async function exportMarkmapAsPng(mm) {
  await withMarkmapFullView(mm, async (svgEl, w, h) => {
    const dataUrl = await htmlToImage.toPng(svgEl, {
      cacheBust: true,
      width: w,
      height: h,
      pixelRatio: Math.min(3, window.devicePixelRatio || 2),
      backgroundColor: getBgColor(),
    });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    downloadBlob(blob, `mindmap_${timestamp()}.png`);
  });
}

function exportMarkmapAsSvg(mm) {
  const svgEl = mm.svg.node();
  const gEl = mm.g.node();
  const { w, h, vb } = markmapContentRect(mm);

  const clone = svgEl.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", w);
  clone.setAttribute("height", h);
  clone.setAttribute("viewBox", vb);
  const g = clone.querySelector("g");
  if (g) g.removeAttribute("transform");

  const svgString = new XMLSerializer().serializeToString(clone);
  const bg = getBgColor();
  const withBg = svgString.replace(
    /(<svg[^>]*>)/,
    `$1<rect width="100%" height="100%" fill="${bg}" />`,
  );
  const blob = new Blob([withBg], { type: "image/svg+xml;charset=utf-8" });
  downloadBlob(blob, `mindmap_${timestamp()}.svg`);
}

// ── MindElixir (DOM-based) export ───────────────────────────────────

/** Exclude toolbar buttons and overlays from the html-to-image capture. */
function exportFilter(node) {
  if (!(node instanceof Element)) return true;
  return (
    !node.classList.contains("mindMapToolbar") &&
    !node.classList.contains("mindOverlay")
  );
}

function centerPoint(mind) {
  const r = mind.container.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

async function withMindElixirReset(mind, exportRoot, captureFn) {
  const savedScale = mind.scaleVal;
  const savedScrollLeft = mind.container.scrollLeft;
  const savedScrollTop = mind.container.scrollTop;

  mind.scale(1, centerPoint(mind));
  mind.toCenter();
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  try {
    return await captureFn(exportRoot);
  } finally {
    mind.scale(savedScale, centerPoint(mind));
    mind.container.scrollLeft = savedScrollLeft;
    mind.container.scrollTop = savedScrollTop;
  }
}

async function exportMindElixirAsPng(mind, exportRoot) {
  await withMindElixirReset(mind, exportRoot, async (el) => {
    const dataUrl = await htmlToImage.toPng(el, {
      cacheBust: true,
      pixelRatio: Math.min(3, window.devicePixelRatio || 2),
      backgroundColor: getBgColor(),
      filter: exportFilter,
    });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    downloadBlob(blob, `mindmap_${timestamp()}.png`);
  });
}

async function exportMindElixirAsSvg(mind, exportRoot) {
  await withMindElixirReset(mind, exportRoot, async (el) => {
    const dataUrl = await htmlToImage.toSvg(el, {
      cacheBust: true,
      backgroundColor: getBgColor(),
      filter: exportFilter,
    });
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    downloadBlob(blob, `mindmap_${timestamp()}.svg`);
  });
}

// ── Public API ──────────────────────────────────────────────────────

export async function exportPng(el) {
  if (!el) throw new Error("Export target not found.");
  const mm = findMarkmap(el);
  if (mm) return exportMarkmapAsPng(mm);
  const mind = findMindElixir(el);
  if (mind) return exportMindElixirAsPng(mind, el);
  throw new Error("No renderer found for export.");
}

export async function exportSvg(el) {
  if (!el) throw new Error("Export target not found.");
  const mm = findMarkmap(el);
  if (mm) return exportMarkmapAsSvg(mm);
  const mind = findMindElixir(el);
  if (mind) return exportMindElixirAsSvg(mind, el);
  throw new Error("No renderer found for export.");
}

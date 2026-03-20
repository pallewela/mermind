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

export async function exportPng(el) {
  if (!el) throw new Error("Export target not found.");
  const dataUrl = await htmlToImage.toPng(el, {
    cacheBust: true,
    pixelRatio: Math.min(3, window.devicePixelRatio || 2),
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--mind-bg") || undefined,
  });
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  downloadBlob(blob, `mindmap_${timestamp()}.png`);
}

export async function exportSvg(el) {
  if (!el) throw new Error("Export target not found.");
  const dataUrl = await htmlToImage.toSvg(el, {
    cacheBust: true,
    backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--mind-bg") || undefined,
  });
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  downloadBlob(blob, `mindmap_${timestamp()}.svg`);
}


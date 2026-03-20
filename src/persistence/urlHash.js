import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "https://esm.sh/lz-string@1.5.0";

const PARAM = "mindmap";

export function encodeToUrlHash(text) {
  const encoded = compressToEncodedURIComponent(String(text ?? ""));
  const url = new URL(window.location.href);
  url.hash = `${PARAM}=${encoded}`;
  window.history.replaceState(null, "", url.toString());
  return url.toString();
}

export function decodeFromUrlHash() {
  const hash = String(window.location.hash || "").replace(/^#/, "");
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const encoded = params.get(PARAM);
  if (!encoded) return null;
  const text = decompressFromEncodedURIComponent(encoded);
  return typeof text === "string" && text.length > 0 ? text : null;
}


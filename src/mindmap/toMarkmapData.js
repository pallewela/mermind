/**
 * Convert the parsed Mermaid mindmap tree into markmap's IPureNode format.
 * IPureNode = { content: string, children: IPureNode[] }
 */
function escapeHtml(s) {
  return String(s);
  //  .replaceAll("&", "&amp;")
  //  .replaceAll("<", "&lt;")
  //  .replaceAll(">", "&gt;");
}

function convert(node) {
  return {
    content: escapeHtml(node.topic),
    children: (node.children || []).map(convert),
  };
}

export function toMarkmapData(parsed) {
  return {
    content: escapeHtml(parsed.root.topic),
    children: (parsed.children || []).map(convert),
  };
}

/**
 * Deepest node depth (root = 1), matching markmap’s internal depth.
 * Parsed trees put branches on `parsed.children`, not `parsed.root.children`
 * (same shape as `toMarkmapData`).
 */
export function getMindmapMaxDepth(parsed) {
  if (!parsed?.root) return 1;
  const branches = parsed.children || [];
  if (!branches.length) return 1;

  function walk(node, depth) {
    const kids = node.children || [];
    if (!kids.length) return depth;
    return Math.max(...kids.map((c) => walk(c, depth + 1)));
  }

  return Math.max(...branches.map((b) => walk(b, 2)));
}

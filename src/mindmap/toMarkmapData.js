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

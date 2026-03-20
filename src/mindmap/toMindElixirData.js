const BRANCH_COLORS = [
  "#f97316", // orange
  "#3b82f6", // blue
  "#a855f7", // purple
  "#22c55e", // green
  "#eab308", // yellow
  "#ef4444", // red
  "#14b8a6", // teal
  "#64748b", // slate
];

function pickColor(index) {
  return BRANCH_COLORS[index % BRANCH_COLORS.length];
}

function iconToEmoji(icon) {
  const key = String(icon || "").toLowerCase().replace(/\s+/g, "");
  const map = {
    lightbulb: "💡",
    spark: "✨",
    checklist: "🗒️",
    pencil: "✏️",
    book: "📚",
    pin: "📌",
    hourglass: "⏳",
    cup: "☕",
    home: "🏠",
    people: "👥",
    truck: "🚚",
    coins: "🪙",
    calendar: "🗓️",
    star: "⭐",
    file: "📄",
    competition: "🏁",
  };
  return map[key] || null;
}

function topicHtml(topic, icon) {
  const emoji = iconToEmoji(icon);
  if (!emoji) return escapeHtml(topic);
  return `<span class="topicIcon" aria-hidden="true">${escapeHtml(emoji)}</span><span class="topicText">${escapeHtml(topic)}</span>`;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function toNodeData(node, opts) {
  return {
    id: node.id,
    topic: topicHtml(node.topic, node.icon),
    style: {
      // MindElixir applies this style to node topic background.
      // We keep topic pill neutral and put color into connectors.
      background: "rgba(255,255,255,0.65)",
    },
    ...opts,
  };
}

/**
 * MindElixir expects MindElixirData = { nodeData: NodeObj } where each NodeObj
 * has optional `children: NodeObj[]` nested on the node — not a top-level
 * `children` array next to `nodeData`.
 */
function mapTree(node, children, opts) {
  const nodeData = toNodeData(node, opts);
  const mapped = (children || []).map((c) => mapTree(c, c.children, {}));
  return mapped.length
    ? { ...nodeData, children: mapped }
    : nodeData;
}

export function toMindElixirData(parsed) {
  const branchChildren = (parsed.children || []).map((child, idx) => {
    const color = pickColor(idx);
    return mapTree(child, child.children, {
      branchColor: color,
    });
  });

  const rootNode = {
    id: parsed.root.id,
    topic: topicHtml(parsed.root.topic, parsed.root.icon),
    root: true,
    ...(branchChildren.length ? { children: branchChildren } : {}),
  };

  return {
    nodeData: rootNode,
  };
}

export function getBranchColors(data) {
  const colorsById = new Map();
  for (const child of data.nodeData?.children || []) {
    const color = child?.branchColor;
    if (color) colorsById.set(child.id, color);
  }
  return colorsById;
}


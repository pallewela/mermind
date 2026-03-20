const DEFAULT_ROOT_TOPIC = "Mindmap";

function isIgnorableLine(line) {
  const t = line.trim();
  if (!t) return true;
  if (t.startsWith("%%")) return true;
  return false;
}

function countIndent(raw) {
  let indent = 0;
  for (const ch of raw) {
    if (ch === " ") indent += 1;
    else if (ch === "\t") indent += 2;
    else break;
  }
  return indent;
}

function stripMermaidNodeDecorations(text) {
  let t = text.trim();
  // Remove Mermaid class decorator (e.g. "Topic:::className")
  t = t.replace(/:::\S+\s*$/g, "").trim();

  // Extract inside common Mermaid "shape wrappers"
  // Examples: root((Cafe)), root(Cafe), root[Cafe], root{Cafe}
  const firstBracketIdx = t.search(/[\(\[\{]/);
  if (firstBracketIdx !== -1) {
    const before = t.slice(0, firstBracketIdx).trim();
    const open = t[firstBracketIdx];
    const rest = t.slice(firstBracketIdx);
    const close = open === "(" ? ")" : open === "[" ? "]" : "}";
    // handle double-parens "((...))"
    if (rest.startsWith("((") && rest.endsWith("))")) {
      const inner = rest.slice(2, -2).trim();
      return inner || before || t;
    }
    if (rest.startsWith(open) && rest.endsWith(close)) {
      const inner = rest.slice(1, -1).trim();
      return inner || before || t;
    }
  }

  return t;
}

function extractIconDirective(text) {
  const match = text.match(/::icon\(([^)]+)\)\s*$/);
  if (!match) return { text, icon: null };
  const icon = match[1].trim();
  const without = text.slice(0, match.index).trimEnd();
  return { text: without, icon: icon || null };
}

export function parseMermaidMindmap(source) {
  const lines = String(source ?? "").replace(/\r\n/g, "\n").split("\n");

  let i = 0;
  while (i < lines.length && isIgnorableLine(lines[i])) i++;
  if (i >= lines.length) {
    return {
      root: { id: "root", topic: DEFAULT_ROOT_TOPIC, icon: null },
      children: [],
    };
  }

  const header = lines[i].trim();
  if (!/^mindmap\b/i.test(header)) {
    throw new Error('Expected a "mindmap" header on the first non-empty line.');
  }
  i++;

  const nodes = [];
  for (; i < lines.length; i++) {
    const raw = lines[i];
    if (isIgnorableLine(raw)) continue;
    const indent = countIndent(raw);
    const content = raw.trim();
    const { text, icon } = extractIconDirective(content);
    const topic = stripMermaidNodeDecorations(text);
    if (!topic) continue;
    nodes.push({ indent, topic, icon, line: i + 1 });
  }

  if (nodes.length === 0) {
    return {
      root: { id: "root", topic: DEFAULT_ROOT_TOPIC, icon: null },
      children: [],
    };
  }

  // Build indentation tree
  const mkId = (() => {
    let n = 0;
    return () => `n_${++n}`;
  })();

  const root = { id: "root", topic: nodes[0].topic, icon: nodes[0].icon };
  const rootIndent = nodes[0].indent;

  const stack = [{ indent: rootIndent, node: root, children: [] }];

  for (let idx = 1; idx < nodes.length; idx++) {
    const entry = nodes[idx];
    if (entry.indent <= rootIndent) {
      throw new Error(`Line ${entry.line}: root must be the least-indented node.`);
    }

    while (stack.length > 0 && entry.indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }
    if (stack.length === 0) {
      throw new Error(`Line ${entry.line}: invalid indentation.`);
    }

    const parent = stack[stack.length - 1];
    const node = { id: mkId(), topic: entry.topic, icon: entry.icon };
    const wrapper = { indent: entry.indent, node, children: [] };
    parent.children.push(wrapper);
    stack.push(wrapper);
  }

  const unwrap = (w) => ({
    ...w.node,
    children: w.children.map(unwrap),
  });

  return {
    root,
    children: stack[0].children.map(unwrap),
  };
}


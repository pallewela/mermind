import React from "https://esm.sh/react@18.3.1";
import htm from "https://esm.sh/htm@3.1.1";
import MindElixir from "https://cdn.jsdelivr.net/npm/mind-elixir/dist/MindElixir.js";

const html = htm.bind(React.createElement);

function safeMarkdown(md) {
  // We intentionally pass pre-sanitized HTML strings for `topic`.
  // MindElixir calls this when `markdown` option is enabled.
  return String(md ?? "");
}

function cubicCurvePath({ pL, pT, pW, pH, cL, cT, cW, cH }) {
  const x1 = pL + pW / 2;
  const y1 = pT + pH / 2;
  const x2 = cL + cW / 2;
  const y2 = cT + cH / 2;
  const dx = x2 - x1;
  const bend = Math.max(30, Math.min(220, Math.abs(dx) * 0.55));
  const sign = dx >= 0 ? 1 : -1;
  const cx1 = x1 + sign * bend;
  const cy1 = y1;
  const cx2 = x2 - sign * bend;
  const cy2 = y2;
  return `M ${x1} ${y1} C ${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`;
}

export function MindmapPane({ model, theme, themeMode }) {
  const containerRef = React.useRef(null);
  const mindRef = React.useRef(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    if (mindRef.current) return;

    const mind = new MindElixir({
      el: containerRef.current,
      theme,
      editable: false,
      draggable: false,
      contextMenu: false,
      toolBar: false,
      keypress: false,
      overflowHidden: true,
      markdown: safeMarkdown,
      alignment: "center",
      direction: 2,
      generateMainBranch: cubicCurvePath,
      generateSubBranch: cubicCurvePath,
      scaleMin: 0.25,
      scaleMax: 2.5,
      scaleSensitivity: 0.12,
    });

    mindRef.current = mind;
    return () => {
      mindRef.current = null;
      // MindElixir doesn't expose destroy reliably across versions; remove content.
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const mind = mindRef.current;
    if (!mind) return;
    if (!model?.ok) return;
    try {
      mind.refresh(model.data);
    } catch {
      mind.init(model.data);
    }
  }, [model]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const old = mindRef.current;
    if (!old) return;
    // Recreate to ensure theme + cssVars apply consistently.
    el.innerHTML = "";
    const mind = new MindElixir({
      el,
      theme,
      editable: false,
      draggable: false,
      contextMenu: false,
      toolBar: false,
      keypress: false,
      overflowHidden: true,
      markdown: safeMarkdown,
      alignment: "center",
      direction: 2,
      generateMainBranch: cubicCurvePath,
      generateSubBranch: cubicCurvePath,
      scaleMin: 0.25,
      scaleMax: 2.5,
      scaleSensitivity: 0.12,
    });
    mindRef.current = mind;
    if (model?.ok) {
      try {
        mind.init(model.data);
      } catch {
        // ignore
      }
    }
    void themeMode;
  }, [theme, themeMode]); // eslint-disable-line react-hooks/exhaustive-deps

  return html`
    <div className="mindRoot">
      <div className="mindElixirContainer mind-elixir" ref=${containerRef}></div>
      ${model?.ok
        ? null
        : html`<div className="mindOverlay">
            <div className="overlayCard">
              Fix the Mermaid mindmap syntax on the left to render here.
            </div>
          </div>`}
    </div>
  `;
}


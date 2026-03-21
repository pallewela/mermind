import React from "https://esm.sh/react@18.3.1";
import htm from "https://esm.sh/htm@3.1.1";
import { Markmap } from "markmap-view";
import { getMindmapMaxDepth, toMarkmapData } from "../mindmap/toMarkmapData.js";

const html = htm.bind(React.createElement);

const BRANCH_COLORS = [
  "#f97316", "#3b82f6", "#a855f7", "#22c55e",
  "#eab308", "#ef4444", "#14b8a6", "#64748b",
];

function colorByBranch(node) {
  if (!node.state) return BRANCH_COLORS[0];
  const path = node.state.path || "";
  const parts = path.split(".");
  const branchIdx = parts.length >= 2 ? parseInt(parts[1], 10) : 0;
  return BRANCH_COLORS[branchIdx % BRANCH_COLORS.length];
}

function makeDarkStyle(id) {
  return `
    .markmap {
      background: transparent;
    }
    .markmap-node text {
      fill: #e5e7eb;
    }
    .markmap-link {
      stroke-opacity: 0.85;
    }
  `;
}

function makeLightStyle(id) {
  return `
    .markmap {
      background: transparent;
    }
    .markmap-node text {
      fill: #1e293b;
    }
    .markmap-link {
      stroke-opacity: 0.85;
    }
  `;
}

/**
 * Walk the initialised markmap tree and set `payload.fold` on every node
 * based on its depth.  level = -1 → fully expanded; otherwise fold nodes
 * where `depth >= level`.
 */
function setFoldByDepth(root, level) {
  if (!root) return;
  (function walk(node) {
    const depth = node.state?.depth ?? 0;
    const shouldFold = level >= 0 && depth >= level && node.children?.length;
    node.payload = { ...node.payload, fold: shouldFold ? 1 : 0 };
    if (node.children) node.children.forEach(walk);
  })(root);
}

export function MarkmapPane({ model, theme, themeMode }) {
  const rootRef = React.useRef(null);
  const svgRef = React.useRef(null);
  const mmRef = React.useRef(null);
  const [expandLevel, setExpandLevel] = React.useState(-1);
  const prevParsedRef = React.useRef(null);

  const maxD = React.useMemo(
    () => (model?.ok && model.parsed ? getMindmapMaxDepth(model.parsed) : 1),
    [model],
  );

  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg || mmRef.current) return;

    const mm = Markmap.create(svg, {
      autoFit: true,
      duration: 300,
      zoom: true,
      pan: true,
      scrollForPan: false,
      initialExpandLevel: -1,
      spacingHorizontal: 60,
      spacingVertical: 8,
      paddingX: 16,
      nodeMinHeight: 20,
      maxWidth: 260,
      fitRatio: 0.9,
      color: colorByBranch,
      style: themeMode === "dark" ? makeDarkStyle : makeLightStyle,
    });
    mmRef.current = mm;

    return () => {
      mm.destroy();
      mmRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const mm = mmRef.current;
    if (!mm) return;
    mm.setOptions({
      style: themeMode === "dark" ? makeDarkStyle : makeLightStyle,
    });
    mm.updateStyle();
    mm.renderData();
  }, [themeMode]);

  // Load new data only when model content actually changes
  React.useEffect(() => {
    const mm = mmRef.current;
    if (!mm || !model?.ok || !model.parsed) return;
    if (prevParsedRef.current === model.parsed) return;
    prevParsedRef.current = model.parsed;
    const data = toMarkmapData(model.parsed);
    mm.setData(data); // autoFit handles fit()
    setExpandLevel(-1);
  }, [model]);

  // Apply fold level in-place on the already-initialised tree
  React.useEffect(() => {
    const mm = mmRef.current;
    if (!mm?.state?.data) return;
    setFoldByDepth(mm.state.data, expandLevel);
    mm.renderData();
  }, [expandLevel]);

  const onZoomIn = React.useCallback(() => {
    const mm = mmRef.current;
    if (!mm) return;
    const cur = mm.svg.node().__zoom?.k ?? 1;
    mm.rescale(Math.min(4, cur * 1.25));
  }, []);

  const onZoomOut = React.useCallback(() => {
    const mm = mmRef.current;
    if (!mm) return;
    const cur = mm.svg.node().__zoom?.k ?? 1;
    mm.rescale(Math.max(0.1, cur / 1.25));
  }, []);

  const onFit = React.useCallback(() => {
    const mm = mmRef.current;
    if (mm) mm.fit();
  }, []);

  const fullLevel = maxD;
  const effectiveLevel = expandLevel === -1 ? fullLevel : expandLevel;
  const canFoldTier = model?.ok && maxD >= 2 && effectiveLevel > 1;
  const canExpandTier =
    model?.ok && maxD >= 2 && effectiveLevel < fullLevel;

  const onFoldOneDepth = React.useCallback(() => {
    setExpandLevel((prev) => {
      if (maxD < 2) return prev;
      const cur = prev === -1 ? maxD : prev;
      if (cur <= 1) return prev;
      return cur - 1;
    });
  }, [maxD]);

  const onExpandOneDepth = React.useCallback(() => {
    setExpandLevel((prev) => {
      if (maxD < 2) return prev;
      const cur = prev === -1 ? maxD : prev;
      if (cur >= maxD) return prev;
      const next = cur + 1;
      return next >= maxD ? -1 : next;
    });
  }, [maxD]);

  return html`
    <div className="mindRoot markmapRoot" ref=${rootRef}>
      <div className="mindMapToolbar" aria-label="Map navigation">
        <button type="button" className="mindMapToolbarBtn"
          title="Zoom in (+)" onClick=${onZoomIn}>+</button>
        <button type="button" className="mindMapToolbarBtn"
          title="Zoom out (−)" onClick=${onZoomOut}>−</button>
        <button type="button" className="mindMapToolbarBtn mindMapToolbarBtnWide"
          title="Fit to view" onClick=${onFit}>Fit</button>
        <button
          type="button"
          className="mindMapToolbarBtn mindMapToolbarBtnWide"
          title="Collapse one level (hide the deepest visible tier)"
          disabled=${!canFoldTier}
          onClick=${onFoldOneDepth}
        >
          Tier−
        </button>
        <button
          type="button"
          className="mindMapToolbarBtn mindMapToolbarBtnWide"
          title="Expand one level (show the next tier)"
          disabled=${!canExpandTier}
          onClick=${onExpandOneDepth}
        >
          Tier+
        </button>
      </div>
      <svg ref=${svgRef} className="markmapSvg" />
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

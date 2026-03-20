import React from "https://esm.sh/react@18.3.1";
import htm from "https://esm.sh/htm@3.1.1";
import MindElixir from "https://cdn.jsdelivr.net/npm/mind-elixir/dist/MindElixir.js";

const html = htm.bind(React.createElement);

function safeMarkdown(md) {
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

// no-op: actual wheel handling is in attachWheelZoom (capture phase, non-passive)
function noopWheel() {}

function centerPoint(mind) {
  const r = mind.container.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function zoomInAtCenter(mind) {
  const next = Math.min(mind.scaleMax, mind.scaleVal + mind.scaleSensitivity);
  mind.scale(next, centerPoint(mind));
}

function zoomOutAtCenter(mind) {
  const next = Math.max(mind.scaleMin, mind.scaleVal - mind.scaleSensitivity);
  mind.scale(next, centerPoint(mind));
}

function resetZoomAndCenter(mind) {
  mind.scale(1, centerPoint(mind));
  mind.toCenter();
}

const PAN_STEP = 48;

function isTypingTarget(el) {
  if (!el || !el.closest) return false;
  return Boolean(
    el.closest(".cm-editor") ||
      el.closest("textarea") ||
      el.closest("input") ||
      el.closest("[contenteditable='true']"),
  );
}

/**
 * Own wheel handler registered with { passive: false } so preventDefault() actually
 * stops page scroll. MindElixir's internal handler is set to a no-op; all zoom/pan
 * from the wheel is done here in the capture phase.
 */
function attachWheelZoom(rootEl, getMind) {
  if (!rootEl) return () => {};
  const handler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const mind = getMind();
    if (!mind) return;
    if (e.shiftKey) {
      mind.move(-e.deltaY, 0);
      return;
    }
    const step = mind.scaleSensitivity;
    const next =
      e.deltaY < 0
        ? Math.min(mind.scaleMax, mind.scaleVal + step)
        : Math.max(mind.scaleMin, mind.scaleVal - step);
    mind.scale(next, { x: e.clientX, y: e.clientY });
  };
  rootEl.addEventListener("wheel", handler, { passive: false, capture: true });
  return () => {
    rootEl.removeEventListener("wheel", handler, { passive: false, capture: true });
  };
}

/**
 * Middle-button drag + optional left-button drag (when panModeRef is true).
 * Keyboard shortcuts for zoom / pan / reset.
 */
function attachViewportNavigation(mind, getMind, panModeRef) {
  const container = mind.container;
  const drag = { mode: null, pid: null, lastX: 0, lastY: 0 };

  const onPointerDown = (e) => {
    if (e.button === 1) {
      e.preventDefault();
      e.stopPropagation();
      drag.mode = "middle";
      drag.pid = e.pointerId;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      container.setPointerCapture(e.pointerId);
      container.style.cursor = "grabbing";
      return;
    }
    if (e.button === 0 && panModeRef.current) {
      e.preventDefault();
      e.stopPropagation();
      drag.mode = "left";
      drag.pid = e.pointerId;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      container.setPointerCapture(e.pointerId);
      container.style.cursor = "grabbing";
    }
  };

  const onPointerMove = (e) => {
    if (!drag.mode || e.pointerId !== drag.pid) return;
    const m = getMind();
    if (!m) return;
    const dx = e.clientX - drag.lastX;
    const dy = e.clientY - drag.lastY;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    if (dx !== 0 || dy !== 0) m.move(dx, dy);
  };

  const endPan = (e) => {
    if (drag.mode && e.pointerId === drag.pid) {
      drag.mode = null;
      drag.pid = null;
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      container.style.cursor = panModeRef.current ? "grab" : "";
    }
  };

  const onKeyDown = (e) => {
    if (e.defaultPrevented) return;
    if (isTypingTarget(e.target)) return;
    const m = getMind();
    if (!m) return;

    const step = m.scaleSensitivity;

    switch (e.code) {
      case "Equal":
      case "NumpadAdd":
        e.preventDefault();
        zoomInAtCenter(m);
        return;
      case "Minus":
      case "NumpadSubtract":
        e.preventDefault();
        zoomOutAtCenter(m);
        return;
      case "Digit0":
      case "Numpad0":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          resetZoomAndCenter(m);
        }
        return;
      case "ArrowUp":
        e.preventDefault();
        m.move(0, PAN_STEP);
        return;
      case "ArrowDown":
        e.preventDefault();
        m.move(0, -PAN_STEP);
        return;
      case "ArrowLeft":
        e.preventDefault();
        m.move(PAN_STEP, 0);
        return;
      case "ArrowRight":
        e.preventDefault();
        m.move(-PAN_STEP, 0);
        return;
      default:
        break;
    }
  };

  container.addEventListener("pointerdown", onPointerDown, true);
  container.addEventListener("pointermove", onPointerMove, true);
  container.addEventListener("pointerup", endPan, true);
  container.addEventListener("pointercancel", endPan, true);
  window.addEventListener("keydown", onKeyDown, true);

  return () => {
    container.removeEventListener("pointerdown", onPointerDown, true);
    container.removeEventListener("pointermove", onPointerMove, true);
    container.removeEventListener("pointerup", endPan, true);
    container.removeEventListener("pointercancel", endPan, true);
    window.removeEventListener("keydown", onKeyDown, true);
    container.style.cursor = "";
  };
}

/**
 * Click a node topic (ME-TPC) to collapse/expand its children.
 * Skips root (no parent) and leaf nodes (no children).
 * Tracks pointer movement to avoid toggling after a pan drag.
 */
function attachClickToToggle(rootEl, getMind) {
  let startX = 0, startY = 0, moved = false;

  const onPointerDown = (e) => {
    startX = e.clientX;
    startY = e.clientY;
    moved = false;
  };

  const onPointerMove = (e) => {
    if (!moved) {
      const dx = Math.abs(e.clientX - startX);
      const dy = Math.abs(e.clientY - startY);
      if (dx > 4 || dy > 4) moved = true;
    }
  };

  const onClick = (e) => {
    if (moved) return;
    const mind = getMind();
    if (!mind) return;

    let tpc = e.target;
    while (tpc && tpc.tagName !== "ME-TPC" && tpc !== rootEl) {
      tpc = tpc.parentElement;
    }
    if (!tpc || tpc.tagName !== "ME-TPC") return;

    const nodeObj = tpc.nodeObj;
    if (!nodeObj) return;
    if (!nodeObj.parent) return;
    if (!nodeObj.children?.length) return;

    mind.expandNode(tpc);
  };

  rootEl.addEventListener("pointerdown", onPointerDown);
  rootEl.addEventListener("pointermove", onPointerMove);
  rootEl.addEventListener("click", onClick);

  return () => {
    rootEl.removeEventListener("pointerdown", onPointerDown);
    rootEl.removeEventListener("pointermove", onPointerMove);
    rootEl.removeEventListener("click", onClick);
  };
}

function combineCleanups(...fns) {
  return () => {
    for (const fn of fns) {
      try {
        fn?.();
      } catch {
        /* ignore */
      }
    }
  };
}

function createMindOptions(theme, handleWheel) {
  return {
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
    handleWheel,
  };
}

export function MindmapPane({ model, theme, themeMode }) {
  const mindRootRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const mindRef = React.useRef(null);
  const navCleanupRef = React.useRef(null);
  const panModeRef = React.useRef(false);
  const [leftPanMode, setLeftPanMode] = React.useState(false);

  React.useEffect(() => {
    panModeRef.current = leftPanMode;
    const m = mindRef.current;
    if (m?.container) {
      m.container.style.cursor = leftPanMode ? "grab" : "";
    }
  }, [leftPanMode]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    navCleanupRef.current?.();
    navCleanupRef.current = null;
    el.innerHTML = "";

    const getMind = () => mindRef.current;
    const mind = new MindElixir({
      el,
      ...createMindOptions(theme, noopWheel),
    });
    mindRef.current = mind;

    const releaseWheelZoom = attachWheelZoom(mindRootRef.current, getMind);
    const releaseClickToggle = attachClickToToggle(mindRootRef.current, getMind);
    navCleanupRef.current = combineCleanups(
      releaseWheelZoom,
      releaseClickToggle,
      attachViewportNavigation(mind, getMind, panModeRef),
    );

    if (model?.ok) {
      try {
        mind.init(model.data);
      } catch {
        /* ignore */
      }
    }

    return () => {
      navCleanupRef.current?.();
      navCleanupRef.current = null;
      mindRef.current = null;
      el.innerHTML = "";
    };
  }, [theme, themeMode]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const mind = mindRef.current;
    if (!mind) return;
    if (!model?.ok) return;
    try {
      mind.refresh(model.data);
    } catch {
      try {
        mind.init(model.data);
      } catch {
        /* ignore */
      }
    }
  }, [model]);

  const onZoomIn = React.useCallback(() => {
    const m = mindRef.current;
    if (m) zoomInAtCenter(m);
  }, []);

  const onZoomOut = React.useCallback(() => {
    const m = mindRef.current;
    if (m) zoomOutAtCenter(m);
  }, []);

  const onZoom100 = React.useCallback(() => {
    const m = mindRef.current;
    if (m) resetZoomAndCenter(m);
  }, []);

  const onToggleLeftPan = React.useCallback(() => {
    setLeftPanMode((v) => !v);
  }, []);

  return html`
    <div className="mindRoot" ref=${mindRootRef}>
      <div className="mindMapToolbar" aria-label="Map navigation">
        <button
          type="button"
          className="mindMapToolbarBtn"
          title="Zoom in (scroll up, +, or Ctrl++)"
          onClick=${onZoomIn}
        >
          +
        </button>
        <button
          type="button"
          className="mindMapToolbarBtn"
          title="Zoom out (scroll down, −, or Ctrl+−)"
          onClick=${onZoomOut}
        >
          −
        </button>
        <button
          type="button"
          className="mindMapToolbarBtn mindMapToolbarBtnWide"
          title="100% zoom and re-center (Ctrl+0 or Cmd+0)"
          onClick=${onZoom100}
        >
          100%
        </button>
        <button
          type="button"
          className=${`mindMapToolbarBtn mindMapToolbarBtnWide ${leftPanMode ? "active" : ""}`}
          title="Drag with left button to pan (also: middle button drag, arrow keys)"
          onClick=${onToggleLeftPan}
          aria-pressed=${leftPanMode}
        >
          Pan
        </button>
      </div>
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

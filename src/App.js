import React from "https://esm.sh/react@18.3.1";
import htm from "https://esm.sh/htm@3.1.1";
import { EditorPane } from "./components/EditorPane.js";
import { MindmapPane } from "./components/MindmapPane.js";
import { MarkmapPane } from "./components/MarkmapPane.js";
import { decodeFromUrlHash, encodeToUrlHash } from "./persistence/urlHash.js";
import { loadFromLocalStorage, saveToLocalStorage } from "./persistence/localStorage.js";
import { EXAMPLES } from "./examples.js";
import { buildMindmapModel } from "./mindmap/buildMindmapModel.js";
import { useTheme } from "./theme/useTheme.js";
import { exportPng, exportSvg } from "./mindmap/export.js";

const USE_MARKMAP = import.meta.env.VITE_RENDERER === "markmap";

const html = htm.bind(React.createElement);

const STORAGE_KEY = "mindmap.mermaidText.v1";
const SPLIT_KEY = "mindmap.splitLeftPct.v1";

function useDebouncedEffect(effect, deps, delayMs) {
  React.useEffect(() => {
    const t = window.setTimeout(() => effect(), delayMs);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function App() {
  const { theme, setTheme, themeMode } = useTheme();

  const initialText = React.useMemo(() => {
    const fromHash = decodeFromUrlHash();
    if (fromHash) return fromHash;
    const fromLs = loadFromLocalStorage(STORAGE_KEY);
    if (fromLs) return fromLs;
    return EXAMPLES.mindMapping;
  }, []);

  const [text, setText] = React.useState(initialText);
  const [activeExample, setActiveExample] = React.useState("mindMapping");
  const [leftPct, setLeftPct] = React.useState(() => {
    const raw = localStorage.getItem(SPLIT_KEY);
    const n = raw ? Number(raw) : 40;
    if (!Number.isFinite(n)) return 40;
    return Math.max(20, Math.min(70, n));
  });
  const dragRef = React.useRef({ dragging: false, startX: 0, startPct: 40 });

  const model = React.useMemo(() => buildMindmapModel(text), [text]);

  useDebouncedEffect(
    () => saveToLocalStorage(STORAGE_KEY, text),
    [text],
    250,
  );

  useDebouncedEffect(
    () => saveToLocalStorage(SPLIT_KEY, String(leftPct)),
    [leftPct],
    250,
  );

  const onResetExample = React.useCallback(() => {
    const exampleText = EXAMPLES[activeExample] ?? EXAMPLES.mindMapping;
    setText(exampleText);
  }, [activeExample]);

  const onCopyShareLink = React.useCallback(async () => {
    const url = encodeToUrlHash(text);
    await navigator.clipboard.writeText(url);
  }, [text]);

  const onExportSvg = React.useCallback(async () => {
    await exportSvg(document.querySelector("[data-export-root='mindmap']"));
  }, []);

  const onExportPng = React.useCallback(async () => {
    await exportPng(document.querySelector("[data-export-root='mindmap']"));
  }, []);

  const onDividerDown = React.useCallback((e) => {
    e.preventDefault();
    dragRef.current = { dragging: true, startX: e.clientX, startPct: leftPct };
    document.body.classList.add("draggingColResize");
  }, [leftPct]);

  React.useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current.dragging) return;
      const root = document.querySelector(".split");
      if (!root) return;
      const rect = root.getBoundingClientRect();
      const dx = e.clientX - dragRef.current.startX;
      const pctDelta = (dx / rect.width) * 100;
      const next = Math.max(20, Math.min(70, dragRef.current.startPct + pctDelta));
      setLeftPct(next);
    };
    const onUp = () => {
      if (!dragRef.current.dragging) return;
      dragRef.current.dragging = false;
      document.body.classList.remove("draggingColResize");
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return html`
    <div className=${`app theme-${themeMode}`} data-theme=${themeMode}>
      <header className="topbar">
        <div className="topbarLeft">
          <div className="brand">Mindmap</div>
          <div className="subtitle">Mermaid syntax → beautiful mindmap</div>
        </div>
        <div className="topbarRight">
          <select
            className="select"
            value=${activeExample}
            onChange=${(e) => setActiveExample(e.target.value)}
            title="Examples"
          >
            <option value="mindMapping">What is mind mapping?</option>
            <option value="cafe">Cafe</option>
            <option value="complex">Complex</option>
          </select>
          <button className="btn" onClick=${onResetExample} title="Reset">
            Reset
          </button>
          <button className="btn" onClick=${onCopyShareLink} title="Copy share link">
            Copy link
          </button>
          <button className="btn" onClick=${onExportSvg} title="Export SVG">
            Export SVG
          </button>
          <button className="btn" onClick=${onExportPng} title="Export PNG">
            Export PNG
          </button>
          <div className="segmented" role="group" aria-label="Theme">
            <button
              className=${`segBtn ${themeMode === "light" ? "active" : ""}`}
              onClick=${() => setTheme("light")}
            >
              Light
            </button>
            <button
              className=${`segBtn ${themeMode === "dark" ? "active" : ""}`}
              onClick=${() => setTheme("dark")}
            >
              Dark
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div
          className="split"
          role="application"
          style=${{ gridTemplateColumns: `${leftPct}% 6px ${100 - leftPct}%` }}
        >
          <div className="pane paneLeft">
            <${EditorPane} value=${text} onChange=${setText} error=${model.error} />
          </div>
          <div className="divider dividerDraggable" onMouseDown=${onDividerDown} />
          <div className="pane paneRight" data-export-root="mindmap">
            ${USE_MARKMAP
              ? html`<${MarkmapPane}
                  model=${model}
                  theme=${theme}
                  themeMode=${themeMode}
                />`
              : html`<${MindmapPane}
                  model=${model}
                  theme=${theme}
                  themeMode=${themeMode}
                />`}
          </div>
        </div>
      </main>
    </div>
  `;
}


import React from "https://esm.sh/react@18.3.1";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
} from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { indentOnInput } from "@codemirror/language";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";

function useThemeMode() {
  const [mode, setMode] = React.useState(() => {
    return document.documentElement.getAttribute("data-theme") || "light";
  });
  React.useEffect(() => {
    const obs = new MutationObserver(() => {
      setMode(document.documentElement.getAttribute("data-theme") || "light");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return mode;
}

export function MermaidEditor({ value, onChange }) {
  const hostRef = React.useRef(null);
  const viewRef = React.useRef(null);
  const themeMode = useThemeMode();

  React.useEffect(() => {
    if (!hostRef.current) return;
    if (viewRef.current) return;

    const state = EditorState.create({
      doc: value ?? "",
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        indentOnInput(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        markdown(),
        EditorView.updateListener.of((update) => {
          if (!update.docChanged) return;
          onChange(update.state.doc.toString());
        }),
        EditorView.theme(
          {
            "&": { height: "100%" },
            ".cm-scroller": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
            ".cm-content": { fontSize: "13px", lineHeight: "1.45" },
            ".cm-lineNumbers": { color: "rgba(100,116,139,0.9)" },
          },
          { dark: false },
        ),
        themeMode === "dark" ? oneDark : [],
      ],
    });

    viewRef.current = new EditorView({ state, parent: hostRef.current });
    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value ?? "" },
    });
  }, [value]);

  // CodeMirror theme updates by rebuilding is expensive; keep stable. We only
  // apply oneDark on first mount based on current theme mode.
  void themeMode;

  return React.createElement("div", { ref: hostRef, style: { height: "100%" } });
}


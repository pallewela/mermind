import React from "https://esm.sh/react@18.3.1";
import htm from "https://esm.sh/htm@3.1.1";
import { MermaidEditor } from "./MermaidEditor.js";

const html = htm.bind(React.createElement);

export function EditorPane({ value, onChange, error }) {
  return html`
    <div className="editorWrap">
      <div className="editorHeader">
        <div>
          <div className="editorTitle">Mermaid mindmap syntax</div>
          <div className="editorHint">
            Type Mermaid-style mindmap text. Right pane renders a prettier mindmap (not Mermaid).
          </div>
        </div>
      </div>
      <div className="editor">
        <${MermaidEditor} value=${value} onChange=${onChange} />
      </div>
      ${error
        ? html`<div className="errorBar"><strong>Parse error:</strong> ${error.message}</div>`
        : null}
    </div>
  `;
}


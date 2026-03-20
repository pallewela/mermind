import "./styles.css";
import React from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import htm from "https://esm.sh/htm@3.1.1";
import { App } from "./App.js";

const html = htm.bind(React.createElement);

createRoot(document.getElementById("root")).render(html`<${App} />`);


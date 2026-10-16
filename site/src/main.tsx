import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/noto-sans/wght.css";
import "./styles.css";
import "./glyph";
import "./look";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

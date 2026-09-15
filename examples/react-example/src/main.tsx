import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@zaptime/react/style.css";
import "./style.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

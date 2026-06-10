import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ZaptimeCalendar } from "./ZaptimeCalendar";
import "./styles.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("#root not found");

createRoot(rootEl).render(
  <StrictMode>
    <main className="page">
      <h1>Zaptime · React example</h1>
      <p className="subtitle">
        A headless calendar booking flow built entirely on{" "}
        <code>@zaptime/react-core</code> hooks.
      </p>
      {/* Uses the public demo token baked into @zaptime/core defaults. */}
      <ZaptimeCalendar
        config={{ token: "oG77Ft7Wv6v9stJTOw8cbMmW7zENDzXl" }}
      />
    </main>
  </StrictMode>,
);

import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { act } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useCalendarInstance, useCalendar } from "../src/entry";
it("renders inert deterministic markup and hydrates without mismatch", async () => {
  const fetch = vi.fn<typeof globalThis.fetch>(() => new Promise(() => {}));
  const schedule = vi.fn();
  const errors: unknown[] = [];
  function App() {
    const c = useCalendarInstance({ config: { token: "ssr" }, runtime: { fetch, schedule } });
    const { state } = useCalendar(c);
    return <div>{state.loading ? "Loading" : "Calendar"}</div>;
  }
  const html = renderToString(<App />);
  expect(fetch).not.toHaveBeenCalled();
  expect(schedule).not.toHaveBeenCalled();
  expect(renderToString(<App />)).toBe(html);
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.append(container);
  let root: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(container, <App />, { onRecoverableError: (error) => errors.push(error) });
  });
  expect(errors).toEqual([]);
  expect(fetch).toHaveBeenCalledTimes(1);
  await act(async () => root!.unmount());
  container.remove();
});

import { test, expect, mockCalendar } from "./fixtures";
test("complete calendars render selection and independent roots", async ({ page, fixtureRequests }) => {
  await page.goto("/calendar?multiple");
  await expect(page.getByTestId("complete-calendar").getByText(/May/i).first()).toBeVisible();
  await expect(page.getByTestId("second-complete-calendar").getByText(/May/i).first()).toBeVisible();
  expect(fixtureRequests.filter((request) => request.path === "/event-types/init")).toHaveLength(2);
});
for (const scenario of ["disabled", "error", "empty"] as const) {
  test(`complete calendar ${scenario} state`, async ({ page }) => {
    await mockCalendar(page, scenario);
    await page.goto("/calendar");
    const calendar = page.getByTestId("complete-calendar");
    if (scenario === "error") {
      await expect(calendar.getByRole("alert")).toBeVisible();
      await expect(calendar).not.toContainText(/January\s*1970/);
    } else await expect(calendar).toContainText(scenario === "empty" ? /no.*(?:time|slot|availab)/i : /(?:disabled|unavailable|not.*available)/i);
  });
}
test("stale availability cannot replace a newer month", async ({ page, fixtureRequests }) => {
  await page.goto("/headless");
  await expect(page.getByRole("heading", { name: "May 2030" })).toBeVisible();
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/time-slots?**", async (route) => {
    if (new URL(route.request().url()).searchParams.get("from")?.startsWith("2030-06")) await pending;
    await route.fallback();
  });
  await page.getByRole("button", { name: "Next month" }).click();
  await page.getByRole("button", { name: "Next month" }).click();
  await expect(page.getByRole("heading", { name: "July 2030" })).toBeVisible();
  release();
  await expect(page.getByRole("button", { name: "Day 2", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "July 2030" })).toBeVisible();
  expect(fixtureRequests.length).toBeGreaterThan(2);
});

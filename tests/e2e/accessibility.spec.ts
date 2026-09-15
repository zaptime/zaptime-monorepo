import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";
for (const theme of ["light", "dark"])
  test(`complete calendar ${theme} has no serious or critical accessibility violations`, async ({ page, fixtureRequests }) => {
    await page.goto(`/calendar?${theme === "dark" ? "dark" : ""}`);
    await expect(page.getByTestId("complete-calendar").getByText(/May/i).first()).toBeVisible();
    const report = await new AxeBuilder({ page }).include('[data-testid="complete-calendar"]').analyze();
    expect(report.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))).toEqual([]);
    expect(fixtureRequests.length).toBeGreaterThan(0);
  });
test("headless email fields support keyboard navigation at 200 percent zoom", async ({ page, fixtureRequests }) => {
  await page.goto("/headless");
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  const email = page.getByRole("textbox", { name: "Email", exact: true });
  await email.focus();
  await page.keyboard.type("keyboard@example.test");
  await expect(email).toHaveValue("keyboard@example.test");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Billing email", { exact: true })).toBeFocused();
  expect(fixtureRequests.length).toBeGreaterThan(0);
});
test("complete free booking supports keyboard selection and submission", async ({ page, fixtureRequests }) => {
  await page.goto("/calendar");
  const calendar = page.getByTestId("complete-calendar");
  const day = calendar.getByRole("button", { name: /^(?:2|May 2, 2030)$/ }).first();
  await day.focus();
  await page.keyboard.press("Enter");
  async function tabTo(target: ReturnType<typeof page.locator>) {
    for (let n = 0; n < 60; n++) {
      if (await target.evaluateAll((elements) => elements.includes(document.activeElement as HTMLElement))) return;
      await page.keyboard.press("Tab");
    }
    await expect(target).toBeFocused();
  }
  const time = calendar.getByRole("button", { name: /^10:00/ });
  await tabTo(time);
  await page.keyboard.press("Enter");
  await tabTo(calendar.getByRole("button", { name: /pick.*time/i }));
  await page.keyboard.press("Enter");
  await expect(calendar.getByRole("textbox", { name: "First name", exact: true })).toBeVisible();
  await tabTo(calendar.getByRole("textbox", { name: "First name", exact: true }));
  await page.keyboard.type("Ada");
  await tabTo(calendar.getByRole("textbox", { name: "Email", exact: true }));
  await page.keyboard.type("keyboard@example.test");
  await tabTo(calendar.getByRole("button", { name: "Confirm booking", exact: true }));
  await page.keyboard.press("Enter");
  await expect(calendar.getByRole("textbox", { name: "Email", exact: true })).toHaveCount(0);
  await expect(calendar.getByRole("heading", { level: 2 })).toBeVisible();
  expect(fixtureRequests.filter((request) => request.path === "/reservations")).toHaveLength(1);
});
test("reduced motion and mobile width preserve usable calendar controls", async ({ page, fixtureRequests }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/calendar?compact");
  const calendar = page.getByTestId("complete-calendar");
  await expect(calendar.getByText(/May/i).first()).toBeVisible();
  const bounds = await calendar.boundingBox();
  expect(bounds!.width).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(fixtureRequests.length).toBeGreaterThan(0);
});

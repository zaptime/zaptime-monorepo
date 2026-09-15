import { test, expect, mockCalendar, fillCompleteBooking } from "./fixtures";
for (const viewport of [
  { name: "desktop", width: 1280, height: 1000 },
  { name: "mobile", width: 390, height: 844 },
]) {
  for (const variant of ["light", "dark", "compact", "long-locale", "disabled", "error", "empty"] as const) {
    test(`${viewport.name} ${variant} appearance`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await mockCalendar(page, ["long-locale", "disabled", "error", "empty"].includes(variant) ? (variant as "long-locale" | "disabled" | "error" | "empty") : "free");
      await page.goto(`/calendar?${variant === "dark" ? "dark" : variant === "compact" ? "compact" : ""}`);
      const calendar = page.getByTestId("complete-calendar");
      if (variant === "error") {
        await expect(calendar.getByRole("alert")).toBeVisible();
        await expect(calendar).not.toContainText(/January\s*1970/);
      } else if (variant === "disabled") await expect(calendar).toContainText(/disabled|unavailable/i);
      else await expect(calendar.getByText(/May|June/i).first()).toBeVisible();
      if (variant === "empty")
        await expect(
          calendar
            .getByText(/no.*time.*slot.*available/i)
            .filter({ visible: true })
            .first(),
        ).toBeVisible();
      if (variant === "long-locale" && viewport.name === "mobile") {
        await calendar
          .getByRole("button", { name: /^(?:2|May 2, 2030)$/ })
          .first()
          .click();
        await expect(calendar.getByText("Please choose the appointment time that is most convenient for your schedule")).toBeVisible();
      }
      await page.evaluate(() => document.fonts.ready);
      if (viewport.name === "mobile") expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(calendar).toHaveScreenshot(`${viewport.name}-${variant}.png`, { animations: "disabled", maxDiffPixels: 100 });
    });
  }
  for (const state of ["loading", "success", "recovery"] as const) {
    test(`${viewport.name} ${state} appearance`, async ({ page, fixtureRequests }) => {
      await page.setViewportSize(viewport);
      const calendar = page.getByTestId("complete-calendar");
      if (state === "loading") {
        let requested!: () => void;
        const requestStarted = new Promise<void>((resolve) => {
          requested = resolve;
        });
        await page.route("**/event-types/init", async () => {
          requested();
        });
        await page.goto("/calendar");
        await requestStarted;
        await expect(calendar.getByRole("status")).toBeVisible();
      } else {
        if (state === "recovery") await page.route("**/reservations", (route) => route.abort("failed"));
        await page.goto("/calendar");
        await fillCompleteBooking(page);
        await calendar.getByRole("button", { name: "Confirm booking", exact: true }).click();
        if (state === "success") {
          await expect(calendar.getByRole("textbox", { name: "Email", exact: true })).toHaveCount(0);
          await expect(calendar.getByRole("heading", { level: 2 })).toBeVisible();
          expect(fixtureRequests.filter((request) => request.path === "/reservations")).toHaveLength(1);
        } else {
          await expect(calendar.getByRole("alert")).toBeVisible();
          await expect(calendar.getByRole("button", { name: "Confirm booking", exact: true })).toBeDisabled();
        }
      }
      await page.evaluate(() => document.fonts.ready);
      if (viewport.name === "mobile") expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(calendar).toHaveScreenshot(`${viewport.name}-${state}.png`, { animations: "disabled", maxDiffPixels: 100 });
    });
  }
}

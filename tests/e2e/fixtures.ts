import { test as base, expect, type Page } from "@playwright/test";
import { initData, customFields, reservationResponse, slot } from "../contracts/fixtures";
export type Scenario = "free" | "disabled" | "error" | "confirmation-error" | "empty" | "long-locale";
export async function mockCalendar(page: Page, scenario: Scenario = "free") {
  await page.clock.setFixedTime(new Date("2030-05-01T09:00:00Z"));
  const requests: { method: string; path: string; body: unknown }[] = [];
  await page.route("https://booking.example.test/**", async (route) => {
    const request = route.request(),
      url = new URL(request.url());
    requests.push({ method: request.method(), path: url.pathname, body: request.postDataJSON() });
    if (url.pathname === "/event-types/init") {
      if (scenario === "error") return route.fulfill({ status: 500, json: { success: false } });
      return route.fulfill({
        json: {
          success: true,
          data: {
            ...initData,
            disabled: scenario === "disabled",
            customFields: customFields.filter((field) => ["field-first-name", "field-email"].includes(field.uuid)).map((field) => ({ ...field, value: "" })),
            ...(scenario === "long-locale" ? { configuration: { locale: { preset: "en", texts: { choosePreferredTime: "Please choose the appointment time that is most convenient for your schedule" } } } } : {}),
          },
        },
      });
    }
    if (url.pathname === "/time-slots") {
      const month = url.searchParams.get("from")?.slice(0, 7) ?? "2030-05";
      return route.fulfill({
        json: {
          success: true,
          data: scenario === "empty" ? [] : [2, 3, 9].map((day) => ({ ...slot, start: `${month}-${String(day).padStart(2, "0")}T10:00:00Z`, end: `${month}-${String(day).padStart(2, "0")}T10:30:00Z` })),
        },
      });
    }
    if (scenario === "confirmation-error" && url.pathname.endsWith("/confirm")) return route.fulfill({ status: 500, json: { success: false } });
    if (url.pathname.startsWith("/reservations")) return route.fulfill({ json: reservationResponse });
    return route.abort("blockedbyclient");
  });
  return requests;
}
export const test = base.extend<{ fixtureRequests: Awaited<ReturnType<typeof mockCalendar>> }>({
  fixtureRequests: async ({ page }, use) => {
    await use(await mockCalendar(page));
  },
});
export { expect };

/** Drives the published complete UI through its shared two-step time selection. */
export async function fillCompleteBooking(page: Page) {
  const calendar = page.getByTestId("complete-calendar");
  await expect(calendar.getByText(/May/i).first()).toBeVisible();
  await calendar
    .getByRole("button", { name: /^(?:2|May 2, 2030)$/ })
    .first()
    .click();
  await calendar.getByRole("button", { name: /^10:00/ }).click();
  await calendar.getByRole("button", { name: /pick.*time/i }).click();
  await calendar.getByRole("textbox", { name: "First name", exact: true }).fill("Ada");
  await calendar.getByRole("textbox", { name: "Email", exact: true }).fill("ada@example.test");
  await expect(calendar.getByRole("textbox", { name: "First name", exact: true })).toHaveValue("Ada");
  await expect(calendar.getByRole("textbox", { name: "Email", exact: true })).toHaveValue("ada@example.test");
  return calendar;
}

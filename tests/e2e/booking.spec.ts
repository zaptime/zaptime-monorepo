import { test, expect, fillCompleteBooking } from "./fixtures";
test("complete free booking reaches success and sends one reservation", async ({ page, fixtureRequests }) => {
  await page.goto("/calendar");
  const calendar = await fillCompleteBooking(page);
  await calendar.getByRole("button", { name: "Confirm booking", exact: true }).click();
  await expect(calendar.getByRole("textbox", { name: "Email", exact: true })).toHaveCount(0);
  await expect(calendar.getByRole("heading", { level: 2 })).toBeVisible();
  const bookings = fixtureRequests.filter((request) => request.method === "POST" && request.path === "/reservations");
  expect(bookings).toHaveLength(1);
  expect(bookings[0].body).toMatchObject({ firstname: "Ada", email: "ada@example.test", start: "2030-05-02T10:00:00Z" });
});
test("headless external submission sends legacy wire fields once", async ({ page, fixtureRequests }) => {
  await page.goto("/headless");
  await page.getByRole("textbox", { name: "First name", exact: true }).fill("Ada");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("ada@example.test");
  await page.getByRole("button", { name: /^10:00/ }).click();
  await page.getByRole("button", { name: "Confirm booking" }).click();
  await expect(page.getByTestId("phase")).toHaveText("success");
  const bookings = fixtureRequests.filter((request) => request.method === "POST" && request.path === "/reservations");
  expect(bookings).toHaveLength(1);
  expect(bookings[0].body).toMatchObject({ firstname: "Ada", email: "ada@example.test", start: "2030-05-02T10:00:00Z" });
});
test("unmounting and reopening a complete calendar starts a fresh session", async ({ page, fixtureRequests }) => {
  await page.goto("/calendar");
  await expect(page.getByTestId("complete-calendar").getByText(/May/i).first()).toBeVisible();
  await page.getByRole("button", { name: "Close calendar" }).click();
  await expect(page.getByTestId("complete-calendar")).toHaveCount(0);
  await page.getByRole("button", { name: "Open calendar" }).click();
  await expect(page.getByTestId("complete-calendar").getByText(/May/i).first()).toBeVisible();
  expect(fixtureRequests.filter((request) => request.path === "/event-types/init")).toHaveLength(2);
});

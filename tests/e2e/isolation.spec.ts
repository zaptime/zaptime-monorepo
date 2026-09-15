import { test, expect } from "./fixtures";
test("booking fields stay inside their calendar", async ({ page, fixtureRequests }) => {
  await page.goto("/multiple-calendars");
  const first = page.getByTestId("calendar-a"),
    second = page.getByTestId("calendar-b");
  await first.getByLabel("Email", { exact: true }).fill("first@example.test");
  await expect(second.getByLabel("Email", { exact: true })).toHaveValue("");
  await first.getByLabel("Billing email", { exact: true }).fill("billing@example.test");
  await expect(second.getByLabel("Billing email", { exact: true })).toHaveValue("");
  expect(fixtureRequests.filter((request) => request.path === "/event-types/init")).toHaveLength(2);
});
test("explicitly shared consumers observe the same input", async ({ page, fixtureRequests }) => {
  await page.goto("/shared-calendar");
  const emails = page.getByLabel("Email", { exact: true });
  await emails.first().fill("shared@example.test");
  await expect(emails.last()).toHaveValue("shared@example.test");
  expect(fixtureRequests.filter((request) => request.path === "/event-types/init")).toHaveLength(1);
});
test("hiding a child retains its owner inputs and does not initialize again", async ({ page, fixtureRequests }) => {
  await page.goto("/headless");
  await page.getByLabel("Email", { exact: true }).fill("kept@example.test");
  await page.getByRole("button", { name: "Hide fields" }).click();
  await expect(page.getByLabel("Email", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Show fields" }).click();
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("kept@example.test");
  expect(fixtureRequests.filter((request) => request.path === "/event-types/init")).toHaveLength(1);
});
test("changing booking identity resets editable inputs", async ({ page, fixtureRequests }) => {
  await page.goto("/headless");
  await page.getByLabel("Email", { exact: true }).fill("old@example.test");
  await page.getByRole("button", { name: "Change event" }).click();
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("");
  expect(fixtureRequests.filter((request) => request.path === "/event-types/init")).toHaveLength(2);
});

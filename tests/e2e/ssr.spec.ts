import { test, expect, mockCalendar } from "./fixtures";
test("Next renders loading on the server and hydrates without warnings", async ({ page, request }) => {
  const response = await request.get("/");
  const html = await response.text();
  expect(html).toMatch(/Loading/);
  expect(html).not.toMatch(/January 1970/);
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  const calls = await mockCalendar(page);
  await page.goto("/");
  await expect(page.getByText(/May 2030/)).toBeVisible();
  expect(errors.filter((error) => /hydrat|mismatch/i.test(error))).toEqual([]);
  expect(calls.filter((call) => call.path === "/event-types/init")).toHaveLength(1);
});

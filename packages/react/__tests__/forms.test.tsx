import { afterEach, expect, test } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createCalendar, type CustomField } from "@zaptime/core";
import { ZaptimeProvider } from "@zaptime/react-headless";
import { FormField } from "../src/components/FormField";
import { config } from "../../../tests/contracts/fixtures";
afterEach(cleanup);
import { formScenarios as scenarios } from "../../../tests/contracts/formScenarios";

for (const required of [true, false])
  for (const { type, value, role } of scenarios)
    test(`${required ? "required" : "optional"} ${type} preserves controlled values`, async () => {
      const calendar = createCalendar({ config });
      const field: CustomField = { uuid: "field", name: "field", label: "Field", type, required, options: ["First", "Second"], value };
      calendar.actions.setBookingForm([field]);
      render(
        <ZaptimeProvider calendar={calendar}>
          <FormField field={calendar.getSnapshot().bookingForm[0]} />
        </ZaptimeProvider>,
      );
      expect(screen.getByRole(role, { name: "Field" })).toBeTruthy();
      if (type === "checkbox" || type === "switch") {
        const input = screen.getByRole(role) as HTMLInputElement;
        expect(input.checked).toBe(false);
        expect(input.required).toBe(false);
        fireEvent.click(input);
        expect(calendar.getSnapshot().bookingForm[0].value).toBe(true);
      } else if (type === "radio") {
        fireEvent.click(screen.getByRole("radio", { name: "First" }));
        expect(calendar.getSnapshot().bookingForm[0].value).toBe("First");
      } else if (type !== "multiselect") {
        fireEvent.change(screen.getByRole(role), { target: { value: type === "number" ? "12" : type === "select" ? "First" : "updated@example.test" } });
        expect(calendar.getSnapshot().bookingForm[0].value).toBe(type === "number" ? 12 : type === "select" ? "First" : "updated@example.test");
      }
      await calendar.dispose();
    });

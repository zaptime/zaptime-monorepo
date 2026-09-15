import type { CustomField } from "@zaptime/core";

export const formScenarios: { type: CustomField["type"]; value: CustomField["value"]; role: string }[] = [
  { type: "text", value: "hello", role: "textbox" },
  { type: "email", value: "a@example.test", role: "textbox" },
  { type: "phone", value: "+420123456789", role: "textbox" },
  { type: "number", value: 0, role: "spinbutton" },
  { type: "textarea", value: "long note", role: "textbox" },
  { type: "switch", value: false, role: "switch" },
  { type: "checkbox", value: false, role: "checkbox" },
  { type: "select", value: "Second", role: "combobox" },
  { type: "multiselect", value: ["Second"], role: "group" },
  { type: "radio", value: "Second", role: "radiogroup" },
];

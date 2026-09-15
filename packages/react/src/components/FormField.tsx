import { useId } from "react";
import type { CustomField, DeepReadonly } from "@zaptime/core";
import { useBookingForm, useConfig } from "@zaptime/react-headless";
import { ConfigurationHtml } from "./ConfigurationHtml.js";
import { calendarMessages } from "../generated/messages.js";
export function FormField({ field, invalid }: { field: DeepReadonly<CustomField>; invalid?: boolean }) {
  const id = useId(),
    { setCustomFieldValue } = useBookingForm(),
    { config } = useConfig();
  const common = {
    id,
    name: field.name,
    "aria-invalid": invalid || undefined,
    "aria-describedby": invalid ? `${id}-error` : undefined,
    required: field.required,
    placeholder: field.placeholder,
    className: "cal-ui-input cal-mt-2",
  };
  const set = (value: Parameters<typeof setCustomFieldValue>[1]) => setCustomFieldValue(field.uuid, value);
  const boolean = field.type === "checkbox" || field.type === "switch";
  let control;
  if (boolean)
    control = (
      <input
        {...common}
        required={false}
        aria-required={field.required}
        className="cal-mr-2"
        type="checkbox"
        role={field.type === "switch" ? "switch" : undefined}
        checked={field.value === true}
        onChange={(e) => set(e.target.checked)}
      />
    );
  else if (field.type === "textarea") control = <textarea {...common} rows={3} value={String(field.value ?? "")} onChange={(e) => set(e.target.value)} />;
  else if (field.type === "select")
    control = (
      <select {...common} value={String(field.value ?? "")} onChange={(event) => set(event.target.value)}>
        <option value="">{field.placeholder ?? "—"}</option>
        {field.options?.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    );
  else if (field.type === "multiselect")
    control = (
      <div role="group" aria-labelledby={`${id}-label`} aria-required={field.required} className="cal-mt-2 cal-space-y-2">
        {field.options?.map((option, index) => (
          <label key={option} className="cal-flex cal-items-center cal-gap-2" htmlFor={`${id}-${index}`}>
            <input
              id={`${id}-${index}`}
              type="checkbox"
              checked={Array.isArray(field.value) && field.value.includes(option)}
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? `${id}-error` : undefined}
              onChange={(event) => {
                const values = Array.isArray(field.value) ? [...field.value] : [];
                set(event.target.checked ? [...values, option] : values.filter((value) => value !== option));
              }}
            />
            <ConfigurationHtml html={option} />
          </label>
        ))}
      </div>
    );
  else if (field.type === "radio")
    control = (
      <div role="radiogroup" aria-labelledby={`${id}-label`} aria-required={field.required} className="cal-mt-2 cal-space-y-2">
        {field.options?.map((o, i) => (
          <label key={o} className="cal-flex cal-items-center cal-gap-2" htmlFor={`${id}-${i}`}>
            <input id={`${id}-${i}`} name={id} type="radio" value={o} checked={field.value === o} onChange={() => set(o)} aria-invalid={invalid || undefined} />
            <ConfigurationHtml html={o} />
          </label>
        ))}
      </div>
    );
  else
    control = (
      <input
        {...common}
        type={field.type === "phone" ? "tel" : field.type}
        autoComplete={field.mergeTag === "FIRST_NAME" ? "given-name" : field.mergeTag === "LAST_NAME" ? "family-name" : field.mergeTag === "EMAIL" ? "email" : field.mergeTag === "PHONE" ? "tel" : undefined}
        value={String(field.value ?? "")}
        onChange={(e) => set(field.type === "number" && e.target.value !== "" ? Number(e.target.value) : e.target.value)}
      />
    );
  return (
    <div className="cal-mt-5">
      {boolean ? (
        <label htmlFor={id} className="cal-flex cal-items-center cal-text-sm">
          {control}
          <ConfigurationHtml html={field.label} />
        </label>
      ) : (
        <>
          <label id={`${id}-label`} htmlFor={field.type === "radio" || field.type === "multiselect" ? undefined : id} className="cal-block cal-text-sm cal-font-medium">
            <ConfigurationHtml html={field.label} />
            {field.required && <span aria-hidden="true"> *</span>}
          </label>
          {control}
        </>
      )}
      {invalid && (
        <p id={`${id}-error`} className="cal-mt-1 cal-text-sm cal-text-red-600">
          {calendarMessages(config.locale?.preset).invalidField}
        </p>
      )}
    </div>
  );
}

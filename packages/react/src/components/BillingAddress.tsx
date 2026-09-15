import { useId, useState } from "react";
import { useBillingAddress, useBookingForm, useConfig } from "@zaptime/react-headless";
import { countryCodes } from "../generated/countries.js";
import { calendarMessages } from "../generated/messages.js";
export function BillingAddress() {
  const { billingAddress, setBillingAddress, updateBillingAddressField } = useBillingAddress(),
    { collectFormValues } = useBookingForm(),
    { config } = useConfig(),
    [expanded, setExpanded] = useState(false),
    id = useId(),
    p = config.locale?.confirmationForm?.payments;
  function expand() {
    const fields = collectFormValues();
    setBillingAddress({
      ...billingAddress,
      name: billingAddress.name || [fields.firstName, fields.lastName].filter(Boolean).join(" "),
      email: billingAddress.email || fields.email,
      country: billingAddress.country || "CZ",
    });
    setExpanded(true);
  }
  const countryNames = new Intl.DisplayNames([config.locale?.preset ?? "en"], { type: "region" });
  const labels = {
    name: p?.name ?? "Name",
    email: p?.email ?? "Email",
    company: p?.company ?? "Company",
    address: p?.address ?? "Address",
    city: p?.city ?? "City",
    postalCode: p?.zip ?? "Postal code",
    country: p?.country ?? "Country",
    crn: p?.crn ?? "CRN",
    vatId: p?.vatId ?? "VAT ID",
  };
  return (
    <div className="cal-mt-5">
      {!expanded ? (
        <button type="button" className="cal-rounded-md cal-bg-theme-100 cal-px-3 cal-py-2 cal-text-sm dark:cal-bg-theme-700" onClick={expand}>
          {p?.showBillingDetails ?? calendarMessages(config.locale?.preset).billing}
        </button>
      ) : (
        <fieldset>
          <legend className="cal-font-medium">{calendarMessages(config.locale?.preset).billing}</legend>
          {Object.entries(labels).map(([key, label]) => (
            <label key={key} htmlFor={`${id}-${key}`} className="cal-mt-3 cal-block cal-text-sm">
              {label}
              {key === "country" ? (
                <select id={`${id}-${key}`} className="cal-ui-input cal-mt-1" value={billingAddress.country} onChange={(event) => updateBillingAddressField("country", event.target.value)}>
                  <option value="">—</option>
                  {countryCodes.map((code) => (
                    <option key={code} value={code}>
                      {countryNames.of(code) ?? code}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`${id}-${key}`}
                  className="cal-ui-input cal-mt-1"
                  type={key === "email" ? "email" : "text"}
                  value={billingAddress[key as keyof typeof billingAddress]}
                  onChange={(e) => updateBillingAddressField(key as keyof typeof billingAddress, e.target.value)}
                  maxLength={key === "country" ? 2 : undefined}
                />
              )}
            </label>
          ))}
        </fieldset>
      )}
    </div>
  );
}

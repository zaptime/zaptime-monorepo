import { useId } from "react";
import { useCurrentTimezone, useHourCycle } from "@zaptime/react-headless";
export function TimezonePicker() {
  const { timezone, setTimezone } = useCurrentTimezone(),
    { hourCycle, setHourCycle } = useHourCycle(),
    id = useId();
  const zones = Array.from(new Set([timezone, "UTC", ...(typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : ["Europe/Prague", "America/New_York"])]));
  return (
    <div className="cal-mt-6 cal-flex cal-flex-wrap cal-items-center cal-gap-3 cal-text-sm">
      <label className="cal-flex-1" htmlFor={id}>
        Timezone
        <select className="cal-ui-input cal-mt-1" id={id} value={timezone} onChange={(e) => void setTimezone(e.target.value).catch(() => {})}>
          {zones.map((z) => (
            <option key={z}>{z}</option>
          ))}
        </select>
      </label>
      <label htmlFor={`${id}-hours`}>
        24h
        <input id={`${id}-hours`} className="cal-ml-2" type="checkbox" checked={hourCycle === "h23" || hourCycle === "h24"} onChange={(e) => setHourCycle(e.target.checked ? "h23" : "h12")} />
      </label>
    </div>
  );
}

import { useConfig } from "@zaptime/react-headless";
import { calendarMessages } from "../generated/messages.js";
export function DisabledState() {
  const { config } = useConfig();
  return (
    <p role="status" className="cal-p-10 cal-text-center">
      {calendarMessages(config.locale?.preset).unavailable}
    </p>
  );
}

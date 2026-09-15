import { useConfig } from "@zaptime/react-headless";
import { calendarMessages } from "../generated/messages.js";
export function LoadingState() {
  const { config } = useConfig();
  return (
    <div role="status" className="cal-flex cal-min-h-[300px] cal-items-center cal-justify-center cal-text-theme-500">
      {calendarMessages(config.locale?.preset).loading}
    </div>
  );
}

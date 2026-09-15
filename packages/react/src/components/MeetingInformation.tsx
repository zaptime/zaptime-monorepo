import { useConfig, useLocations, useStripeConfig } from "@zaptime/react-headless";
import { locationOptions } from "../generated/locations.js";
import { ConfigurationHtml } from "./ConfigurationHtml.js";
export function MeetingInformation() {
  const { config } = useConfig(),
    { locations } = useLocations(),
    { stripeConfig } = useStripeConfig(),
    location = locations[0],
    platform = locationOptions.find((p) => p.id === location?.type);
  const visible = location && location.type !== "no-location" && !config.hideLocation;
  return (
    <header className="cal-mb-4">
      {config.profileImage && <img src={config.profileImage} alt="Host profile" className="cal-mx-auto cal-mb-4 cal-h-[96px] cal-w-[96px] cal-rounded-full cal-object-cover" />}
      {config.locale?.texts?.introduction && (
        <div className={`cal-w-full cal-text-center cal-text-theme-600 dark:cal-text-theme-200 ${config.profileImage ? "" : "cal-py-12"}`}>
          <ConfigurationHtml as="div" html={config.locale.texts.introduction} />
        </div>
      )}
      <div className="cal-mt-6 cal-flex cal-items-center cal-justify-between cal-gap-2 cal-text-sm cal-text-theme-600 dark:cal-text-theme-200">
        {visible && (
          <div className="cal-flex cal-items-center cal-gap-2">
            {platform && <span aria-hidden="true" className="cal-h-5 cal-w-5" dangerouslySetInnerHTML={{ __html: platform.icon }} />}
            <p>{location.type === "in-person" || location.type === "phone" ? location.value : (platform?.name ?? location.value)}</p>
          </div>
        )}
        {stripeConfig && <p className="cal-shrink-0">{new Intl.NumberFormat(config.locale?.preset, { style: "currency", currency: stripeConfig.currency }).format(stripeConfig.price / 100)}</p>}
      </div>
    </header>
  );
}

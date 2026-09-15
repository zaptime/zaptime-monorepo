import { useConfig, useLocations } from "@zaptime/react-headless";
export function MeetingInformation() {
  const { config } = useConfig(),
    { locations } = useLocations();
  return (
    <header className="cal-mb-4">
      {config.profileImage && <img src={config.profileImage} alt="Host profile" className="cal-mx-auto cal-mb-4 cal-h-[108px] cal-w-[108px] cal-rounded-full cal-object-cover" />}
      {config.locale?.texts?.introduction && <p className="cal-text-xl cal-font-medium">{config.locale.texts.introduction}</p>}
      {!config.hideLocation && locations.length === 1 && <p className="cal-mt-2 cal-text-sm cal-text-theme-500">{locations[0].value}</p>}
    </header>
  );
}

import IZapTimeTheme from './IZapTimeTheme';
import IZapTimeLocale from './IZapTimeLocale';

export default interface IZapTimeConfig {
  token: string;
  min?: number;
  max?: number;
  closestAvailableEvent?: number;
  locale?: IZapTimeLocale;
  theme?: IZapTimeTheme;
  profileImage?: string;
  externalBooking?: boolean;
  compact?: boolean;
}

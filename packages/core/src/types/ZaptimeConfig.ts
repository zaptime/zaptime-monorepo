import ZaptimeTheme from './ZaptimeTheme';
import ZaptimeLocale from './ZaptimeLocale';

export default interface ZaptimeConfig {
  token: string;
  min?: number;
  max?: number;
  closestBookableDay?: number;
  locale?: ZaptimeLocale;
  theme?: ZaptimeTheme;
  profileImage?: string;
  externalBooking?: boolean;
  compact?: boolean;
  apiBaseUrl?: string;
}

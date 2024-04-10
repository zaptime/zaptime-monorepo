import type ZaptimeConfig from './ZaptimeConfig';

export type ConfigWithoutToken = Omit<ZaptimeConfig, 'token'>;

export type Analytics = {
  name: string;
  data: Record<string, any>;
};

export type Location = {
  type: string;
  value: string;
  default?: boolean;
};

export type InitData = {
  configuration: ConfigWithoutToken;
  disabled: boolean;
  analytics: Analytics[];
  locations: Location[];
};

export type Success = InitData;
export type Errors = 'invalidToken';

import type ZaptimeConfig from './ZaptimeConfig';

export type ConfigWithoutToken = Omit<ZaptimeConfig, 'token'>;

type Analytics = {
  name: string;
  data: Record<string, any>;
};

export type InitData = {
  configuration: ConfigWithoutToken;
  disabled: boolean;
  analytics: Analytics[];
};

export type Success = InitData;
export type Errors = 'invalidToken';

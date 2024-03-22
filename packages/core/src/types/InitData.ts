import type ZaptimeConfig from './ZaptimeConfig';

export type ConfigWithoutToken = Omit<ZaptimeConfig, 'token'>;

export type InitData = {
  configuration: ConfigWithoutToken;
  disabled: boolean;
};

export type Success = InitData;
export type Errors = 'invalidToken';

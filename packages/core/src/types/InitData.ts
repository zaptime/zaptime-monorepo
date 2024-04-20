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
  analytics?: Analytics[];
  locations?: Location[];
  stripeConfig?: StripeConfig;
};

export type StripeConfig = {
  price: number;
  currency: string;
  stripeAccountId: string;
};

export type Success = InitData;
export type Errors = 'invalidToken';

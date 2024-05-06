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
  customFields?: CustomField[];
};

export type StripeConfig = {
  price: number;
  currency: string;
  stripeAccountId: string;
};

export type CustomFieldCollected = {
  uuid: string;
  value?: CustomFieldValue;
};

export type CustomFieldValue = string | number | boolean | string[];

export type CustomField = {
  label: string;
  name: string;
  uuid: string; // For BE validation
  type: 'text' | 'email' | 'phone' | 'number' | 'textarea' | 'switch' | 'checkbox' | 'select' | 'multiselect' | 'radio';
  required: boolean;
  mergeTag?: 'FIRST_NAME' | 'LAST_NAME' | 'EMAIL' | 'PHONE' | string;
  placeholder?: string;
  options?: string[];
  value?: CustomFieldValue;
};

export type Success = InitData;
export type Errors = 'invalidToken';

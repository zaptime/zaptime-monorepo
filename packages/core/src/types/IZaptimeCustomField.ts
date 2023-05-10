export type FieldType = 'select' | 'input';

export interface CustomFieldCollectedValue {
  name: string;
  value: unknown;
}

export interface CustomFieldBase {
  name: string;
  type: FieldType;
  label: string;
  placeholder: string;
}

export interface IZapTimeCustomFieldInput extends CustomFieldBase {
  type: 'input';
  value: string;
}

export interface IZapTimeCustomFieldSelect extends CustomFieldBase {
  type: 'select';
  options: { value: number | string; label: string }[];
  selectedValue: number;
}

export type IZapTimeCustomField = IZapTimeCustomFieldSelect | IZapTimeCustomFieldInput;

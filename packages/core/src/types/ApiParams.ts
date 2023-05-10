import { CustomFieldCollectedValue } from './IZaptimeCustomField';

export interface BookParamsOptions {
  email: string;
  firstName?: string;
  lastName?: string;
  calendarId?: string;
  seats?: number;
  customFields?: CustomFieldCollectedValue[];
}

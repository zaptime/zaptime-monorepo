import { ZaptimeConfig } from '@zaptime/core';
import type { EventTypeGroup } from './components/EventTypesGroup.vue';

type ConfigWithoutToken = Omit<ZaptimeConfig, 'token'>;

export async function fetchRemoteConfig(token: string): Promise<ZaptimeConfig> {
  if (token) {
    type Response = {
      success: boolean;
      data: {
        configuration: ConfigWithoutToken;
      };
    };

    const res = await fetch('https://api.zaptime.app/configuration', {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });

    const data: Response = await res.json();

    if (data.success) {
      return { ...data.data.configuration, ...{ token } };
    }
  }

  throw new Error('Invalid token');
}

export async function fetchRemoteGroupConfig(eventGroupToken: string): Promise<EventTypeGroup> {
  if (eventGroupToken) {
    type Response = {
      success: boolean;
      data: EventTypeGroup;
    };

    const res = await fetch('http://api.zaptime.app/event-type-groups/' + eventGroupToken);

    const data: Response = await res.json();

    if (data.success) {
      return data.data;
    }
  }

  throw new Error('Invalid token');
}

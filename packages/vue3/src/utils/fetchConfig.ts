import { ZaptimeConfig } from '@zaptime/core';
import { Ok, Err, Result } from 'ts-results';

type ConfigWithoutToken = Omit<ZaptimeConfig, 'token'>;

type InitData = {
  configuration: ConfigWithoutToken;
  disabled: boolean;
};

type Success = InitData;

type Errors = 'invalidToken';

export async function fetchRemoteConfig(token: string): Promise<Result<Success, Errors>> {
  if (token) {
    type Response = {
      success: boolean;
      data: InitData;
    };

    try {
      const res = await fetch('https://api.zaptime.app/event-types/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });

      const data: Response = await res.json();

      if (data.success) {
        return new Ok(data.data);
      }
    } catch (e) {
      return new Err('invalidToken');
    }
  }
  return new Err('invalidToken');
}

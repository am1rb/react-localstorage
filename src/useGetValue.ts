import * as React from 'react';
import { z } from 'zod';
import type { Options } from './types/Options';
import { eventEmitter } from './utils/eventEmitter';
import { safeReadValue } from './utils/safeReadValue';

type GetValue =
  | {
      isReady: false;
      value: null;
    }
  | {
      isReady: true;
      value: string | null;
    };

export function useGetValue<Schema extends z.ZodTypeAny>(
  key: string,
  options: Options<Schema>,
): GetValue {
  const optionsRef = React.useRef(options);

  optionsRef.current = options;

  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const handleStorageEvent = (event: StorageEvent) => {
        if (event.key === key) {
          optionsRef.current.storage.refresh?.(key);
          onChange();
        }
      };

      window.addEventListener('storage', handleStorageEvent);
      eventEmitter.on(key, handleStorageEvent);
      return () => {
        window.removeEventListener('storage', handleStorageEvent);
        eventEmitter.off(key, handleStorageEvent);
      };
    },
    [key],
  );

  const value = React.useSyncExternalStore<string | null | undefined>(
    subscribe,
    () => safeReadValue(key, options),
    () => undefined,
  );

  if (value === undefined) {
    return {
      isReady: false,
      value: null,
    };
  }

  return {
    isReady: true,
    value,
  };
}

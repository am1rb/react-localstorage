import * as React from 'react';
import { z } from 'zod';
import { Options } from './types/Options';
import { handleFailure } from './utils/handleFailure';
import { ReadStorageError } from './errors/ReadStorageError';
import { storageSchema } from './utils/storageSchema';
import { SchemaCheckError } from './errors/SchemaCheckError';

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
  options: Options<Schema>
): GetValue {
  const subscribe = React.useCallback(
    (onChange: () => void) => {
      const handleStorageEvent = (event: StorageEvent) => {
        if (event.key === key) {
          onChange();
        }
      };

      window.addEventListener('storage', handleStorageEvent);
      return () => window.removeEventListener('storage', handleStorageEvent);
    },
    [key]
  );

  const value = React.useSyncExternalStore<string | null | undefined>(
    subscribe,
    () => safeReadValue(key, options),
    () => undefined
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

export function safeReadValue<Schema extends z.ZodTypeAny>(
  key: string,
  options: Options<Schema>
) {
  const storedValue = readValue(key, options);

  const schemaCheck = storageSchema.getItem.safeParse(storedValue);
  if (schemaCheck.success) {
    return storedValue;
  }

  handleFailure(options.failurePolicy.schemaCheck, {
    error: () =>
      options.logger.error(
        `The storage.getItem must return a string or null; but returned ${typeof storedValue} for ${key}`
      ),
    exception: () => {
      throw new SchemaCheckError(
        `The storage.getItem must return a string or null; but returned ${typeof storedValue} for ${key}`
      );
    },
  });

  return null;
}

export function readValue<Schema extends z.ZodTypeAny>(
  key: string,
  { storage, logger, failurePolicy }: Options<Schema>
): string | null {
  try {
    return storage.getItem(key);
  } catch (error) {
    handleFailure(failurePolicy.readError, {
      error: () =>
        logger.error('Failed to read from storage for %s\n%o', key, error),
      exception: () => {
        throw new ReadStorageError(`Failed to read from storage for ${key}`);
      },
    });
  }

  return null;
}

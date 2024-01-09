import { z } from 'zod';
import { Options } from '../types/Options';
import { handleFailure } from './handleFailure';

export function safeReadValue<Schema extends z.ZodTypeAny>(
  key: string,
  options: Options<Schema>
): string | null {
  const storedValue = readValue(key, options);

  if (storedValue === null || typeof storedValue === 'string') {
    return storedValue;
  }

  handleFailure(options.failurePolicy.schemaCheck, {
    error: () =>
      options.logger.error(
        `The storage.getItem must return a string or null; but returned ${typeof storedValue} for ${key}`
      ),
    exception: () => {
      throw new Error(
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
        throw new Error(`Failed to read from storage for ${key}`);
      },
    });
  }

  return null;
}

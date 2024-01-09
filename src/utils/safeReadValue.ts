import { z } from 'zod';
import { Options } from '../types/Options';
import { storageSchema } from './storageSchema';
import { handleFailure } from './handleFailure';
import { SchemaCheckError } from '../errors/SchemaCheckError';
import { ReadStorageError } from '../errors/ReadStorageError';

export function safeReadValue<Schema extends z.ZodTypeAny>(
  key: string,
  options: Options<Schema>
): string | null {
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

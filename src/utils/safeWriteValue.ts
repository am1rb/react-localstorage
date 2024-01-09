import { z } from 'zod';
import { Options } from '../types/Options';
import { storageSchema } from './storageSchema';
import { handleFailure } from './handleFailure';

export function safeWriteValue<Schema extends z.ZodTypeAny>(
  key: string,
  value: string,
  options: Options<Schema>
): void {
  const schemaCheck = storageSchema.setItem.safeParse(value);

  if (schemaCheck.success) {
    writeValue(key, value, options);
    return;
  }

  handleFailure(options.failurePolicy.schemaCheck, {
    error: () =>
      options.logger.error(
        `The storage.setItem expects an string; but got ${typeof value} for ${key}`
      ),
    exception: () => {
      throw new Error(
        `The storage.setItem expects an string; but got ${typeof value} for ${key}`
      );
    },
  });
}

export function writeValue<Schema extends z.ZodTypeAny>(
  key: string,
  value: string,
  { storage, logger, failurePolicy }: Options<Schema>
): void {
  try {
    storage.setItem(key, value);
  } catch (error) {
    handleFailure(failurePolicy.writeError, {
      error: () =>
        logger.error('Failed to write to storage for %s\n%o', key, error),
      exception: () => {
        throw new Error(`Failed to write to storage for ${key}`);
      },
    });
  }
}

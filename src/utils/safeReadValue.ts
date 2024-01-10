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

  handleFailure(
    options.failurePolicy.schemaCheck,
    options.logger,
    `The storage.getItem must return a string or null; but returned ${typeof storedValue} for ${key}.`
  );

  return null;
}

export function readValue<Schema extends z.ZodTypeAny>(
  key: string,
  { storage, logger, failurePolicy }: Options<Schema>
): string | null {
  try {
    return storage.getItem(key);
  } catch (error) {
    handleFailure(
      failurePolicy.readError,
      logger,
      `Failed to read from storage for ${key}.`,
      error
    );
  }

  return null;
}

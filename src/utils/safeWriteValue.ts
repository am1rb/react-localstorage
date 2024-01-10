import { z } from 'zod';
import { Options } from '../types/Options';
import { handleFailure } from './handleFailure';

export function safeWriteValue<Schema extends z.ZodTypeAny>(
  key: string,
  value: string,
  options: Options<Schema>
): void {
  if (typeof value === 'string') {
    writeValue(key, value, options);
    return;
  }

  handleFailure(
    options.failurePolicy.schemaCheck,
    options.logger,
    `The storage.setItem expects an string; but got ${typeof value} for ${key}.`
  );
}

export function writeValue<Schema extends z.ZodTypeAny>(
  key: string,
  value: string,
  { storage, logger, failurePolicy }: Options<Schema>
): void {
  try {
    storage.setItem(key, value);
  } catch (error) {
    handleFailure(
      failurePolicy.writeError,
      logger,
      `Failed to write to storage for ${key}.`,
      error
    );
  }
}

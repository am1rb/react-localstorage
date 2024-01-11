import { z } from 'zod';
import type { Options } from '../types/Options';
import { handleFailure } from './handleFailure';

export function encodeValue<Schema extends z.ZodTypeAny>(
  key: string,
  value: z.infer<Schema>,
  options: Options<Schema>,
): string | null {
  const schemaCheck = options.schema.safeParse(value);

  if (schemaCheck.success) {
    return getEncodedValue(key, value, options);
  }

  handleFailure(
    options.failurePolicy.schemaCheck,
    options.logger,
    `The value's format does not match schema for ${key}.`,
  );

  return null;
}

export function getEncodedValue<Schema extends z.ZodTypeAny>(
  key: string,
  value: z.infer<Schema>,
  { serializer, failurePolicy, logger }: Options<Schema>,
): string | null {
  try {
    return serializer.encode(value);
  } catch (error) {
    handleFailure(
      failurePolicy.encodeError,
      logger,
      `Failed to encode value for ${key}.`,
      error,
    );
  }

  return null;
}

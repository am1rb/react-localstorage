import { z } from 'zod';
import type { Options } from '../types/Options';
import { handleFailure } from './handleFailure';
import { getDefaultValue } from './getDefaultValue';

export function decodeRawValue<Schema extends z.ZodTypeAny>(
  key: string,
  rawValue: string | null,
  options: Options<Schema>,
): z.infer<Schema> | undefined {
  const defaultValue = getDefaultValue(options.schema);

  if (rawValue === null) {
    return defaultValue;
  }

  const transformedRawValue = options.transform.storedValue(rawValue);
  const decodedValue = getDecodedValue(key, transformedRawValue, options);

  if (decodedValue === undefined) {
    return defaultValue;
  }

  const transformedDecodedValue = options.transform.decodedValue(decodedValue);
  const schemaCheck = options.schema.safeParse(transformedDecodedValue);

  if (schemaCheck.success) {
    return schemaCheck.data;
  }

  handleFailure(
    options.failurePolicy.schemaCheck,
    options.logger,
    `The stored data format does not match schema for ${key}.`,
  );

  return defaultValue;
}

function getDecodedValue<Schema extends z.ZodTypeAny>(
  key: string,
  rawValue: string,
  { serializer, failurePolicy, logger }: Options<Schema>,
): z.infer<Schema> | undefined {
  try {
    return serializer.decode(rawValue);
  } catch (error) {
    handleFailure(
      failurePolicy.decodeError,
      logger,
      `Failed to decode raw value for ${key}.`,
      error,
    );
  }

  return undefined;
}

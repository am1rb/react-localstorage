import { z } from 'zod';
import { Options } from '../types/Options';
import { handleFailure } from './handleFailure';
import { SchemaCheckError } from '../errors/SchemaCheckError';
import { DecodeDataError } from '../errors/DecodeDataError';
import { getDefaultValue } from './getDefaultValue';

export function decodeRawValue<Schema extends z.ZodTypeAny>(
  key: string,
  rawValue: string | null,
  options: Options<Schema>
): z.infer<Schema> | undefined {
  const defaultValue = getDefaultValue(options.schema);

  if (rawValue === null) {
    return defaultValue;
  }

  const decodedValue = getDecodedValue(key, rawValue, options);
  if (decodedValue === undefined) {
    return defaultValue;
  }

  const transformedValue = options.transformDecodedValue(decodedValue);
  const schemaCheck = options.schema.safeParse(transformedValue);

  if (schemaCheck.success) {
    return schemaCheck.data;
  }

  handleFailure(options.failurePolicy.schemaCheck, {
    error: () =>
      options.logger.error(
        `The stored data format does not match schema for ${key}`
      ),
    exception: () => {
      throw new SchemaCheckError(
        `The stored data format does not match schema for ${key}`
      );
    },
  });

  return defaultValue;
}

function getDecodedValue<Schema extends z.ZodTypeAny>(
  key: string,
  rawValue: string,
  { decoder, failurePolicy, logger }: Options<Schema>
): z.infer<Schema> | undefined {
  try {
    return decoder(rawValue);
  } catch (error) {
    handleFailure(failurePolicy.decodeError, {
      error: () =>
        logger.error('Failed to decode raw value for %s\n%o', key, error),
      exception: () => {
        throw new DecodeDataError(`Failed to decode raw value for ${key}`);
      },
    });
  }

  return undefined;
}

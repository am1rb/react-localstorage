import { z } from 'zod';
import { Options } from '../types/Options';
import { handleFailure } from './handleFailure';
import { EncodeDataError } from '../errors/EncodeDataError';
import { SchemaCheckError } from '../errors/SchemaCheckError';

export function encodeValue<Schema extends z.ZodTypeAny>(
  key: string,
  value: z.infer<Schema>,
  options: Options<Schema>
): string | null {
  const schemaCheck = options.schema.safeParse(value);

  if (schemaCheck.success) {
    return getEncodedValue(key, value, options);
  }

  handleFailure(options.failurePolicy.schemaCheck, {
    error: () =>
      options.logger.error(
        `The value\'s format does not match schema for ${key}`
      ),
    exception: () => {
      throw new SchemaCheckError(
        `The value\'s format does not match schema for ${key}`
      );
    },
  });

  return null;
}

export function getEncodedValue<Schema extends z.ZodTypeAny>(
  key: string,
  value: z.infer<Schema>,
  { encoder, failurePolicy, logger }: Options<Schema>
): string | null {
  try {
    return encoder(value);
  } catch (error) {
    handleFailure(failurePolicy.encodeError, {
      error: () =>
        logger.error('Failed to encode value for %s\n%o', key, error),
      exception: () => {
        throw new EncodeDataError(`Failed to encode value for ${key}`);
      },
    });
  }

  return null;
}

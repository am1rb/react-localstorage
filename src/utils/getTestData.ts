import { z } from 'zod';
import type { Options } from '../types/Options';
import type { FailurePolicy } from '../types/FailurePolicy';
import { getDefaultValue } from './getDefaultValue';

export const SAMPLE_KEY = 'sample-key';

export function getTestData({
  withDefaultValue = false,
  failurePolicy = 'exception',
}: {
  withDefaultValue?: boolean;
  failurePolicy?: FailurePolicy;
} = {}) {
  const schema = z.object({ id: z.number(), label: z.string() });
  const schemaWithDefault = schema.default({ id: 1, label: 'default value' });

  return createTestData({
    schema: withDefaultValue ? schemaWithDefault : schema,
    value: { id: 99, label: 'data in storage' },
    failurePolicy,
  });
}

interface TestDataOptions<Schema extends z.ZodTypeAny> {
  schema: Schema;
  value: z.infer<Schema>;
  failurePolicy: FailurePolicy;
}

interface TestData<Schema extends z.ZodTypeAny> {
  defaultValue: z.infer<Schema> | undefined;
  value: z.infer<Schema>;
  storedValue: {
    ok: string;
    decoderIncompatible: string;
    schemaIncompatible: string;
  };
  options: Options<Schema>;
}

const encode = JSON.stringify;
const decode = JSON.parse;

function createTestData<Schema extends z.ZodTypeAny>({
  schema,
  value,
  failurePolicy,
}: TestDataOptions<Schema>): TestData<Schema> {
  return {
    defaultValue: getDefaultValue(schema),
    value,
    storedValue: {
      ok: encode(value),
      decoderIncompatible: 'something incompatible with what decoder expects',
      schemaIncompatible: encode(true),
    },
    options: {
      schema,
      transformDecodedValue: (value) => value,
      storage: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(() => {}),
        removeItem: jest.fn(),
      },
      serializer: {
        decode,
        encode,
      },
      logger: {
        warn: jest.fn(),
        error: jest.fn(),
      },
      failurePolicy: {
        decodeError: failurePolicy,
        encodeError: failurePolicy,
        schemaCheck: failurePolicy,
        readError: failurePolicy,
        writeError: failurePolicy,
        removeError: failurePolicy,
      },
    },
  };
}

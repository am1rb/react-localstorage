import { z } from 'zod';
import { FailurePolicy } from './FailurePolicy';

export interface Options<Schema extends z.ZodTypeAny> {
  schema: Schema;
  transformDecodedValue: (decodedValue: unknown) => z.infer<Schema>;
  storage: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
  };
  serializer: {
    decode: (value: string) => z.infer<Schema>;
    encode: (value: z.infer<Schema>) => string;
  };
  logger: {
    error: typeof console.error;
  };
  failurePolicy: {
    decodeError: FailurePolicy;
    encodeError: FailurePolicy;
    schemaCheck: FailurePolicy;
    readError: FailurePolicy;
    writeError: FailurePolicy;
  };
}

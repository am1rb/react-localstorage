import { z } from 'zod';
import { FailurePolicy } from './FailurePolicy';

export interface Options<Schema extends z.ZodTypeAny> {
  decoder: (value: string) => z.infer<Schema>;
  encoder: (value: z.infer<Schema>) => string;
  schema: Schema;
  transformDecodedValue: (decodedValue: unknown) => z.infer<Schema>;
  storage: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
  };
  logger: {
    error: typeof console.error;
  };
  failurePolicy: {
    decodeError: FailurePolicy;
    encodeError: FailurePolicy;
    schemaCheck: FailurePolicy;
  };
}

import { z } from 'zod';
import type { DefaultOptions } from './DefaultOptions';

export interface Options<Schema extends z.ZodTypeAny> extends DefaultOptions {
  schema: Schema;
  transformDecodedValue: (decodedValue: unknown) => z.infer<Schema>;
  serializer: {
    decode: (value: string) => z.infer<Schema>;
    encode: (value: z.infer<Schema>) => string;
  };
}

import { z } from 'zod';
import type { DefaultOptions } from './DefaultOptions';

export interface Options<Schema extends z.ZodTypeAny> extends DefaultOptions<z.infer<Schema>> {
  schema: Schema;
}

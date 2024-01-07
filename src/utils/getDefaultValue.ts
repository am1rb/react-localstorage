import { z } from 'zod';

export function getDefaultValue<Schema extends z.ZodTypeAny>(
  schema: Schema
): z.infer<Schema> | undefined {
  if (schema instanceof z.ZodDefault) {
    return schema._def.defaultValue();
  }

  return undefined;
}

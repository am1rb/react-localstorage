import { z } from 'zod';

export function getDefaultValue<Schema extends z.ZodTypeAny>(
  schema: Schema,
): z.infer<Schema> | undefined {
  if (isInstanceOfZodDefault(schema)) {
    return schema._def.defaultValue();
  }

  return undefined;
}

function isInstanceOfZodDefault(
  schema: unknown,
): schema is z.ZodDefault<z.ZodTypeAny> {
  return typeof (schema as z.ZodTypeAny)._def.defaultValue === 'function';
}

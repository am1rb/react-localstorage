import * as React from 'react';
import { z } from 'zod';
import type { Options } from './types/Options';
import { decodeRawValue } from './utils/decodeRawValue';

export function useDecodeValue<Schema extends z.ZodTypeAny>(
  key: string,
  rawValue: string | null,
  options: Options<Schema>,
): z.infer<Schema> | undefined {
  return React.useMemo(
    () => decodeRawValue(key, rawValue, options),
    [rawValue],
  );
}

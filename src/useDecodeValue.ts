import * as React from 'react';
import { z } from 'zod';
import type { Options } from './types/Options';
import { decodeRawValue } from './utils/decodeRawValue';

export function useDecodeValue<Schema extends z.ZodTypeAny>(
  key: string,
  rawValue: string | null,
  options: Options<Schema>,
): z.infer<Schema> | undefined {
  const optionsRef = React.useRef(options);

  optionsRef.current = options;

  return React.useMemo(
    () => decodeRawValue(key, rawValue, optionsRef.current),
    [key, rawValue],
  );
}

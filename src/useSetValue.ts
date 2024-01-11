import * as React from 'react';
import { z } from 'zod';
import type { Options } from './types/Options';
import { safeWriteValue } from './utils/safeWriteValue';
import { encodeValue } from './utils/encodeValue';
import { eventEmitter } from './utils/eventEmitter';

type SetValueAPI<SetValue, OldValue> = (
  newValue: SetValue | ((oldValue: OldValue) => SetValue),
) => void;

export function useSetValue<Schema extends z.ZodTypeAny>(
  key: string,
  value: z.infer<Schema> | undefined,
  options: Options<Schema>,
): SetValueAPI<z.infer<Schema>, z.infer<Schema>> {
  return React.useCallback(
    (newValue) => {
      if (isFunction(newValue)) {
        setValue(key, newValue(value), options);
      } else {
        setValue(key, newValue, options);
      }
    },
    [key], // FIXME: check dependency warnings
  );
}

export function setValue<Schema extends z.ZodTypeAny>(
  key: string,
  value: z.infer<Schema>,
  options: Options<Schema>,
) {
  const encodedValue = encodeValue(key, value, options);

  if (encodedValue === null) {
    return;
  }

  safeWriteValue(key, encodedValue, options);
  eventEmitter.emit(key);
}

// eslint-disable-next-line @typescript-eslint/ban-types
function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

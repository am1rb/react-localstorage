import * as React from 'react';
import { z } from 'zod';
import type { Options } from './types/Options';
import { eventEmitter } from './utils/eventEmitter';
import { removeValue } from './utils/removeValue';

export function useRemoveValue<Schema extends z.ZodTypeAny>(
  key: string,
  options: Options<Schema>,
): () => void {
  const optionsRef = React.useRef(options);

  optionsRef.current = options;

  return React.useCallback(() => {
    if (removeValue(key, optionsRef.current)) {
      eventEmitter.emit(key);
    }
  }, [key]);
}

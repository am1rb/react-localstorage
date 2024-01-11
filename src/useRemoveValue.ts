import * as React from 'react';
import { z } from 'zod';
import type { Options } from './types/Options';
import { handleFailure } from './utils/handleFailure';
import { eventEmitter } from './utils/eventEmitter';

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

export function removeValue<Schema extends z.ZodTypeAny>(
  key: string,
  { storage, logger, failurePolicy }: Options<Schema>,
): boolean {
  try {
    storage.removeItem(key);
    return true;
  } catch (error) {
    handleFailure(
      failurePolicy.removeError,
      logger,
      `Failed to remove from storage for ${key}.`,
      error,
    );
  }

  return false;
}

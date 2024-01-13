import type { z } from 'zod';
import type { Options } from '../types/Options';
import { handleFailure } from './handleFailure';

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

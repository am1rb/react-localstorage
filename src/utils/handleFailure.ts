import { z } from 'zod';
import { FailurePolicy } from '../types/FailurePolicy';
import { Options } from '../types/Options';

export function handleFailure(
  policy: FailurePolicy,
  logger: Options<z.ZodTypeAny>['logger'],
  message: string,
  error?: unknown
): void {
  if (policy === 'ignore') {
    return;
  }

  if (policy === 'exception') {
    throw error ? extendError(error, message) : new Error(message);
  }

  if (error) {
    logger[policy](message + (error ? '\n%o' : ''), error);
  } else {
    logger[policy](message);
  }
}

function extendError(error: unknown, message: string): unknown {
  if (error instanceof Error) {
    error.message = error.message ? message + '\n' + error.message : message;
  }

  return error;
}

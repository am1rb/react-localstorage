import type { DefaultOptions } from '../types/DefaultOptions';
import { localStorageWithFallback } from './localStorageWithFallback';

export const defaultOptions = (function () {
  const initial: DefaultOptions = {
    transform: {
      storedValue: (value) => value,
      decodedValue: (value) => value,
    },
    serializer: {
      decode: JSON.parse,
      encode: JSON.stringify,
    },
    storage: localStorageWithFallback,
    logger: console,
    failurePolicy: {
      decodeError: 'exception',
      encodeError: 'exception',
      schemaCheck: 'exception',
      readError: 'exception',
      writeError: 'exception',
      removeError: 'exception',
    },
  };
  let current: DefaultOptions | null = null;

  const get = () => current ?? initial;

  const set = (options: Partial<DefaultOptions>) => {
    current = {
      ...get(),
      ...options,
    };
  };

  const reset = () => {
    current = null;
  };

  return { get, set, reset };
})();

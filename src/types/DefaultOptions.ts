import type { FailurePolicy } from './FailurePolicy';

export interface DefaultOptions {
  storage: {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
  };
  transformDecodedValue: (decodedValue: unknown) => unknown;
  serializer: {
    decode: (value: string) => unknown;
    encode: (value: unknown) => string;
  };
  logger: {
    warn: typeof console.error;
    error: typeof console.error;
  };
  failurePolicy: {
    decodeError: FailurePolicy;
    encodeError: FailurePolicy;
    schemaCheck: FailurePolicy;
    readError: FailurePolicy;
    writeError: FailurePolicy;
    removeError: FailurePolicy;
  };
}

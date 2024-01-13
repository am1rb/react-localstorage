import type { FailurePolicy } from './FailurePolicy';
import type { StorageAPI } from './StorageAPI';

export interface DefaultOptions<Value = unknown> {
  storage: StorageAPI;
  transform: {
    storedValue(value: string): string,
    decodedValue(decodedValue: unknown): Value
  };
  serializer: {
    decode: (value: string) => Value;
    encode: (value: Value) => string;
  };
  logger: {
    warn: typeof console.error;
    error: typeof console.error;
  }
  failurePolicy: {
    decodeError: FailurePolicy;
    encodeError: FailurePolicy;
    schemaCheck: FailurePolicy;
    readError: FailurePolicy;
    writeError: FailurePolicy;
    removeError: FailurePolicy;
  }
}

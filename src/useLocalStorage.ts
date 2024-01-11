import { z } from 'zod';
import { Options } from './types/Options';
import { useGetValue } from './useGetValue';
import { useDecodeValue } from './useDecodeValue';
import { useSetValue } from './useSetValue';
import { useRemoveValue } from './useRemoveValue';
import { defaultOptions } from './utils/defaultOptions';

interface LocalStorageActions<GetValue, SetValue, OldValue> {
  value:
    | {
        isReady: false;
        data: undefined;
      }
    | {
        isReady: true;
        data: GetValue;
      };
  setValue(newValue: SetValue | ((oldValue: OldValue) => SetValue)): void;
  removeValue(): void;
}

type LocalStorageReturn<
  Schema extends z.ZodTypeAny
> = Schema extends z.ZodDefault<z.ZodTypeAny>
  ? LocalStorageActions<z.infer<Schema>, z.infer<Schema>, z.infer<Schema>>
  : LocalStorageActions<
      z.infer<Schema> | undefined,
      z.infer<Schema>,
      z.infer<Schema> | undefined
    >;

export function useLocalStorage<Schema extends z.ZodTypeAny>(
  key: string,
  schema: Schema,
  options: Partial<Omit<Options<z.infer<Schema>>, 'schema'>> = {}
): LocalStorageReturn<Schema> {
  const extendedOptions: Options<z.infer<Schema>> = {
    ...defaultOptions.get(),
    ...options,
    schema,
  };

  const rawValue = useGetValue(key, extendedOptions);
  const value = useDecodeValue(key, rawValue.value, extendedOptions);
  const setValue = useSetValue(key, value, extendedOptions);
  const removeValue = useRemoveValue(key, extendedOptions);

  return {
    value: {
      isReady: rawValue.isReady,
      data: rawValue.isReady ? value : null,
    },
    setValue,
    removeValue,
  } as LocalStorageReturn<Schema>;
}

useLocalStorage.defaultOptions = defaultOptions;

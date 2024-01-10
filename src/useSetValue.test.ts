import { renderHook } from '@testing-library/react';
import { setValue, useSetValue } from './useSetValue';
import { SAMPLE_KEY, getTestData } from './utils/getTestData';
import { eventEmitter } from './utils/eventEmitter';

describe('useSetValue', () => {
  it('provides a stable setter function based on the key', () => {
    const testData = getTestData();

    const { result, rerender } = renderHook(
      ({ key }: { key: string }) =>
        useSetValue(key, testData.value, testData.options),
      { initialProps: { key: SAMPLE_KEY } }
    );

    const setter = result.current;

    rerender({ key: SAMPLE_KEY });
    rerender({ key: SAMPLE_KEY });

    expect(setter).toBe(result.current);

    rerender({ key: 'new-key' });

    expect(setter).not.toBe(result.current);
  });

  it('writes data to storage', () => {
    const testData = getTestData();

    const mockSetItem = jest.fn();
    const { result } = renderHook(() =>
      useSetValue(SAMPLE_KEY, testData.value, {
        ...testData.options,
        storage: { ...testData.options.storage, setItem: mockSetItem },
      })
    );

    const newValue = { id: 20, label: 'John' };
    result.current(newValue);

    expect(mockSetItem).toHaveBeenCalledWith(
      SAMPLE_KEY,
      testData.options.serializer.encode(newValue)
    );
  });

  it('gets old value and updates storage by providing new value', () => {
    const testData = getTestData({ withDefaultValue: true });

    const mockSetItem = jest.fn();
    const { result } = renderHook(() =>
      useSetValue(SAMPLE_KEY, testData.value, {
        ...testData.options,
        storage: { ...testData.options.storage, setItem: mockSetItem },
      })
    );

    result.current(oldValue => ({
      ...oldValue,
      id: oldValue.id + 1,
      label: 'NEW LABEL',
    }));

    expect(mockSetItem).toHaveBeenCalledWith(
      SAMPLE_KEY,
      testData.options.serializer.encode({
        id: testData.value.id + 1,
        label: 'NEW LABEL',
      })
    );
  });
});

describe('setValue', () => {
  it('saves data in storage if encoder returns a not null value', () => {
    const testData = getTestData();

    const mockSetItem = jest.fn();
    setValue(SAMPLE_KEY, testData.value, {
      ...testData.options,
      storage: { ...testData.options.storage, setItem: mockSetItem },
    });

    expect(mockSetItem).toHaveBeenCalledWith(
      SAMPLE_KEY,
      testData.storedValue.ok
    );
  });

  it('does not try to put data in storage if encoder could not encode it', () => {
    const mockCallback = jest.fn();

    eventEmitter.on(SAMPLE_KEY, mockCallback);

    const testData = getTestData({ failurePolicy: 'error' });

    const mockSetItem = jest.fn();
    setValue(SAMPLE_KEY, testData.value, {
      ...testData.options,
      serializer: {
        ...testData.options.serializer,
        encode: jest.fn(() => {
          throw new Error();
        }),
      },
      storage: { ...testData.options.storage, setItem: mockSetItem },
    });

    expect(mockSetItem).not.toHaveBeenCalled();
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it("should not save it if value's format does not match the schema", () => {
    const mockCallback = jest.fn();

    eventEmitter.on(SAMPLE_KEY, mockCallback);

    const testData = getTestData({ failurePolicy: 'error' });

    const mockSetItem = jest.fn();
    setValue(SAMPLE_KEY, undefined as any, {
      ...testData.options,
      storage: { ...testData.options.storage, setItem: mockSetItem },
    });

    expect(mockSetItem).not.toHaveBeenCalled();
    expect(mockCallback).not.toHaveBeenCalled();
  });

  it('notifies other listeners after updating storage', () => {
    const mockCallback = jest.fn();

    eventEmitter.on(SAMPLE_KEY, mockCallback);

    const testData = getTestData();

    setValue(SAMPLE_KEY, testData.value, testData.options);

    expect(mockCallback).toHaveBeenCalled();
  });
});

import { renderHook } from '@testing-library/react';
import { useRemoveValue } from './useRemoveValue';
import { SAMPLE_KEY, getTestData } from './utils/getTestData';
import { eventEmitter } from './utils/eventEmitter';

it('provides a stable function based on the key', () => {
  const testData = getTestData();

  const { result, rerender } = renderHook(
    ({ key }: { key: string }) => useRemoveValue(key, testData.options),
    { initialProps: { key: SAMPLE_KEY } },
  );

  const removeFunc = result.current;

  rerender({ key: SAMPLE_KEY });
  rerender({ key: SAMPLE_KEY });

  expect(removeFunc).toBe(result.current);

  rerender({ key: 'new-key' });

  expect(removeFunc).not.toBe(result.current);
});

it('notifies other instances after removing from storage', () => {
  const mockCallback = jest.fn();

  eventEmitter.on(SAMPLE_KEY, mockCallback);

  const testData = getTestData();

  const { result } = renderHook(() =>
    useRemoveValue(SAMPLE_KEY, testData.options),
  );

  result.current();

  expect(mockCallback).toHaveBeenCalled();
});

it('should not notify other instances when the remove process gets failed', () => {
  const mockCallback = jest.fn();

  eventEmitter.on(SAMPLE_KEY, mockCallback);

  const testData = getTestData();

  const { result } = renderHook(() =>
    useRemoveValue(SAMPLE_KEY, {
      ...testData.options,
      storage: {
        ...testData.options.storage,
        removeItem: () => {
          throw new Error();
        },
      },
    }),
  );

  expect(() => result.current()).toThrow();

  expect(mockCallback).not.toHaveBeenCalled();
});

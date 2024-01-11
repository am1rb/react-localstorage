import { renderHook } from '@testing-library/react';
import type { FailurePolicy } from './types/FailurePolicy';
import { removeValue, useRemoveValue } from './useRemoveValue';
import { SAMPLE_KEY, getTestData } from './utils/getTestData';
import { eventEmitter } from './utils/eventEmitter';

describe('useRemoveValue', () => {
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

  it('should not notify other instances when the remove process gets failed', () => {});
});

describe('removeValue', () => {
  it('removes data from storage', () => {
    const mockRemoveItem = jest.fn();

    const testData = getTestData();

    expect(
      removeValue(SAMPLE_KEY, {
        ...testData.options,
        storage: { ...testData.options.storage, removeItem: mockRemoveItem },
      }),
    ).toBeTruthy();

    expect(mockRemoveItem).toHaveBeenCalledWith(SAMPLE_KEY);
  });

  it('throws an exception when storage gets failed and failure policy is exception', () => {
    const mockRemoveItem = jest.fn(() => {
      throw new Error();
    });

    const testData = getTestData();

    expect.hasAssertions();
    expect(() =>
      removeValue(SAMPLE_KEY, {
        ...testData.options,
        storage: { ...testData.options.storage, removeItem: mockRemoveItem },
      }),
    ).toThrowError(`Failed to remove from storage for ${SAMPLE_KEY}`);
  });

  it('logs an error or ignores the action when storage gets failed and failure policy is not exception', () => {
    const failurePolicies: FailurePolicy[] = ['ignore', 'error', 'warn'];

    failurePolicies.forEach((failurePolicy) => {
      const mockRemoveItem = jest.fn(() => {
        throw new Error();
      });

      const testData = getTestData({ failurePolicy });

      expect(
        removeValue(SAMPLE_KEY, {
          ...testData.options,
          storage: { ...testData.options.storage, removeItem: mockRemoveItem },
        }),
      ).toBeFalsy();

      if (failurePolicy === 'error' || failurePolicy === 'warn') {
        expect(testData.options.logger[failurePolicy]).toHaveBeenCalledWith(
          `Failed to remove from storage for ${SAMPLE_KEY}.\n%o`,
          expect.anything(),
        );
      }
    });
  });
});

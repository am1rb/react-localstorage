import { act, renderHook } from '@testing-library/react';
import { FailurePolicy } from './types/FailurePolicy';
import { readValue, safeReadValue, useGetValue } from './useGetValue';

import { SAMPLE_KEY, getTestData } from './utils/getTestData';
import { eventEmitter } from './utils/eventEmitter';

afterEach(() => eventEmitter.clear());

describe('useGetValue', () => {
  it.skip('returns null during SSR phase', () => {
    // FIXME: find a way to simulate SSR
    const testData = getTestData();

    const { result } = renderHook(() =>
      useGetValue(SAMPLE_KEY, testData.options)
    );

    expect(result.current).toEqual({ isReady: false, value: null });
  });

  it('should listen to the storage events and get new updates', async () => {
    const testData = getTestData();

    const mockGetItem = jest.fn<string | null, never>(() => null);

    const { result } = renderHook(() =>
      useGetValue(SAMPLE_KEY, {
        ...testData.options,
        storage: { ...testData.options.storage, getItem: mockGetItem },
      })
    );

    expect(result.current).toEqual({ isReady: true, value: null });

    mockGetItem.mockReturnValue(testData.storedValue.ok);

    act(() =>
      window.dispatchEvent(new StorageEvent('storage', { key: SAMPLE_KEY }))
    );

    expect(result.current).toEqual({
      isReady: true,
      value: testData.storedValue.ok,
    });
  });

  it('sets up an event handler in eventEmitter', () => {
    const testData = getTestData();

    const mockGetItem = jest.fn<string | null, never>(() => null);

    const { unmount, result } = renderHook(() =>
      useGetValue(SAMPLE_KEY, {
        ...testData.options,
        storage: { ...testData.options.storage, getItem: mockGetItem },
      })
    );

    expect(eventEmitter.size()).toBe(1);

    mockGetItem.mockReturnValue(testData.storedValue.ok);

    act(() => eventEmitter.emit(SAMPLE_KEY));

    expect(result.current).toEqual({
      isReady: true,
      value: testData.storedValue.ok,
    });

    unmount();

    expect(eventEmitter.size()).toBe(0);
  });
});

describe('safeReadValue', () => {
  it('raises an exception if storage.getItem returns invalid data type and failure policy is exception', () => {
    const testData = getTestData({ failurePolicy: 'exception' });

    expect.hasAssertions();

    expect(() =>
      safeReadValue(SAMPLE_KEY, {
        ...testData.options,
        storage: {
          ...testData.options.storage,
          getItem: () => undefined as any,
        },
      })
    ).toThrowError(
      `The storage.getItem must return a string or null; but returned undefined for ${SAMPLE_KEY}`
    );
  });

  it('returns null if if storage.getItem returns invalid data type and failure policy is not exception', () => {
    const failurePolicies: FailurePolicy[] = ['error', 'ignore'];

    failurePolicies.forEach(failurePolicy => {
      const testData = getTestData({ failurePolicy });

      expect(
        safeReadValue(SAMPLE_KEY, {
          ...testData.options,
          storage: {
            ...testData.options.storage,
            getItem: () => undefined as any,
          },
        })
      ).toBeNull();

      if (failurePolicy === 'error') {
        expect(testData.options.logger.error).toHaveBeenCalled();
      }
    });
  });
});

describe('readValue', () => {
  it('gets data from storage', () => {
    const storedData = 'stored data';
    const mockGetItem = jest.fn().mockReturnValue(storedData);

    const testData = getTestData();

    expect(
      readValue(SAMPLE_KEY, {
        ...testData.options,
        storage: { ...testData.options.storage, getItem: mockGetItem },
      })
    ).toBe(storedData);
    expect(mockGetItem).toHaveBeenCalledWith(SAMPLE_KEY);
  });

  it('throws an exception when storage gets failed and failure policy is exception', () => {
    const mockGetItem = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    const testData = getTestData();

    expect.hasAssertions();
    expect(() =>
      readValue(SAMPLE_KEY, {
        ...testData.options,
        storage: { ...testData.options.storage, getItem: mockGetItem },
      })
    ).toThrowError(`Failed to read from storage for ${SAMPLE_KEY}`);
  });

  it('returns null when storage gets failed and failure policy is not exception', () => {
    const failurePolicies: FailurePolicy[] = ['ignore', 'error'];

    failurePolicies.forEach(failurePolicy => {
      const mockGetItem = jest.fn().mockImplementation(() => {
        throw new Error();
      });

      const testData = getTestData({ failurePolicy });

      expect(
        readValue(SAMPLE_KEY, {
          ...testData.options,
          storage: { ...testData.options.storage, getItem: mockGetItem },
        })
      ).toBeNull();

      if (failurePolicy === 'error') {
        expect(testData.options.logger.error).toHaveBeenCalled();
      }
    });
  });
});

import { act, renderHook } from '@testing-library/react';
import { useGetValue } from './useGetValue';

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

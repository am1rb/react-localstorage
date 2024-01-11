import { act, renderHook } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';
import { z } from 'zod';
import { SAMPLE_KEY } from './utils/getTestData';

afterEach(() => localStorage.clear());

it('should support nullable values', () => {
  const { result } = renderHook(() =>
    useLocalStorage(
      SAMPLE_KEY,
      z
        .number()
        .nullable()
        .default(null)
    )
  );

  expect(result.current.value).toEqual({ isReady: true, data: null });
});

it('returns default value when data is not available in storage', () => {
  const { result } = renderHook(() =>
    useLocalStorage(SAMPLE_KEY, z.number().default(10))
  );

  expect(result.current.value).toEqual({ isReady: true, data: 10 });
});

it('writes the value to storage', () => {
  const { result } = renderHook(() => useLocalStorage(SAMPLE_KEY, z.number()));

  act(() => result.current.setValue(20));

  expect(result.current.value).toEqual({ isReady: true, data: 20 });
  expect(localStorage.getItem(SAMPLE_KEY)).toBe('20');
});

it('reads the value from storage', () => {
  localStorage.setItem(SAMPLE_KEY, '30');

  const { result } = renderHook(() => useLocalStorage(SAMPLE_KEY, z.number()));

  expect(result.current.value).toEqual({ isReady: true, data: 30 });
});

it('returns undefined when no data in storage and the default is not set', () => {
  const { result } = renderHook(() => useLocalStorage(SAMPLE_KEY, z.number()));

  expect(result.current.value).toEqual({ isReady: true, data: undefined });
});

it('deletes data from storage', () => {
  localStorage.setItem(SAMPLE_KEY, '40');

  const { result } = renderHook(() => useLocalStorage(SAMPLE_KEY, z.number()));

  act(() => result.current.removeValue());

  expect(localStorage.getItem(SAMPLE_KEY)).toBeNull();
});

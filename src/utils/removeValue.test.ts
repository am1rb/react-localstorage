import type { FailurePolicy } from '../types/FailurePolicy';
import { SAMPLE_KEY, getTestData } from './getTestData';
import { removeValue } from './removeValue';

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

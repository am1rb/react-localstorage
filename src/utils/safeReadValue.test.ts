import { FailurePolicy } from '../types/FailurePolicy';
import { SAMPLE_KEY, getTestData } from './getTestData';
import { readValue, safeReadValue } from './safeReadValue';

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

  it('returns null if storage.getItem returns invalid data type and failure policy is not exception', () => {
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
        expect(testData.options.logger.error).toHaveBeenCalledWith(
          `The storage.getItem must return a string or null; but returned undefined for ${SAMPLE_KEY}`
        );
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
        expect(testData.options.logger.error).toHaveBeenCalledWith(
          'Failed to read from storage for %s\n%o',
          SAMPLE_KEY,
          expect.anything()
        );
      }
    });
  });
});

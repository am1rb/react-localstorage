import { FailurePolicy } from '../types/FailurePolicy';
import { SAMPLE_KEY, getTestData } from './getTestData';
import { safeWriteValue, writeValue } from './safeWriteValue';

describe('safeWriteValue', () => {
  it('raises an exception if the value format does not match and failure policy is exception', () => {
    const testData = getTestData({ failurePolicy: 'exception' });

    expect.hasAssertions();

    expect(() =>
      safeWriteValue(SAMPLE_KEY, undefined as any, testData.options)
    ).toThrowError(
      `The storage.setItem expects an string; but got undefined for ${SAMPLE_KEY}`
    );
  });

  it('logs an error or ignores the action when the value format does not match and failure policy is not exception', () => {
    const failurePolicies: FailurePolicy[] = ['error', 'ignore'];

    failurePolicies.forEach(failurePolicy => {
      const testData = getTestData({ failurePolicy });

      safeWriteValue(SAMPLE_KEY, undefined as any, testData.options);

      if (failurePolicy === 'error') {
        expect(testData.options.logger.error).toHaveBeenCalledWith(
          `The storage.setItem expects an string; but got undefined for ${SAMPLE_KEY}`
        );
      }
    });
  });
});

describe('writeValue', () => {
  it('puts data to storage', () => {
    const mockSetItem = jest.fn();

    const testData = getTestData();

    writeValue(SAMPLE_KEY, testData.storedValue.ok, {
      ...testData.options,
      storage: { ...testData.options.storage, setItem: mockSetItem },
    });

    expect(mockSetItem).toHaveBeenCalledWith(
      SAMPLE_KEY,
      testData.storedValue.ok
    );
  });

  it('throws an exception when storage gets failed and failure policy is exception', () => {
    const mockSetItem = jest.fn().mockImplementation(() => {
      throw new Error();
    });

    const testData = getTestData();

    expect.hasAssertions();
    expect(() =>
      writeValue(SAMPLE_KEY, testData.storedValue.ok, {
        ...testData.options,
        storage: { ...testData.options.storage, setItem: mockSetItem },
      })
    ).toThrowError(`Failed to write to storage for ${SAMPLE_KEY}`);
  });

  it('logs an error or ignores the action when storage gets failed and failure policy is not exception', () => {
    const failurePolicies: FailurePolicy[] = ['ignore', 'error'];

    failurePolicies.forEach(failurePolicy => {
      const mockSetItem = jest.fn().mockImplementation(() => {
        throw new Error();
      });

      const testData = getTestData({ failurePolicy });

      writeValue(SAMPLE_KEY, testData.storedValue.ok, {
        ...testData.options,
        storage: { ...testData.options.storage, setItem: mockSetItem },
      });

      if (failurePolicy === 'error') {
        expect(testData.options.logger.error).toHaveBeenCalledWith(
          'Failed to write to storage for %s\n%o',
          SAMPLE_KEY,
          expect.anything()
        );
      }
    });
  });
});

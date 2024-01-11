import { SAMPLE_KEY, getTestData } from './getTestData';
import { encodeValue, getEncodedValue } from './encodeValue';
import type { FailurePolicy } from '../types/FailurePolicy';

describe('encodeValue', () => {
  it('raises an exception if the value format does not match and failure policy is exception', () => {
    const testData = getTestData({ failurePolicy: 'exception' });

    expect.hasAssertions();

    expect(() =>
      encodeValue(SAMPLE_KEY, undefined as never, testData.options),
    ).toThrow(`The value's format does not match schema for ${SAMPLE_KEY}`);
  });

  it('returns null if the value format does not match and failure policy is not exception', () => {
    const failurePolicies: FailurePolicy[] = ['error', 'ignore', 'warn'];

    failurePolicies.forEach((failurePolicy) => {
      const testData = getTestData({ failurePolicy });

      expect(
        encodeValue(SAMPLE_KEY, undefined as never, testData.options),
      ).toBeNull();

      if (failurePolicy === 'error' || failurePolicy === 'warn') {
        expect(testData.options.logger[failurePolicy]).toHaveBeenCalledWith(
          `The value's format does not match schema for ${SAMPLE_KEY}.`,
        );
      }
    });
  });
});

describe('getEncodedValue', () => {
  it('calls encoder to encode data', () => {
    const mockEncoder = jest.fn(() => testData.storedValue.ok);

    const testData = getTestData();

    expect(
      getEncodedValue(SAMPLE_KEY, testData.value, {
        ...testData.options,
        serializer: {
          ...testData.options.serializer,
          encode: mockEncoder,
        },
      }),
    ).toBe(testData.storedValue.ok);

    expect(mockEncoder).toHaveBeenCalledWith(testData.value);
  });

  it('throws an exception when encoder gets failed and failure policy is exception', () => {
    const mockEncoder = jest.fn(() => {
      throw new Error();
    });

    const testData = getTestData();

    expect.hasAssertions();
    expect(() =>
      getEncodedValue(SAMPLE_KEY, testData.value, {
        ...testData.options,
        serializer: {
          ...testData.options.serializer,
          encode: mockEncoder,
        },
      }),
    ).toThrowError(`Failed to encode value for ${SAMPLE_KEY}`);
  });

  it('returns null when encoder gets failed and failure policy is not exception', () => {
    const failurePolicies: FailurePolicy[] = ['ignore', 'error', 'warn'];

    failurePolicies.forEach((failurePolicy) => {
      const mockEncoder = jest.fn(() => {
        throw new Error();
      });

      const testData = getTestData({ failurePolicy });

      expect(
        getEncodedValue(SAMPLE_KEY, testData.value, {
          ...testData.options,
          serializer: {
            ...testData.options.serializer,
            encode: mockEncoder,
          },
        }),
      ).toBeNull();

      if (failurePolicy === 'error' || failurePolicy === 'warn') {
        expect(testData.options.logger[failurePolicy]).toHaveBeenCalledWith(
          `Failed to encode value for ${SAMPLE_KEY}.\n%o`,
          expect.anything(),
        );
      }
    });
  });
});

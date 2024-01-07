import { SAMPLE_KEY, getTestData } from './getTestData';
import { decodeRawValue } from './decodeRawValue';
import { FailurePolicy } from '../types/FailurePolicy';

describe('with default value', () => {
  it('returns default value when rawValue is null', () => {
    const testData = getTestData({ withDefaultValue: true });

    expect(decodeRawValue(SAMPLE_KEY, null, testData.options)).toBe(
      testData.defaultValue
    );
  });

  it('returns default value when decoder failed to parse stored data and failure policy is not exception', () => {
    const failurePolicies: FailurePolicy[] = ['error', 'ignore'];

    failurePolicies.forEach(failurePolicy => {
      const testData = getTestData({ withDefaultValue: true, failurePolicy });

      expect(
        decodeRawValue(
          SAMPLE_KEY,
          testData.storedValue.decoderIncompatible,
          testData.options
        )
      ).toBe(testData.defaultValue);
    });
  });

  it('returns default value if schema does not match and failure policy is not exception', () => {
    const failurePolicies: FailurePolicy[] = ['error', 'ignore'];

    failurePolicies.forEach(failurePolicy => {
      const testData = getTestData({ withDefaultValue: true, failurePolicy });

      expect(
        decodeRawValue(
          SAMPLE_KEY,
          testData.storedValue.schemaIncompatible,
          testData.options
        )
      ).toEqual(testData.defaultValue);
    });
  });
});

describe('without default value', () => {
  it('returns undefined value when rawValue is null', () => {
    const testData = getTestData({ withDefaultValue: false });

    expect(decodeRawValue(SAMPLE_KEY, null, testData.options)).toBeUndefined();
  });

  it('returns undefined when decoder failed to parse stored data and failure policy is not exception', () => {
    const failurePolicies: FailurePolicy[] = ['error', 'ignore'];

    failurePolicies.forEach(failurePolicy => {
      const testData = getTestData({ withDefaultValue: false, failurePolicy });

      expect(
        decodeRawValue(
          SAMPLE_KEY,
          testData.storedValue.decoderIncompatible,
          testData.options
        )
      ).toBeUndefined();
    });
  });

  it('returns undefined if schema does not match and failure policy is not exception', () => {
    const failurePolicies: FailurePolicy[] = ['error', 'ignore'];

    failurePolicies.forEach(failurePolicy => {
      const testData = getTestData({ withDefaultValue: false, failurePolicy });

      expect(
        decodeRawValue(
          SAMPLE_KEY,
          testData.storedValue.schemaIncompatible,
          testData.options
        )
      ).toBeUndefined();
    });
  });
});

it('complains when decoder failed to parse stored data and failure policy is exception', () => {
  const testData = getTestData({ failurePolicy: 'exception' });

  expect.hasAssertions();

  expect(() =>
    decodeRawValue(
      SAMPLE_KEY,
      testData.storedValue.decoderIncompatible,
      testData.options
    )
  ).toThrowError(`Failed to decode raw value for ${SAMPLE_KEY}`);
});

it('returns stored value in storage if schema matches', () => {
  const testData = getTestData();

  expect(
    decodeRawValue(SAMPLE_KEY, testData.storedValue.ok, testData.options)
  ).toEqual(testData.value);
});

it('throws an exception if schema does not match and failure policy is exception', () => {
  const testData = getTestData({ failurePolicy: 'exception' });
  expect.hasAssertions();

  expect(() =>
    decodeRawValue(
      SAMPLE_KEY,
      testData.storedValue.schemaIncompatible,
      testData.options
    )
  ).toThrowError(
    `The stored data format does not match schema for ${SAMPLE_KEY}`
  );
});

it('calls transformDecodedValue to have the chance to migrate data before running schema check', () => {
  const testData = getTestData({ failurePolicy: 'exception' });

  const migrateData = (
    decodedValue: unknown
  ): { id: number; label: string } => {
    return { id: -1, label: String(decodedValue) };
  };

  expect.assertions(0);

  decodeRawValue(SAMPLE_KEY, testData.storedValue.schemaIncompatible, {
    ...testData.options,
    transformDecodedValue: migrateData,
  });
});

import { renderHook } from '@testing-library/react';
import { useDecodeValue } from '../src/useDecodeValue';
import { SAMPLE_KEY, getTestData } from './utils/getTestData';

describe('useDecodeValue', () => {
  it('should memoize the decoded value', () => {
    const testData = getTestData();

    const { result, rerender } = renderHook(
      ({ rawValue }: { rawValue: string | null }) =>
        useDecodeValue(SAMPLE_KEY, rawValue, testData.options),
      { initialProps: { rawValue: testData.storedValue.ok } }
    );

    const initialDecodedValue = result.current;

    rerender({ rawValue: testData.storedValue.ok });
    rerender({ rawValue: testData.storedValue.ok });
    rerender({ rawValue: testData.storedValue.ok });

    expect(result.current).toBe(initialDecodedValue);

    rerender({
      rawValue: testData.options.encoder({ id: 2, label: 'new value' }),
    });

    expect(result.current).not.toBe(initialDecodedValue);
  });
});

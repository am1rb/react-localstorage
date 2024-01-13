import { SAMPLE_KEY, getTestData } from './getTestData';
import { localStorageWithFallback } from './localStorageWithFallback';

afterAll(() => localStorageWithFallback.clear());

describe('when storage is failing', () => {
  beforeAll(() => {
    const throwError = () => {
      throw new Error();
    };

    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(throwError);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(throwError);
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(throwError);
    jest.spyOn(Storage.prototype, 'clear').mockImplementation(throwError);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('ignores fallback and tries storage when data is not in fallback', () => {
    expect(() =>
      expect(localStorageWithFallback.getItem(SAMPLE_KEY)),
    ).toThrow();
  });

  it('writes to fallback and throws and error', () => {
    const testData = getTestData();

    expect(() =>
      localStorageWithFallback.setItem(SAMPLE_KEY, testData.storedValue.ok),
    ).toThrow();

    expect(localStorageWithFallback.fallback().has(SAMPLE_KEY)).toBeTruthy();
  });

  it('removes data from fallback and storage at the same time', () => {
    const testData = getTestData();

    expect(() =>
      localStorageWithFallback.setItem(SAMPLE_KEY, testData.storedValue.ok),
    ).toThrow();

    expect(localStorageWithFallback.fallback().has(SAMPLE_KEY)).toBeTruthy();

    expect(() => localStorageWithFallback.removeItem(SAMPLE_KEY)).toThrow();

    expect(localStorageWithFallback.fallback().has(SAMPLE_KEY)).toBeFalsy();
  });

  it('removes data from fallback when storage got updated', () => {
    const testData = getTestData();

    expect(() =>
      localStorageWithFallback.setItem(SAMPLE_KEY, testData.storedValue.ok),
    ).toThrow();

    localStorageWithFallback.refresh(SAMPLE_KEY);

    expect(localStorageWithFallback.fallback().has(SAMPLE_KEY)).toBeFalsy();
  });

  it('clears fallback and raises an error', () => {
    const testData = getTestData();

    expect(() =>
      localStorageWithFallback.setItem(SAMPLE_KEY, testData.storedValue.ok),
    ).toThrow();

    expect(() => localStorageWithFallback.clear()).toThrow();

    expect(localStorageWithFallback.fallback().has(SAMPLE_KEY)).toBeFalsy();
  });
});

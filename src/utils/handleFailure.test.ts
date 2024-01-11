import { getTestData } from './getTestData';
import { handleFailure } from './handleFailure';

const sampleError = 'Sample Error';

it('calls the error action', () => {
  const testData = getTestData();
  const mockError = jest.fn();

  handleFailure(
    'error',
    {
      ...testData.options.logger,
      error: mockError,
    },
    sampleError,
    new Error(),
  );

  expect(mockError).toHaveBeenCalled();
});

it('logs a warning', () => {
  const testData = getTestData();
  const mockWarn = jest.fn();

  handleFailure(
    'warn',
    {
      ...testData.options.logger,
      warn: mockWarn,
    },
    sampleError,
    new Error(),
  );

  expect(mockWarn).toHaveBeenCalled();
});

it('should not call error, warn, or exception when it goes for ignore', () => {
  const testData = getTestData();
  const mockError = jest.fn();
  const mockWarn = jest.fn();

  handleFailure(
    'ignore',
    {
      ...testData.options.logger,
      warn: mockWarn,
      error: mockError,
    },
    sampleError,
    new Error(),
  );

  expect(mockError).not.toHaveBeenCalled();
  expect(mockWarn).not.toHaveBeenCalled();
});

it('be able to run the exception action', () => {
  const testData = getTestData();

  expect.hasAssertions();

  expect(() =>
    handleFailure(
      'exception',
      testData.options.logger,
      sampleError,
      new Error(),
    ),
  ).toThrowError('Sample Error');
});

import { handleFailure } from './handleFailure';

it('calls the error action', () => {
  const mockError = jest.fn();

  handleFailure('error', {
    error: mockError,
    exception: () => {},
  });

  expect(mockError).toHaveBeenCalled();
});

it('be able to run the exception action', () => {
  const mockException = jest.fn();

  handleFailure('exception', {
    error: () => {},
    exception: mockException,
  });

  expect(mockException).toHaveBeenCalled();
});

it('should not call error and exception actions when it goes for ignore', () => {
  const mockError = jest.fn();
  const mockException = jest.fn();

  handleFailure('ignore', {
    error: mockError,
    exception: mockException,
  });

  expect(mockError).not.toHaveBeenCalled();
  expect(mockException).not.toHaveBeenCalled();
});

import { type DefaultOptions } from '../types/DefaultOptions';
import { defaultOptions } from './defaultOptions';

const initialOptions = defaultOptions.get();

afterEach(() => {
  defaultOptions.reset();
});

it('sets new value as default options', () => {
  const newUpdate: DefaultOptions = {
    transformDecodedValue: jest.fn(),
    serializer: {
      decode: jest.fn(),
      encode: jest.fn(),
    },
    storage: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    },
    logger: {
      warn: jest.fn(),
      error: jest.fn(),
    },
    failurePolicy: {
      decodeError: 'warn',
      encodeError: 'warn',
      schemaCheck: 'warn',
      readError: 'warn',
      writeError: 'warn',
      removeError: 'warn',
    },
  };

  defaultOptions.set(newUpdate);

  expect(defaultOptions.get()).toEqual(newUpdate);
});

it('resets options to default value', () => {
  const newUpdate: Partial<DefaultOptions> = {
    transformDecodedValue: jest.fn(),
  };
  defaultOptions.set(newUpdate);

  expect(defaultOptions.get()).not.toEqual(initialOptions);

  defaultOptions.reset();

  expect(defaultOptions.get()).toEqual(initialOptions);
});

it('updates default settings partially', () => {
  const newUpdate: Partial<DefaultOptions> = {
    transformDecodedValue: jest.fn(),
  };

  defaultOptions.set(newUpdate);

  expect(defaultOptions.get()).not.toEqual(initialOptions);

  expect(defaultOptions.get()).toEqual(expect.objectContaining(newUpdate));
});

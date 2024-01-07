import { z } from 'zod';
import { getDefaultValue } from './getDefaultValue';

it('returns the default value when schema includes it', () => {
  const defaultValue = 5;

  expect(getDefaultValue(z.number().default(defaultValue))).toBe(defaultValue);
});

it('returns undefined when schema does not have it', () => {
  expect(getDefaultValue(z.number())).toBeUndefined();
});

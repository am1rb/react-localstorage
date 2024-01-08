import { z } from 'zod';

export const storageSchema = {
  getItem: z.string().nullable(),
  setItem: z.string(),
};

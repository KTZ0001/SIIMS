import { z } from 'zod';

export const createStartupSchema = z.object({
  body: z.object({
    companyName: z.string().min(2, { message: 'Company name is required' }),
    domain: z.string().min(2, { message: 'Domain is required' }),
    elevatorPitch: z.string().optional(),
    pitchDeckUrl: z.string().url().optional(),
    logoUrl: z.string().url().optional(),
  }),
});

import { z } from 'zod';
import { Role } from '../types/enums';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
    firstName: z.string().min(1, { message: 'First name is required' }),
    lastName: z.string().min(1, { message: 'Last name is required' }),
    role: z.nativeEnum(Role, { message: 'Invalid Role' }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(1, { message: 'Password is required' }),
  }),
});

export const refreshSchema = z.object({
  cookies: z.object({
    refreshToken: z.string().min(1, { message: 'Refresh token is required' }),
  }),
});



export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8),
  }),
});

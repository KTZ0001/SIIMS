import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import rateLimit from 'express-rate-limit';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth.schema';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 50 : 1000, // Generous limit in dev mode
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again in a few minutes'
  }
});

router.post('/register', authLimiter, validate(registerSchema), AuthController.register);

router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/refresh', validate(refreshSchema), AuthController.refresh);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), AuthController.resetPassword);
router.post('/google', authLimiter, AuthController.googleLogin);

export default router;

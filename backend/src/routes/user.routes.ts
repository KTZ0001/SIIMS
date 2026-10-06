import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/me', getProfile);
router.put('/me', updateProfile);

export default router;

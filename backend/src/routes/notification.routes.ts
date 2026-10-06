import { Router } from 'express';
import { getMyNotifications, markAsRead } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', getMyNotifications);
router.put('/:id/read', markAsRead);

export default router;

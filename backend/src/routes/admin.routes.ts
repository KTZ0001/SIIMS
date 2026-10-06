import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles(Role.ADMIN));

router.get('/dashboard', AdminController.getDashboard);

export default router;

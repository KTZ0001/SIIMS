import { Router } from 'express';
import { FounderController } from '../controllers/founder.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles(Role.FOUNDER));

router.get('/dashboard', FounderController.getDashboard);

export default router;

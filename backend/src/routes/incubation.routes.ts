import { Router } from 'express';
import { IncubationController } from '../controllers/incubation.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles(Role.MANAGER));

router.get('/dashboard', IncubationController.getDashboard);

export default router;

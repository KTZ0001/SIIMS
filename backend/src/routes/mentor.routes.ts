import { Router } from 'express';
import { MentorController } from '../controllers/mentor.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles(Role.MENTOR));

router.get('/dashboard', MentorController.getDashboard);

export default router;

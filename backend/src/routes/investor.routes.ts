import { Router } from 'express';
import { InvestorController } from '../controllers/investor.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles(Role.INVESTOR));

router.get('/dashboard', InvestorController.getDashboard);

export default router;

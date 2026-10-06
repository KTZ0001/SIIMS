import { Router } from 'express';
import { getMyMilestones, createMilestone, updateMilestone, deleteMilestone } from '../controllers/milestone.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', authorizeRoles('FOUNDER'), getMyMilestones);
router.post('/', authorizeRoles('FOUNDER'), createMilestone);
router.put('/:id', authorizeRoles('FOUNDER'), updateMilestone);
router.delete('/:id', authorizeRoles('FOUNDER'), deleteMilestone);

export default router;

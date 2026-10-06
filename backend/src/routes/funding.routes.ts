import { Router } from 'express';
import { getMyFundingRequests, createFundingRequest, deleteFundingRequest } from '../controllers/funding.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', authorizeRoles('FOUNDER'), getMyFundingRequests);
router.post('/', authorizeRoles('FOUNDER'), createFundingRequest);
router.delete('/:id', authorizeRoles('FOUNDER'), deleteFundingRequest);

export default router;

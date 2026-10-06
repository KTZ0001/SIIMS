import { Router } from 'express';
import { getAll, getById, create, getMyStartup, update } from '../controllers/startup.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getAll);
router.get('/me', authorizeRoles('FOUNDER'), getMyStartup);
router.get('/:id', getById);
router.post('/', authorizeRoles('FOUNDER'), create);
router.put('/', authorizeRoles('FOUNDER'), update);

export default router;

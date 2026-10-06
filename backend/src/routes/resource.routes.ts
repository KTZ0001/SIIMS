import { Router } from 'express';
import { uploadResource, getResources, deleteResource } from '../controllers/resource.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', uploadResource);
router.get('/:startupId', getResources);
router.delete('/:id', deleteResource);

export default router;

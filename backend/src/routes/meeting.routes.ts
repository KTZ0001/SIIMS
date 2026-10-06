import { Router } from 'express';
import { getMyMeetings, createMeeting, updateMeeting, deleteMeeting } from '../controllers/meeting.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', getMyMeetings);
router.post('/', createMeeting);
router.put('/:id', updateMeeting);
router.delete('/:id', deleteMeeting);

export default router;

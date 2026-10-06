import { Request, Response } from 'express';
import { MeetingService } from '../services/meeting.service';
import { z } from 'zod';
import { Status } from '../types/enums';

const createMeetingSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  guestId: z.string().uuid()
});

const updateMeetingSchema = z.object({
  status: z.nativeEnum(Status).optional(),
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional()
});

export const getMyMeetings = async (req: Request, res: Response) => {
  const meetings = await MeetingService.getMyMeetings(req.user!.userId);
  res.json({ success: true, data: meetings });
};

export const createMeeting = async (req: Request, res: Response) => {
  const data = createMeetingSchema.parse(req.body);
  const meeting = await MeetingService.create(req.user!.userId, data);
  res.status(201).json({ success: true, data: meeting });
};

export const updateMeeting = async (req: Request, res: Response) => {
  const data = updateMeetingSchema.parse(req.body);
  const meeting = await MeetingService.update(req.params.id as string, req.user!.userId, data);
  res.json({ success: true, data: meeting });
};

export const deleteMeeting = async (req: Request, res: Response) => {
  await MeetingService.delete(req.params.id as string, req.user!.userId);
  res.json({ success: true, message: 'Meeting deleted successfully' });
};

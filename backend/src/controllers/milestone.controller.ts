import { Request, Response } from 'express';
import { MilestoneService } from '../services/milestone.service';
import { StartupService } from '../services/startup.service';
import { Status } from '../types/enums';
import { z } from 'zod';

const createMilestoneSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  dueDate: z.string().datetime()
});

const updateMilestoneSchema = z.object({
  status: z.nativeEnum(Status)
});

export const getMyMilestones = async (req: Request, res: Response) => {
  const startup = await StartupService.getByUserId(req.user!.userId);
  if (!startup) return res.json({ success: true, data: [] });
  const milestones = await MilestoneService.getByStartup(startup.id);
  res.json({ success: true, data: milestones });
};

export const createMilestone = async (req: Request, res: Response) => {
  const data = createMilestoneSchema.parse(req.body);
  const startup = await StartupService.getByUserId(req.user!.userId);
  if (!startup) return res.status(404).json({ error: 'Startup not found' });
  const milestone = await MilestoneService.create(startup.id, data);
  res.status(201).json({ success: true, data: milestone });
};

export const updateMilestone = async (req: Request, res: Response) => {
  const data = updateMilestoneSchema.parse(req.body);
  const startup = await StartupService.getByUserId(req.user!.userId);
  if (!startup) return res.status(404).json({ error: 'Startup not found' });
  const milestone = await MilestoneService.updateStatus(req.params.id as string, startup.id, data.status);
  res.json({ success: true, data: milestone });
};

export const deleteMilestone = async (req: Request, res: Response) => {
  const startup = await StartupService.getByUserId(req.user!.userId);
  if (!startup) return res.status(404).json({ error: 'Startup not found' });
  await MilestoneService.delete(req.params.id as string, startup.id);
  res.json({ success: true, message: 'Milestone deleted' });
};

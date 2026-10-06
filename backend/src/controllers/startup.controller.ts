import { Request, Response } from 'express';
import { StartupService } from '../services/startup.service';
import { z } from 'zod';

const createStartupSchema = z.object({
  companyName: z.string().min(2),
  domain: z.string().min(2),
  elevatorPitch: z.string().optional(),
  pitchDeckUrl: z.string().url().optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
});

export const getAll = async (req: Request, res: Response) => {
  const startups = await StartupService.getAll();
  res.json({ success: true, data: startups });
};

export const getById = async (req: Request, res: Response) => {
  const startup = await StartupService.getById(req.params.id as string);
  res.json({ success: true, data: startup });
};

export const getMyStartup = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const startup = await StartupService.getByUserId(userId);
  res.json({ success: true, data: startup });
};

export const create = async (req: Request, res: Response) => {
  const data = createStartupSchema.parse(req.body);
  const startup = await StartupService.create(req.user!.userId, data);
  res.status(201).json({ success: true, data: startup, message: 'Startup profile created successfully' });
};

export const update = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const data = createStartupSchema.partial().parse(req.body);
  const startup = await StartupService.updateByUserId(userId, data);
  res.json({ success: true, data: startup, message: 'Startup profile updated successfully' });
};

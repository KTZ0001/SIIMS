import { Request, Response } from 'express';
import { FundingService } from '../services/funding.service';
import { StartupService } from '../services/startup.service';
import { z } from 'zod';

const createFundingSchema = z.object({
  targetAmount: z.number().positive(),
  valuationCap: z.number().positive()
});

export const getMyFundingRequests = async (req: Request, res: Response) => {
  const startup = await StartupService.getByUserId(req.user!.userId);
  if (!startup) return res.json({ success: true, data: [] });
  const requests = await FundingService.getByStartup(startup.id);
  res.json({ success: true, data: requests });
};

export const createFundingRequest = async (req: Request, res: Response) => {
  const data = createFundingSchema.parse(req.body);
  const startup = await StartupService.getByUserId(req.user!.userId);
  if (!startup) return res.status(404).json({ error: 'Startup not found' });
  const request = await FundingService.create(startup.id, data);
  res.status(201).json({ success: true, data: request });
};

export const deleteFundingRequest = async (req: Request, res: Response) => {
  const startup = await StartupService.getByUserId(req.user!.userId);
  if (!startup) return res.status(404).json({ error: 'Startup not found' });
  await FundingService.delete(req.params.id as string, startup.id);
  res.json({ success: true, message: 'Funding request deleted' });
};

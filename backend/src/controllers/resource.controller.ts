import { Request, Response } from 'express';
import { ResourceService } from '../services/resource.service';
import { z } from 'zod';

const resourceSchema = z.object({
  startupId: z.string().uuid(),
  title: z.string().min(1),
  url: z.string().url()
});

export const uploadResource = async (req: Request, res: Response) => {
  const data = resourceSchema.parse(req.body);
  const resource = await ResourceService.uploadResource(req.user!.userId, data);
  res.status(201).json({ success: true, data: resource });
};

export const getResources = async (req: Request, res: Response) => {
  const resources = await ResourceService.getResources(req.user!.userId, req.params.startupId as string);
  res.json({ success: true, data: resources });
};

export const deleteResource = async (req: Request, res: Response) => {
  await ResourceService.deleteResource(req.user!.userId, req.params.id as string);
  res.json({ success: true, message: 'Resource deleted successfully' });
};

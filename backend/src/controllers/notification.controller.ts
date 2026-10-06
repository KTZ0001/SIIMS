import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';

export const getMyNotifications = async (req: Request, res: Response) => {
  const notifs = await NotificationService.getMy(req.user!.userId);
  res.json({ success: true, data: notifs });
};

export const markAsRead = async (req: Request, res: Response) => {
  await NotificationService.markRead(req.params.id as string);
  res.json({ success: true });
};

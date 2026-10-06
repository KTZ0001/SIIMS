import { Request, Response } from 'express';
import { MentorService } from '../services/mentor.service';

export class MentorController {
  static async getDashboard(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const data = await MentorService.getDashboardStats(userId);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

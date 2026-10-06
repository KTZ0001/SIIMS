import { Request, Response } from 'express';
import { InvestorService } from '../services/investor.service';

export class InvestorController {
  static async getDashboard(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const data = await InvestorService.getDashboardStats(userId);
      res.status(200).json({ success: true, data });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

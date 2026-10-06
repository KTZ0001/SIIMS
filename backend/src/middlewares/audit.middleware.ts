import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { logger } from '../config/logger';

export const auditLog = (actionName: string, entityName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Intercept response finish
    res.on('finish', async () => {
      // Only log successful mutating requests
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const userId = req.user?.userId;
          let entityId = req.params?.id || req.body?.id || 'N/A';
          
          await prisma.auditLog.create({
            data: {
              action: actionName,
              entity: entityName,
              entityId: entityId,
              userId: userId || null,
            }
          });
        } catch (error) {
          logger.error('Failed to write audit log:', error);
        }
      }
    });

    next();
  };
};

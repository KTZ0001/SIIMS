import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${err.name}: ${err.message}\n${err.stack}`);
  
  if (err instanceof ZodError) {
    const formattedErrors = (err as any).errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return res.status(400).json({
      success: false,
      error: `Validation failed: ${formattedErrors}`
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

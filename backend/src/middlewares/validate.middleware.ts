import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const validate = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });
      next();
    } catch (error: any) {
      if (error instanceof ZodError || error.name === 'ZodError') {
        const errors = (error as any).issues || (error as any).errors || [];
        return res.status(400).json({
          success: false,
          errors: errors.map((e: any) => ({ path: e.path?.join('.'), message: e.message }))
        });
      }
      next(error);
    }
  };
};

import { Request, Response } from 'express';
import { findUserById, updateUser } from '../services/auth.service';

export const getProfile = async (req: Request, res: Response) => {
  const user = await findUserById(req.user!.userId);
  if (user) {
    delete user.passwordHash;
    delete user.otp;
    delete user.resetPasswordToken;
  }
  res.json({ success: true, data: user });
};

export const updateProfile = async (req: Request, res: Response) => {
  const { firstName, lastName } = req.body;
  const existing = await findUserById(req.user!.userId);
  if (!existing) return res.status(404).json({ error: 'User not found' });
  
  const user = await updateUser(req.user!.userId, existing.role, { firstName, lastName });
  if (user) {
    delete user.passwordHash;
    delete user.otp;
    delete user.resetPasswordToken;
  }
  res.json({ success: true, data: user, message: 'Profile updated successfully' });
};

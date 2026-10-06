import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

export class AuthController {
  static async register(req: Request, res: Response) {
    const result = await AuthService.register(req.body);
    res.status(201).json({ success: true, message: result.message });
  }

  static async login(req: Request, res: Response) {
    const { accessToken, refreshToken, user } = await AuthService.login(req.body);
    setRefreshCookie(res, refreshToken);
    res.json({ success: true, data: { accessToken, user } });
  }

  static async logout(req: Request, res: Response) {
    clearRefreshCookie(res);
    res.json({ success: true, message: 'Logged out successfully' });
  }

  static async forgotPassword(req: Request, res: Response) {
    const result = await AuthService.forgotPassword(req.body.email);
    res.json({ success: true, message: result.message });
  }

  static async resetPassword(req: Request, res: Response) {
    const { token, password } = req.body;
    const result = await AuthService.resetPassword(token, password);
    res.json({ success: true, message: result.message });
  }

  static async googleLogin(req: Request, res: Response) {
    const { credential, role } = req.body;
    const { accessToken, refreshToken, user } = await AuthService.googleLogin(credential, role);
    setRefreshCookie(res, refreshToken);
    res.json({ success: true, data: { accessToken, user } });
  }

  static async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw Object.assign(new Error('Refresh token missing'), { statusCode: 401 });
    
    const { accessToken } = await AuthService.refresh(refreshToken);
    res.json({ success: true, data: { accessToken } });
  }
}

import bcrypt from 'bcrypt';
import { prisma } from '../config/db';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { generateResetToken } from '../utils/otp.utils';
import { sendEmail } from '../utils/email.utils';
import { OAuth2Client } from 'google-auth-library';
import { Role } from '../types/enums';
import { DemoService } from './demo.service';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const findUserByEmail = async (email: string) => {
  let user = await prisma.founder.findUnique({ where: { email } });
  if (user) return user;
  user = await prisma.mentor.findUnique({ where: { email } });
  if (user) return user;
  user = await prisma.investor.findUnique({ where: { email } });
  if (user) return user;
  user = await prisma.incubationManager.findUnique({ where: { email } });
  if (user) return user;
  user = await prisma.administrator.findUnique({ where: { email } });
  return user;
};

export const findUserById = async (id: string) => {
  let user = await prisma.founder.findUnique({ where: { id } });
  if (user) return user;
  user = await prisma.mentor.findUnique({ where: { id } });
  if (user) return user;
  user = await prisma.investor.findUnique({ where: { id } });
  if (user) return user;
  user = await prisma.incubationManager.findUnique({ where: { id } });
  if (user) return user;
  user = await prisma.administrator.findUnique({ where: { id } });
  return user;
};

export const updateUser = async (id: string, role: string, data: any) => {
  switch (role) {
    case Role.FOUNDER: return await prisma.founder.update({ where: { id }, data });
    case Role.MENTOR: return await prisma.mentor.update({ where: { id }, data });
    case Role.INVESTOR: return await prisma.investor.update({ where: { id }, data });
    case Role.MANAGER: return await prisma.incubationManager.update({ where: { id }, data });
    case Role.ADMIN: return await prisma.administrator.update({ where: { id }, data });
  }
};

export class AuthService {
  static async register(data: any) {
    const existingUser = await findUserByEmail(data.email);
    if (existingUser) throw Object.assign(new Error('Email already in use'), { statusCode: 409 });

    const passwordHash = await bcrypt.hash(data.password, 10);

    const userData = {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      isEmailVerified: true
    };

    let user;
    switch (data.role) {
      case Role.FOUNDER:
        user = await prisma.founder.create({ data: userData });
        break;
      case Role.MENTOR:
        user = await prisma.mentor.create({ data: userData });
        break;
      case Role.INVESTOR:
        user = await prisma.investor.create({ data: userData });
        break;
      case Role.MANAGER:
        user = await prisma.incubationManager.create({ data: userData });
        break;
      case Role.ADMIN:
        user = await prisma.administrator.create({ data: userData });
        break;
      default:
        throw new Error('Invalid role');
    }

    await DemoService.provisionUser(user.id, user.role);

    return { message: 'Registration successful' };
  }

  static async login(data: any) {
    const user = await findUserByEmail(data.email);
    if (!user) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    
    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });
    
    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });
    
    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName } };
  }

  static async forgotPassword(email: string) {
    const user = await findUserByEmail(email);
    if (!user) return { message: 'If an account with that email exists, a reset link has been sent.' };

    const resetToken = generateResetToken();
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    await updateUser(user.id, user.role, { resetPasswordToken: resetToken, resetPasswordExpires });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    await sendEmail(user.email, 'Reset your SIIMS Password', `Click here to reset your password: ${resetUrl}`);
    
    return { message: 'If an account with that email exists, a reset link has been sent.' };
  }

  static async resetPassword(token: string, newPassword: string) {
    let user = null;
    const allStores = [prisma.founder, prisma.mentor, prisma.investor, prisma.incubationManager, prisma.administrator];
    for (const store of allStores) {
      const users = await store.findMany();
      const match = users.find(u => u.resetPasswordToken === token && new Date(u.resetPasswordExpires) > new Date());
      if (match) {
        user = match;
        break;
      }
    }

    if (!user) throw Object.assign(new Error('Invalid or expired reset token'), { statusCode: 400 });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updateUser(user.id, user.role, {
      passwordHash,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    return { message: 'Password reset successful.' };
  }

  static async googleLogin(credential: string, roleIfNew: Role = Role.FOUNDER) {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) throw Object.assign(new Error('Invalid Google token'), { statusCode: 400 });

    let user = await findUserByEmail(payload.email);

    if (!user) {
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      const userData = {
        email: payload.email,
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        passwordHash: randomPassword,
        role: roleIfNew,
        isEmailVerified: true,
        googleId: payload.sub,
      };

      switch (roleIfNew) {
        case Role.FOUNDER: user = await prisma.founder.create({ data: userData }); break;
        case Role.MENTOR: user = await prisma.mentor.create({ data: userData }); break;
        case Role.INVESTOR: user = await prisma.investor.create({ data: userData }); break;
        case Role.MANAGER: user = await prisma.incubationManager.create({ data: userData }); break;
        case Role.ADMIN: user = await prisma.administrator.create({ data: userData }); break;
      }
    } else if (!user.googleId) {
      await updateUser(user.id, user.role, { googleId: payload.sub, isEmailVerified: true });
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });
    
    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName } };
  }

  static async refresh(token: string) {
    try {
      const decoded = verifyRefreshToken(token);
      const accessToken = generateAccessToken({ userId: decoded.userId, role: decoded.role as any });
      return { accessToken };
    } catch (e) {
      throw Object.assign(new Error('Invalid refresh token'), { statusCode: 401 });
    }
  }
}

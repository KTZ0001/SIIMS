import request from 'supertest';
import app from '../src/server';
import { prismaMock } from './setup/db.mock';
import bcrypt from 'bcrypt';
import { generateRefreshToken } from '../src/utils/jwt.utils';
import { Role } from '../../src/types/enums';

describe('Auth Endpoints Audit', () => {

  describe('POST /api/auth/register', () => {
    it('should validate malformed payloads with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'not-an-email', password: '123' });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 409 if email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: '1', email: 'test@siims.io' } as any);
      
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@siims.io', password: 'password123', firstName: 'John', lastName: 'Doe', role: 'FOUNDER' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Email already in use');
    });

    it('should create user and return OTP message on success', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      prismaMock.user.create.mockResolvedValueOnce({ id: 'user-1', email: 'new@siims.io', role: 'FOUNDER' } as any);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'new@siims.io', password: 'password123', firstName: 'John', lastName: 'Doe', role: 'FOUNDER' });

      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/Registration successful/);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 401 on invalid credentials', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'wrong@siims.io', password: 'pass' });

      expect(res.status).toBe(401);
    });

    it('should return 403 if email is not verified', async () => {
      const hash = await bcrypt.hash('correctpass', 10);
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'user-1', email: 'test@siims.io', passwordHash: hash, role: 'INVESTOR', isEmailVerified: false
      } as any);
      prismaMock.user.update.mockResolvedValueOnce({} as any);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@siims.io', password: 'correctpass' });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Email not verified/);
    });

    it('should login successfully and return tokens as cookies for verified users', async () => {
      const hash = await bcrypt.hash('correctpass', 10);
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'user-1', email: 'test@siims.io', passwordHash: hash, role: 'INVESTOR', isEmailVerified: true
      } as any);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@siims.io', password: 'correctpass' });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=/);
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should return 400 on invalid OTP', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'user-1', email: 'test@siims.io', isEmailVerified: false, otp: '123456', otpExpires: new Date(Date.now() + 10000)
      } as any);

      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ email: 'test@siims.io', otp: '654321' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid or expired OTP');
    });

    it('should verify email and return tokens', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({
        id: 'user-1', email: 'test@siims.io', role: 'FOUNDER', isEmailVerified: false, otp: '123456', otpExpires: new Date(Date.now() + 10000)
      } as any);
      prismaMock.user.update.mockResolvedValueOnce({} as any);

      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ email: 'test@siims.io', otp: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=/);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return 400 on missing cookie', async () => {
      const res = await request(app).post('/api/auth/refresh');
      expect(res.status).toBe(400); // validation failure
    });

    it('should return 401 on invalid token in cookie', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=invalid.token.here']);
      
      expect(res.status).toBe(401);
    });

    it('should return new access token on valid refresh token', async () => {
      const validToken = generateRefreshToken({ userId: '1', role: 'ADMIN' });
      
      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${validToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });
  });

  describe('POST /api/auth/forgot-password & reset-password', () => {
    it('should send reset link successfully', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: '1', email: 'test@siims.io' } as any);
      prismaMock.user.update.mockResolvedValueOnce({} as any);

      const res = await request(app).post('/api/auth/forgot-password').send({ email: 'test@siims.io' });
      expect(res.status).toBe(200);
    });

    it('should reset password on valid token', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce({ id: '1', email: 'test@siims.io' } as any);
      prismaMock.user.update.mockResolvedValueOnce({} as any);

      const res = await request(app).post('/api/auth/reset-password').send({ token: 'validtoken', password: 'newpassword123' });
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Password reset successful.');
    });
  });
});

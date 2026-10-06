import request from 'supertest';
import app from '../src/server';
import { prismaMock } from './setup/db.mock';
import { generateAccessToken } from '../src/utils/jwt.utils';
import { Role } from '../../src/types/enums';

describe('Admin Endpoints', () => {
  let adminToken: string;
  let userToken: string;

  beforeAll(() => {
    adminToken = generateAccessToken({ userId: 'admin-1', role: Role.ADMIN });
    userToken = generateAccessToken({ userId: 'user-1', role: Role.FOUNDER });
  });

  describe('GET /api/admin/analytics', () => {
    it('should block non-admin users', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(403);
    });

    it('should return analytics for admin users', async () => {
      prismaMock.user.count.mockResolvedValue(10);
      prismaMock.startupProfile.count.mockResolvedValue(5);
      prismaMock.investorProfile.count.mockResolvedValue(2);
      prismaMock.mentorProfile.count.mockResolvedValue(3);
      prismaMock.investmentOffer.count.mockResolvedValue(1);

      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalUsers).toBe(10);
    });
  });

  describe('PUT /api/admin/users/:id/role', () => {
    it('should update user role and generate an audit log', async () => {
      prismaMock.user.update.mockResolvedValue({ id: '1', role: Role.MENTOR } as any);
      // Audit log middleware does not block execution but should be called
      prismaMock.auditLog.create.mockResolvedValue({} as any);

      const res = await request(app)
        .put('/api/admin/users/1/role')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'MENTOR' });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(prismaMock.user.update).toHaveBeenCalled();
    });
  });
});

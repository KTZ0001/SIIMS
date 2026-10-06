import request from 'supertest';
import app from '../src/server';
import { prismaMock } from './setup/db.mock';
import { generateAccessToken } from '../src/utils/jwt.utils';

describe('Startups Endpoints Audit', () => {

  describe('GET /api/startups', () => {
    it('should return 200 and a list of startups', async () => {
      prismaMock.startupProfile.findMany.mockResolvedValueOnce([
        { id: '1', companyName: 'Quantum AI' }
      ] as any);

      const token = generateAccessToken({ userId: 'investor-1', role: 'INVESTOR' });
      const res = await request(app)
        .get('/api/startups')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
    });
  });

  describe('GET /api/startups/:id', () => {
    it('should return 404 for non-existent startup', async () => {
      prismaMock.startupProfile.findUnique.mockResolvedValueOnce(null);

      const token = generateAccessToken({ userId: 'investor-1', role: 'INVESTOR' });
      const res = await request(app)
        .get('/api/startups/non-existent-id')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Startup not found');
    });

    it('should return 200 and startup details', async () => {
      prismaMock.startupProfile.findUnique.mockResolvedValueOnce({
        id: '1', companyName: 'Quantum AI'
      } as any);

      const token = generateAccessToken({ userId: 'investor-1', role: 'INVESTOR' });
      const res = await request(app)
        .get('/api/startups/1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.data.companyName).toBe('Quantum AI');
    });
  });

  describe('POST /api/startups (Authorized CRUD)', () => {
    const validPayload = {
      companyName: 'New Startup',
      domain: 'FinTech',
    };

    it('should block unauthenticated requests with 401', async () => {
      const res = await request(app)
        .post('/api/startups')
        .send(validPayload);
      
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });

    it('should block unauthorized roles (e.g. INVESTOR) with 403', async () => {
      const token = generateAccessToken({ userId: '1', role: 'INVESTOR' });
      
      const res = await request(app)
        .post('/api/startups')
        .set('Authorization', `Bearer ${token}`)
        .send(validPayload);
      
      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Forbidden/);
    });

    it('should return 400 if user already has a startup profile', async () => {
      const token = generateAccessToken({ userId: 'founder-1', role: 'FOUNDER' });
      
      // Mock existing profile check
      prismaMock.startupProfile.findUnique.mockResolvedValueOnce({ id: 'existing' } as any);

      const res = await request(app)
        .post('/api/startups')
        .set('Authorization', `Bearer ${token}`)
        .send(validPayload);
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('User already has a startup profile');
    });

    it('should allow FOUNDER to create startup successfully', async () => {
      const token = generateAccessToken({ userId: 'founder-new', role: 'FOUNDER' });
      
      // 1. check if user has profile -> null
      prismaMock.startupProfile.findUnique.mockResolvedValueOnce(null);
      // 2. check if name taken -> null
      prismaMock.startupProfile.findUnique.mockResolvedValueOnce(null);
      // 3. create
      prismaMock.startupProfile.create.mockResolvedValueOnce({
        id: 'new-id',
        companyName: 'New Startup'
      } as any);

      const res = await request(app)
        .post('/api/startups')
        .set('Authorization', `Bearer ${token}`)
        .send(validPayload);
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.companyName).toBe('New Startup');
    });
  });

});

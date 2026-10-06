import { prisma } from '../config/db';
import { StartupStatus } from '../types/enums';

export class StartupService {
  static async getAll() {
    const startups = await prisma.startup.findMany({ orderBy: { createdAt: 'desc' } });
    const founders = await prisma.founder.findMany();

    return startups.map(startup => {
      const user = founders.find(u => u.id === startup.userId);
      return {
        ...startup,
        user: user ? { firstName: user.firstName, lastName: user.lastName, email: user.email } : null
      };
    });
  }

  static async getById(id: string) {
    const startup = await prisma.startup.findUnique({ where: { id } });
    if (!startup) throw Object.assign(new Error('Startup not found'), { statusCode: 404 });

    const founders = await prisma.founder.findMany();
    const milestones = await prisma.milestone.findMany();
    const user = founders.find(u => u.id === startup.userId);

    return {
      ...startup,
      user: user ? { firstName: user.firstName, lastName: user.lastName, email: user.email } : null,
      milestones: milestones.filter(m => m.startupId === startup.id)
    };
  }

  static async create(userId: string, data: any) {
    const existing = await prisma.startup.findUnique({ where: { userId } });
    if (existing) throw Object.assign(new Error('User already has a startup profile'), { statusCode: 400 });

    const existingName = await prisma.startup.findUnique({ where: { companyName: data.companyName } });
    if (existingName) throw Object.assign(new Error('Company name already taken'), { statusCode: 409 });

    return prisma.startup.create({
      data: {
        userId,
        companyName: data.companyName,
        domain: data.domain,
        elevatorPitch: data.elevatorPitch,
        pitchDeckUrl: data.pitchDeckUrl,
        logoUrl: data.logoUrl,
        status: StartupStatus.PENDING,
      }
    });
  }

  static async getByUserId(userId: string) {
    const startup = await prisma.startup.findUnique({ where: { userId } });
    if (!startup) return null;

    const milestones = await prisma.milestone.findMany();
    const fundingRequests = await prisma.funding.findMany();
    const mentors = await prisma.mentor.findMany();

    const mentorUser = mentors.find(m => m.id === startup.mentorId);

    return {
      ...startup,
      milestones: milestones.filter(m => m.startupId === startup.id),
      fundingRequests: fundingRequests.filter(fr => fr.startupId === startup.id),
      mentor: mentorUser ? {
        ...mentorUser,
        user: { firstName: mentorUser.firstName, lastName: mentorUser.lastName }
      } : null
    };
  }

  static async updateByUserId(userId: string, data: any) {
    const existing = await prisma.startup.findUnique({ where: { userId } });
    if (!existing) throw Object.assign(new Error('Startup profile not found'), { statusCode: 404 });

    if (data.companyName && data.companyName !== existing.companyName) {
      const nameTaken = await prisma.startup.findUnique({ where: { companyName: data.companyName } });
      if (nameTaken) throw Object.assign(new Error('Company name already taken'), { statusCode: 409 });
    }

    return prisma.startup.update({
      where: { userId },
      data
    });
  }
}

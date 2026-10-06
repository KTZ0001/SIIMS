import { prisma } from '../config/db';

export class IncubationService {
  static async getDashboardStats(userId: string) {
    const manager = await prisma.incubationManager.findUnique({ where: { id: userId } });
    const startups = await prisma.startup.findMany();
    const applications = await prisma.application.findMany();
    const fundingRequests = await prisma.funding.findMany();

    const pendingApplications = applications.filter((a: any) => a.status === 'PENDING').length;
    
    return {
      manager,
      startups,
      applications,
      fundingRequests,
      stats: {
        totalStartups: startups.length,
        activeStartups: startups.filter(s => s.status === 'APPROVED').length,
        pendingApplications,
        totalFundingRequests: fundingRequests.length
      }
    };
  }
}

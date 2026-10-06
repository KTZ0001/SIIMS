import { prisma } from '../config/db';

export class AdminService {
  static async getDashboardStats(userId: string) {
    const admin = await prisma.administrator.findUnique({ where: { id: userId } });
    
    // Admins have access to everything, but for dashboard they need high-level analytics
    const analytics = await prisma.analytics.findFirst({ where: { type: 'dashboard' } });

    // Since we split the users, we can calculate real totals
    const founders = await prisma.founder.findMany();
    const mentors = await prisma.mentor.findMany();
    const investors = await prisma.investor.findMany();
    const managers = await prisma.incubationManager.findMany();
    const startups = await prisma.startup.findMany();
    const applications = await prisma.application.findMany();
    const funding = await prisma.funding.findMany();

    let totalOffers = 0;
    funding.forEach(f => {
      if (f.offers) totalOffers += f.offers.length;
    });

    const stats = {
      totalUsers: founders.length + mentors.length + investors.length + managers.length + 1, // + 1 for the admin
      startups: startups.length,
      investors: investors.length,
      mentors: mentors.length,
      totalOffers
    };

    return {
      admin,
      stats,
      analytics // Stored historical snapshot or detailed metrics
    };
  }
}

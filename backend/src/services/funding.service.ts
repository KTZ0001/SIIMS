import { prisma } from '../config/db';

const getAllUsers = async () => {
  return [
    ...(await prisma.founder.findMany()),
    ...(await prisma.mentor.findMany()),
    ...(await prisma.investor.findMany()),
    ...(await prisma.incubationManager.findMany()),
    ...(await prisma.administrator.findMany())
  ];
};

export class FundingService {
  static async getByStartup(startupId: string) {
    const requests = await prisma.funding.findMany({ orderBy: { createdAt: 'desc' } });
    const startupRequests = requests.filter(r => r.startupId === startupId);

    const investors = await prisma.investor.findMany();
    const users = await getAllUsers();

    return startupRequests.map(req => {
      const mappedOffers = (req.offers || []).map((offer: any) => {
        const investor = investors.find(i => i.id === offer.investorId);
        const user = users.find(u => u.id === offer.investorId); // Assuming investor id is user id in simplified JSON
        
        return {
          ...offer,
          investor: investor ? {
            ...investor,
            user: user ? { firstName: user.firstName, lastName: user.lastName } : null
          } : null
        };
      });

      return {
        ...req,
        offers: mappedOffers
      };
    });
  }

  static async create(startupId: string, data: any) {
    return prisma.funding.create({
      data: {
        startupId,
        targetAmount: data.targetAmount,
        valuationCap: data.valuationCap,
        status: 'OPEN',
        offers: []
      }
    });
  }

  static async delete(id: string, startupId: string) {
    const req = await prisma.funding.findUnique({ where: { id } });
    if (!req) throw Object.assign(new Error('Not found'), { statusCode: 404 });
    if (req.startupId !== startupId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    return prisma.funding.delete({ where: { id } });
  }
}

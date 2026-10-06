import { prisma } from '../config/db';

export class InvestorService {
  static async getDashboardStats(userId: string) {
    const investor = await prisma.investor.findUnique({ where: { id: userId } });
    const fundingRequests = await prisma.funding.findMany();
    
    // An investor's portfolio could be derived from funding requests where this investor has ACCEPTED offers
    const portfolio: any[] = [];
    let totalInvested = 0;

    for (const req of fundingRequests) {
      if (req.offers) {
        const acceptedOffer = req.offers.find((o: any) => o.investorId === userId && o.status === 'ACCEPTED');
        if (acceptedOffer) {
          totalInvested += Number(acceptedOffer.amount);
          portfolio.push({ request: req, offer: acceptedOffer });
        }
      }
    }

    const openRequests = fundingRequests.filter(req => req.status === 'OPEN');
    const notifications = await prisma.notification.findMany({ where: { userId } });

    return {
      investor,
      portfolio,
      openRequests,
      notifications,
      stats: {
        totalInvested,
        portfolioSize: portfolio.length,
        openRequestsCount: openRequests.length,
        investorInterest: 12,
        messages: 5
      }
    };
  }
}

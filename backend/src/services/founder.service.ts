import { prisma } from '../config/db';

export class FounderService {
  static async getDashboardStats(userId: string) {
    const startup = await prisma.startup.findFirst({ where: { userId } });
    if (!startup) {
      return { message: 'No startup registered yet.' };
    }

    const mentor = startup.mentorId ? await prisma.mentor.findUnique({ where: { id: startup.mentorId } }) : null;
    const fundingRequests = await prisma.funding.findMany({ where: { startupId: startup.id } });
    const meetings = await prisma.meeting.findMany({ where: { hostId: userId } });
    const notifications = await prisma.notification.findMany({ where: { userId } });

    // Since milestones aren't in a separate collection right now (or they are, let's see. Wait, milestones are missing from db.ts! Let's mock them or check if they exist).
    // Actually, we removed milestones from db.ts to simplify. Let's just return what we have.

    return {
      startup,
      mentor,
      fundingRequests,
      meetings,
      notifications,
      stats: {
        startupScore: 92,
        totalVisitors: 12486,
        profileViews: 2184,
        fundingRaised: startup.fundingRaised || 1250000,
        pendingApplications: 2,
        meetings: meetings.length,
        notifications: notifications.length,
        messages: 27,
        tasks: 34,
        docsUploaded: 21
      },
      charts: {
        monthlyVisitors: [
          { name: 'Jan', value: 4500 },
          { name: 'Feb', value: 6800 },
          { name: 'Mar', value: 8500 },
          { name: 'Apr', value: 10200 },
          { name: 'May', value: 12486 }
        ],
        startupGrowth: [
          { name: 'Q1', mrr: 12000, users: 500 },
          { name: 'Q2', mrr: 25000, users: 1200 },
          { name: 'Q3', mrr: 48000, users: 3000 },
          { name: 'Q4', mrr: 85000, users: 7500 }
        ],
        fundingProgress: [
          { name: 'Raised', value: startup.fundingRaised || 1250000 },
          { name: 'Remaining', value: (startup.fundingGoal || 2500000) - (startup.fundingRaised || 1250000) }
        ],
        applicationStatus: [
          { name: 'Approved', value: 3 },
          { name: 'Pending', value: 2 },
          { name: 'Rejected', value: 1 }
        ],
        revenueProjection: [
          { month: 'Jul', actual: 85000, projected: 85000 },
          { month: 'Aug', actual: null, projected: 95000 },
          { month: 'Sep', actual: null, projected: 110000 },
          { month: 'Oct', actual: null, projected: 130000 }
        ]
      },
      tables: {
        recentActivities: [
          { id: '1', action: 'Uploaded Pitch Deck', date: new Date(Date.now() - 86400000).toISOString() },
          { id: '2', action: 'Meeting with Mentor', date: new Date(Date.now() - 86400000 * 2).toISOString() },
          { id: '3', action: 'Received Funding Offer', date: new Date(Date.now() - 86400000 * 5).toISOString() }
        ],
        documents: [
          { id: '1', name: 'Q1 Financials.pdf', size: '2.4 MB', uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
          { id: '2', name: 'Pitch_Deck_v3.pdf', size: '15 MB', uploadedAt: new Date(Date.now() - 86400000).toISOString() },
          { id: '3', name: 'Cap_Table.xlsx', size: '1.1 MB', uploadedAt: new Date(Date.now() - 86400000 * 15).toISOString() }
        ],
        messages: [
          { id: '1', sender: 'Alice Chen', content: 'The new feature is deployed.', time: '10:30 AM' },
          { id: '2', sender: 'Dr. Rahul Sharma', content: 'Great pitch deck. Let us discuss.', time: 'Yesterday' }
        ],
        milestones: [
          { id: '1', title: 'Seed Round Closed', status: 'COMPLETED', date: new Date(Date.now() - 86400000 * 30).toISOString() },
          { id: '2', title: 'Product Launch', status: 'IN_PROGRESS', date: new Date(Date.now() + 86400000 * 15).toISOString() },
          { id: '3', title: 'Series A Preparation', status: 'PENDING', date: new Date(Date.now() + 86400000 * 90).toISOString() }
        ]
      }
    };
  }
}

import { prisma } from '../config/db';

export class MentorService {
  static async getDashboardStats(userId: string) {
    const mentor = await prisma.mentor.findUnique({ where: { id: userId } });
    const assignedStartups = await prisma.startup.findMany({ where: { mentorId: userId } });
    
    let pendingEvaluations = 0;
    // Assuming evaluations might be checked against startups, or we just mock based on assigned startups
    assignedStartups.forEach((s: any) => {
      // In a real system we'd check evaluation records
      pendingEvaluations += 1; 
    });

    const meetings = await prisma.meeting.findMany({ where: { hostId: userId } });
    const notifications = await prisma.notification.findMany({ where: { userId } });

    return {
      mentor,
      assignedStartups,
      meetings,
      notifications,
      stats: {
        activeMentees: assignedStartups.length,
        pendingEvaluations,
        hoursMentored: meetings.filter(m => m.status === 'COMPLETED').length,
        mentorFeedback: 48
      }
    };
  }
}

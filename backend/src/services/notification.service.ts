import { prisma } from '../config/db';

export class NotificationService {
  static async getMy(userId: string) {
    const notifications = await prisma.notification.findMany({ orderBy: { createdAt: 'desc' } });
    return notifications.filter(n => n.userId === userId);
  }
  static async markRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  }
}

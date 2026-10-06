import { prisma } from '../config/db';
import { Status } from '../types/enums';

export class MilestoneService {
  static async getByStartup(startupId: string) {
    const milestones = await prisma.milestone.findMany({
      orderBy: { dueDate: 'asc' }
    });
    return milestones.filter(m => m.startupId === startupId);
  }

  static async create(startupId: string, data: any) {
    return prisma.milestone.create({
      data: {
        startupId,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate).toISOString(),
        status: Status.PENDING
      }
    });
  }

  static async updateStatus(id: string, startupId: string, status: string) {
    const milestone = await prisma.milestone.findUnique({ where: { id } });
    if (!milestone) throw Object.assign(new Error('Not found'), { statusCode: 404 });
    if (milestone.startupId !== startupId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    return prisma.milestone.update({
      where: { id },
      data: { status, completedAt: status === Status.COMPLETED ? new Date().toISOString() : null }
    });
  }

  static async delete(id: string, startupId: string) {
    const milestone = await prisma.milestone.findUnique({ where: { id } });
    if (!milestone) throw Object.assign(new Error('Not found'), { statusCode: 404 });
    if (milestone.startupId !== startupId) throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    return prisma.milestone.delete({ where: { id } });
  }
}

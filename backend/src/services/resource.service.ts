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

export class ResourceService {
  static async uploadResource(userId: string, data: { startupId: string; title: string; url: string }) {
    const startup = await prisma.startup.findUnique({ where: { id: data.startupId } });
    if (!startup) throw Object.assign(new Error('Startup not found'), { statusCode: 404 });

    const mentors = await prisma.mentor.findMany();
    const mentorUser = mentors.find(m => m.id === startup.mentorId);

    if (startup.userId !== userId && mentorUser?.id !== userId) {
      throw Object.assign(new Error('Forbidden: You can only upload resources for your own startup or mentees.'), { statusCode: 403 });
    }

    return prisma.resource.create({
      data: {
        startupId: data.startupId,
        title: data.title,
        url: data.url,
        uploadedById: userId
      }
    });
  }

  static async getResources(userId: string, startupId: string) {
    const startup = await prisma.startup.findUnique({ where: { id: startupId } });
    if (!startup) throw Object.assign(new Error('Startup not found'), { statusCode: 404 });

    const mentors = await prisma.mentor.findMany();
    const mentorUser = mentors.find(m => m.id === startup.mentorId);
    
    const users = await getAllUsers();
    const user = users.find(u => u.id === userId);

    if (startup.userId !== userId && mentorUser?.id !== userId) {
      if (user?.role !== 'ADMIN' && user?.role !== 'MANAGER') {
        throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
      }
    }

    const resources = await prisma.resource.findMany({ orderBy: { createdAt: 'desc' } });
    const startupResources = resources.filter(r => r.startupId === startupId);

    return startupResources.map(r => {
      const uploadedBy = users.find(u => u.id === r.uploadedById);
      return {
        ...r,
        uploadedBy: uploadedBy ? { firstName: uploadedBy.firstName, lastName: uploadedBy.lastName, role: uploadedBy.role } : null
      };
    });
  }

  static async deleteResource(userId: string, resourceId: string) {
    const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!resource) throw Object.assign(new Error('Resource not found'), { statusCode: 404 });

    if (resource.uploadedById !== userId) {
      const users = await getAllUsers();
      const user = users.find(u => u.id === userId);
      if (user?.role !== 'ADMIN') {
        throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
      }
    }

    return prisma.resource.delete({ where: { id: resourceId } });
  }
}

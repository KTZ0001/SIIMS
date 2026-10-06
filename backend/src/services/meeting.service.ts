import { prisma } from '../config/db';
import { Status } from '../types/enums';

const getAllUsers = async () => {
  return [
    ...(await prisma.founder.findMany()),
    ...(await prisma.mentor.findMany()),
    ...(await prisma.investor.findMany()),
    ...(await prisma.incubationManager.findMany()),
    ...(await prisma.administrator.findMany())
  ];
};

export class MeetingService {
  static async getMyMeetings(userId: string) {
    const meetings = await prisma.meeting.findMany({
      orderBy: { startTime: 'asc' }
    });
    
    const userMeetings = meetings.filter(m => m.hostId === userId || m.guestId === userId);
    const users = await getAllUsers();

    return userMeetings.map(m => {
      const host = users.find(u => u.id === m.hostId);
      const guest = users.find(u => u.id === m.guestId);
      return {
        ...m,
        host: host ? { firstName: host.firstName, lastName: host.lastName, role: host.role } : null,
        guest: guest ? { firstName: guest.firstName, lastName: guest.lastName, role: guest.role } : null
      };
    });
  }

  static async create(hostId: string, data: any) {
    return prisma.meeting.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        hostId,
        guestId: data.guestId,
        status: Status.PENDING
      }
    });
  }

  static async update(id: string, userId: string, data: any) {
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting) throw Object.assign(new Error('Meeting not found'), { statusCode: 404 });
    if (meeting.hostId !== userId && meeting.guestId !== userId) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }
    return prisma.meeting.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.startTime && { startTime: new Date(data.startTime).toISOString() }),
        ...(data.endTime && { endTime: new Date(data.endTime).toISOString() })
      }
    });
  }

  static async delete(id: string, userId: string) {
    const meeting = await prisma.meeting.findUnique({ where: { id } });
    if (!meeting) throw Object.assign(new Error('Meeting not found'), { statusCode: 404 });
    if (meeting.hostId !== userId && meeting.guestId !== userId) {
      throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
    }
    return prisma.meeting.delete({ where: { id } });
  }
}

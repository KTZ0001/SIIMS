import { AuthService } from './services/auth.service';
import { Role } from './types/enums';
import { prisma } from './config/db';
import crypto from 'crypto';

const runSeed = async () => {
  console.log('Seeding mock users...');
  
  // Clear existing databases to avoid conflicts during seed
  console.log('Clearing old data...');
  await prisma.founder.deleteMany();
  await prisma.mentor.deleteMany();
  await prisma.investor.deleteMany();
  await prisma.incubationManager.deleteMany();
  await prisma.administrator.deleteMany();
  await prisma.startup.deleteMany();
  await prisma.application.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.funding.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.milestone.deleteMany();

  const mockUsers = [
    { email: 'founder@siims.com', password: 'Founder@123', firstName: 'Demo', lastName: 'Founder', role: Role.FOUNDER },
    { email: 'mentor@siims.com', password: 'Mentor@123', firstName: 'Demo', lastName: 'Mentor', role: Role.MENTOR },
    { email: 'investor@siims.com', password: 'Investor@123', firstName: 'Demo', lastName: 'Investor', role: Role.INVESTOR },
    { email: 'manager@siims.com', password: 'Manager@123', firstName: 'Demo', lastName: 'Manager', role: Role.MANAGER },
    { email: 'admin@siims.com', password: 'Admin@123', firstName: 'Demo', lastName: 'Admin', role: Role.ADMIN },
  ];

  for (const user of mockUsers) {
    try {
      console.log(`Registering ${user.role} - ${user.email}...`);
      await AuthService.register(user);
    } catch (e: any) {
      console.error(`Failed to seed ${user.email}:`, e.message);
    }
  }
  
  console.log('Seeding complete!');
};

runSeed().catch(e => {
  console.error(e);
  process.exit(1);
});

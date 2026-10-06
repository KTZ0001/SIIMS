import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import { prisma } from './config/db';
import { Role, StartupStatus, KYCStatus, Status, FundingStatus, OfferStatus } from './types/enums';
import crypto from 'crypto';

async function main() {
  console.log('Clearing database JSON files...');
  
  // Clear all collections
  const collections = Object.keys(prisma) as (keyof typeof prisma)[];
  for (const coll of collections) {
    if (typeof (prisma[coll] as any).deleteMany === 'function') {
      await (prisma[coll] as any).deleteMany();
    }
  }

  const passwordHash = await bcrypt.hash('password123', 10);
  console.log('Generating isolated role-based users...');

  const founders: any[] = [];
  // 50 Founders
  for (let i = 0; i < 50; i++) {
    const founder = await prisma.founder.create({
      data: {
        email: `founder${i}@example.com`,
        passwordHash,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: Role.FOUNDER,
        isEmailVerified: true,
        createdAt: faker.date.past({ years: 1 }).toISOString()
      }
    });
    founders.push(founder);
  }

  const mentors: any[] = [];
  // 20 Mentors (combined with mentor profile)
  for (let i = 0; i < 20; i++) {
    const mentor = await prisma.mentor.create({
      data: {
        email: `mentor${i}@example.com`,
        passwordHash,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: Role.MENTOR,
        isEmailVerified: true,
        expertise: faker.company.catchPhrase(),
        createdAt: faker.date.past({ years: 1 }).toISOString()
      }
    });
    mentors.push(mentor);
  }

  const investors: any[] = [];
  // 15 Investors (combined with investor profile)
  for (let i = 0; i < 15; i++) {
    const investor = await prisma.investor.create({
      data: {
        email: `investor${i}@example.com`,
        passwordHash,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: Role.INVESTOR,
        isEmailVerified: true,
        kycStatus: KYCStatus.APPROVED,
        investmentCapacity: faker.number.int({ min: 10000, max: 1000000 }),
        createdAt: faker.date.past({ years: 1 }).toISOString()
      }
    });
    investors.push(investor);
  }

  const managers: any[] = [];
  // 10 Managers
  for (let i = 0; i < 10; i++) {
    const manager = await prisma.incubationManager.create({
      data: {
        email: `manager${i}@example.com`,
        passwordHash,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: Role.MANAGER,
        isEmailVerified: true,
        createdAt: faker.date.past({ years: 1 }).toISOString()
      }
    });
    managers.push(manager);
  }

  const admins: any[] = [];
  // 5 Admins
  for (let i = 0; i < 5; i++) {
    const admin = await prisma.administrator.create({
      data: {
        email: `admin${i}@example.com`,
        passwordHash,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: Role.ADMIN,
        isEmailVerified: true,
        createdAt: faker.date.past({ years: 1 }).toISOString()
      }
    });
    admins.push(admin);
  }

  console.log('Generating 30 Startups...');
  const startups: any[] = [];
  for (let i = 0; i < 30; i++) {
    const founder = founders[i];
    const mentorId = faker.helpers.maybe(() => faker.helpers.arrayElement(mentors).id, { probability: 0.8 });
    
    const startup = await prisma.startup.create({
      data: {
        userId: founder.id, // Reference to founder
        companyName: faker.company.name(),
        domain: faker.commerce.department(),
        elevatorPitch: faker.company.catchPhrase(),
        status: faker.helpers.arrayElement([StartupStatus.APPROVED, StartupStatus.GRADUATED]),
        mentorId: mentorId,
        createdAt: faker.date.between({ from: founder.createdAt, to: new Date() }).toISOString()
      }
    });
    startups.push(startup);
  }

  console.log('Generating 120 Applications (isolated)...');
  const applications: any[] = [];
  for (let i = 30; i < 120; i++) {
    const founder = faker.helpers.arrayElement(founders);
    const app = await prisma.application.create({
      data: {
        userId: founder.id, // Reference to founder
        companyName: faker.company.name(),
        domain: faker.commerce.department(),
        elevatorPitch: faker.company.catchPhrase(),
        status: StartupStatus.PENDING,
        createdAt: faker.date.recent({ days: 60 }).toISOString()
      }
    });
    applications.push(app);
  }

  console.log('Generating Funding Requests & Offers...');
  const funding: any[] = [];
  for (let i = 0; i < 80; i++) {
    const startup = faker.helpers.arrayElement(startups);
    const request = await prisma.funding.create({
      data: {
        startupId: startup.id,
        targetAmount: faker.number.int({ min: 50000, max: 2000000 }),
        valuationCap: faker.number.int({ min: 1000000, max: 10000000 }),
        status: faker.helpers.arrayElement([FundingStatus.OPEN, FundingStatus.CLOSED, FundingStatus.FUNDED]),
        createdAt: faker.date.between({ from: startup.createdAt, to: new Date() }).toISOString(),
        offers: [] // Embed offers in funding.json
      }
    });
    
    // add some offers
    const offersCount = faker.number.int({ min: 0, max: 3 });
    for (let j = 0; j < offersCount; j++) {
      const investor = faker.helpers.arrayElement(investors);
      request.offers.push({
        id: crypto.randomUUID(),
        investorId: investor.id,
        amount: faker.number.int({ min: 10000, max: 500000 }),
        status: faker.helpers.arrayElement([OfferStatus.ACCEPTED, OfferStatus.PENDING, OfferStatus.REJECTED]),
        createdAt: faker.date.between({ from: request.createdAt, to: new Date() }).toISOString()
      });
    }
    await prisma.funding.update({ where: { id: request.id }, data: request });
    funding.push(request);
  }

  console.log('Generating Meetings (isolated)...');
  for (let i = 0; i < 100; i++) {
    const host = faker.helpers.arrayElement([...founders, ...mentors, ...investors]);
    const guest = faker.helpers.arrayElement([...founders, ...mentors, ...investors]);
    const startTime = faker.date.recent({ days: 30 });
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hr later
    await prisma.meeting.create({
      data: {
        title: faker.company.catchPhrase(),
        hostId: host.id,
        guestId: guest.id,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        status: faker.helpers.arrayElement([Status.COMPLETED, Status.PENDING]),
        createdAt: faker.date.past({ years: 2 }).toISOString()
      }
    });
  }

  console.log('Generating Notifications (isolated)...');
  for (let i = 0; i < 250; i++) {
    const user = faker.helpers.arrayElement([...founders, ...mentors, ...investors, ...managers, ...admins]);
    await prisma.notification.create({
      data: {
        userId: user.id,
        content: faker.company.catchPhrase(),
        isRead: faker.datatype.boolean(),
        createdAt: faker.date.recent({ days: 90 }).toISOString()
      }
    });
  }
  
  console.log('Generating Analytics...');
  await prisma.analytics.create({
    data: {
      type: 'dashboard',
      totalUsers: founders.length + mentors.length + investors.length + managers.length + admins.length,
      startups: startups.length,
      investors: investors.length,
      mentors: mentors.length,
      applications: applications.length,
      lastUpdated: new Date().toISOString()
    }
  });

  console.log('JSON DB Data generated successfully!');
}

main().catch(console.error);

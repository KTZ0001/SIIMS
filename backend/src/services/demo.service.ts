import { faker } from '@faker-js/faker';
import { prisma } from '../config/db';
import { Role, StartupStatus, KYCStatus, Status, FundingStatus, OfferStatus } from '../types/enums';
import crypto from 'crypto';

export class DemoService {
  static async provisionUser(userId: string, role: Role) {
    console.log(`Provisioning demo data for user ${userId} with role ${role}...`);
    const createdAt = faker.date.past({ years: 1 }).toISOString();

    const mentors = await prisma.mentor.findMany();
    const investors = await prisma.investor.findMany();

    if (role === Role.FOUNDER) {
      // Create a highly realistic demo startup profile
      const mentorId = mentors.length > 0 ? mentors[0].id : null;
      
      const startup = await prisma.startup.create({
        data: {
          userId,
          companyName: 'Nexus AI',
          domain: 'Artificial Intelligence & Healthcare',
          elevatorPitch: 'AI-driven diagnostics for early-stage disease detection.',
          description: 'Nexus AI is revolutionizing the healthcare industry by utilizing advanced machine learning models to detect early signs of diseases from medical imaging with 99% accuracy. Our mission is to make advanced diagnostics accessible to every clinic worldwide.',
          pitchDeckUrl: 'https://example.com/pitch-deck.pdf',
          logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=NexusAI&backgroundColor=0a0a0a,1a1a1a&shape1Color=00ff00',
          status: StartupStatus.APPROVED,
          stage: 'Seed',
          mentorId,
          fundingGoal: 2500000,
          fundingRaised: 1250000,
          teamMembers: [
            { name: 'Alice Chen', role: 'CTO', linkedin: 'https://linkedin.com/in/alicechen' },
            { name: 'Bob Smith', role: 'Head of Operations', linkedin: 'https://linkedin.com/in/bobsmith' }
          ],
          createdAt
        }
      });

      // Create funding requests
      const req = await prisma.funding.create({
        data: {
          startupId: startup.id,
          targetAmount: 2500000,
          valuationCap: 15000000,
          status: FundingStatus.OPEN,
          createdAt,
          offers: []
        }
      });
      
      if (investors.length > 0) {
        req.offers.push({
          id: crypto.randomUUID(),
          investorId: investors[0].id,
          amount: 500000,
          status: OfferStatus.ACCEPTED,
          createdAt
        });
        req.offers.push({
          id: crypto.randomUUID(),
          investorId: investors.length > 1 ? investors[1].id : investors[0].id,
          amount: 750000,
          status: OfferStatus.ACCEPTED,
          createdAt
        });
        await prisma.funding.update({ where: { id: req.id }, data: req });
      }

      // Generate Meetings
      const meetingTitles = ['Initial Mentorship Kickoff', 'Pitch Deck Review', 'Go-to-Market Strategy', 'Financial Projections Review', 'Investor Prep Session'];
      for (let i = 0; i < meetingTitles.length; i++) {
        await prisma.meeting.create({
          data: {
            title: meetingTitles[i],
            hostId: userId,
            guestId: mentorId ? mentorId : userId,
            startTime: (i > 2 ? faker.date.soon({ days: 10 }) : faker.date.recent({ days: 10 })).toISOString(),
            endTime: (i > 2 ? faker.date.soon({ days: 10 }) : faker.date.recent({ days: 10 })).toISOString(),
            status: i > 2 ? Status.PENDING : Status.COMPLETED,
            createdAt
          }
        });
      }

    } else if (role === Role.INVESTOR) {
      // Generate Investment Offers randomly
      for (let i = 0; i < 8; i++) {
        const fundingRequests = await prisma.funding.findMany();
        if (fundingRequests.length > 0) {
          const req = faker.helpers.arrayElement(fundingRequests);
          if (!req.offers) req.offers = [];
          req.offers.push({
            id: crypto.randomUUID(),
            investorId: userId,
            amount: faker.number.int({ min: 50000, max: 500000 }),
            status: faker.helpers.arrayElement([OfferStatus.PENDING, OfferStatus.ACCEPTED, OfferStatus.REJECTED]),
            createdAt
          });
          await prisma.funding.update({ where: { id: req.id }, data: req });
        }
      }
    }

    // Common data for everyone
    for (let i = 0; i < 20; i++) {
      await prisma.notification.create({
        data: {
          userId,
          content: faker.company.catchPhrase(),
          isRead: faker.datatype.boolean(),
          createdAt: faker.date.recent({ days: 30 }).toISOString()
        }
      });
    }

    console.log(`Demo data provisioning complete for user ${userId}.`);
  }
}

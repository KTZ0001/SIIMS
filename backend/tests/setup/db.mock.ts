
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { prisma } from '../../src/config/db';

jest.mock('../../src/config/db', () => ({
  __esModule: true,
  prisma: mockDeep<any>(),
}));

beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<any>;

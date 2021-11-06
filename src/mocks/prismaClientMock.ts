import { PrismaClient } from '@prisma/client';
import { mockDeep } from 'jest-mock-extended';
import { DeepMockProxy } from 'jest-mock-extended/lib/cjs/Mock';

export const mockPrismaClient = () => {
	const prismaClientMock: PrismaClient = mockDeep<PrismaClient>();
	prismaClientMock.$transaction = jest
		.fn()
		.mockImplementation((cb) => cb(prismaClientMock));
	return prismaClientMock as DeepMockProxy<PrismaClient>;
};

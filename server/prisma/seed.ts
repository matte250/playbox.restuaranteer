import Prisma from '@prisma/client';
const PrismaClient = Prisma.PrismaClient;

const prisma = new PrismaClient();

const runSeed = async () => {
	// Users
	prisma.user.create({
		data: {
			id: 0,
			email: 'test@test.test',
			name: 'Tester McTest',
			passwordHash:
				'$2b$10$5mx7yQ3AEzT8qzhTxzOHY.wMFzdaBTGxkUQNXkmupqIeQAOFqNp7m', // testtest
			passwordSalt: '$2b$10$5mx7yQ3AEzT8qzhTxzOHY.', // Should be removed
		},
	});
};

runSeed().finally(async () => await prisma.$disconnect());

import { PrismaClient, User as DbUser } from '.prisma/client';
import { createAuthRepository, User } from '../repository';
import { Email } from '../../../typeguard';

// Mock
jest.mock('.prisma/client', () => ({
	PrismaClient: jest.fn().mockReturnValue({
		user: {},
	}),
}));
let prismaClientMock: PrismaClient;

// Fakes
const fakeEmail = new Email('test@test.test');

// Tests
beforeEach(() => {
	prismaClientMock = new PrismaClient();
});

describe('getUserByEmail()', () => {
	it('returns "user-not-found" given a email that is not stored', async () => {
		prismaClientMock.user.findUnique = jest.fn().mockReturnValue(null);
		const authRepository = createAuthRepository(prismaClientMock);

		const getUserByEmailResponse = await authRepository.getUserByEmail(
			fakeEmail,
		);

		expect(prismaClientMock.user.findUnique).toBeCalledTimes(1);
		expect(prismaClientMock.user.findUnique).toBeCalledWith({
			where: { email: fakeEmail.value },
		});
		expect(getUserByEmailResponse).toStrictEqual({ msg: 'user-not-found' });
	});
	it('returns "user-found" and user when given a email that is stored', async () => {
		const fakeDbUser: DbUser = {
			id: 0,
			email: fakeEmail.value,
			name: '',
			passwordHash: '',
			passwordSalt: '',
		};
		prismaClientMock.user.findUnique = jest
			.fn()
			.mockReturnValue(fakeDbUser);
		const authRepository = createAuthRepository(prismaClientMock);

		const getUserByEmailResponse = await authRepository.getUserByEmail(
			fakeEmail,
		);

		expect(prismaClientMock.user.findUnique).toBeCalledTimes(1);
		expect(prismaClientMock.user.findUnique).toBeCalledWith({
			where: { email: fakeEmail.value },
		});
		expect(getUserByEmailResponse).toStrictEqual({
			msg: 'user-found',
			user: {
				id: fakeDbUser.id,
				email: new Email(fakeDbUser.email),
				name: fakeDbUser.name,
				passwordHash: fakeDbUser.passwordHash,
			},
		});
	});
});

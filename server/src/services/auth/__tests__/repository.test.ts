import { PrismaClient, User as DbUser } from '.prisma/client';
import {
	createAuthRepository,
	EmailAlreadyInUse,
	ReturnedUser,
	ReturnedUsers,
	UserCreated,
	UserNotFound,
} from '../repository';
import { Email } from '../../../typeguard';
import { User } from '../repository';
import { mockPrismaClient } from '../../../mocks/prismaClientMock';

// Mock
let prismaClientMock: PrismaClient;

// Fakes
const fakeEmail = new Email('test@test.test');
const fakeDbUser: DbUser = {
	id: 0,
	email: fakeEmail.value,
	name: '',
	passwordHash: '',
	passwordSalt: '',
};

// Tests
beforeEach(() => {
	prismaClientMock = mockPrismaClient();
});

describe('getUserByEmail()', () => {
	it('returns UserNotFound given a email that is not stored', async () => {
		prismaClientMock.user.findUnique = jest.fn().mockReturnValue(null);
		const authRepository = createAuthRepository(prismaClientMock);

		const getUserByEmailResponse = await authRepository.getUserByEmail(
			fakeEmail,
		);

		expect(prismaClientMock.user.findUnique).toBeCalledTimes(1);
		expect(prismaClientMock.user.findUnique).toBeCalledWith({
			where: { email: fakeEmail.value },
		});
		expect(getUserByEmailResponse).toStrictEqual(new UserNotFound());
	});
	it('returns ReturnedUser and user when given a email that is stored', async () => {
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
		expect(getUserByEmailResponse).toStrictEqual(
			new ReturnedUser({
				id: fakeDbUser.id,
				email: new Email(fakeDbUser.email),
				name: fakeDbUser.name,
				passwordHash: fakeDbUser.passwordHash,
			}),
		);
	});
});

describe('getUsers()', () => {
	it('returns ReturnedUsers', async () => {
		const fakeUsers: DbUser[] = [
			{
				id: 0,
				email: 'test@test.one',
				name: '',
				passwordHash: '',
				passwordSalt: '',
			},
			{
				id: 1,
				email: 'test@test.two',
				name: '',
				passwordHash: '',
				passwordSalt: '',
			},
		];
		prismaClientMock.user.findMany = jest.fn().mockReturnValue(fakeUsers);
		const authReposistory = createAuthRepository(prismaClientMock);

		const getUsersResponse = await authReposistory.getUsers();

		const expectedUsers: User[] = [
			{
				id: 0,
				email: new Email('test@test.one'),
				name: '',
				passwordHash: '',
			},
			{
				id: 1,
				email: new Email('test@test.two'),
				name: '',
				passwordHash: '',
			},
		];

		expect(prismaClientMock.user.findMany).toBeCalledTimes(1);
		expect(getUsersResponse).toStrictEqual(
			new ReturnedUsers(expectedUsers),
		);
	});
});

describe('createUser()', () => {
	it('returns EmailAlreadyInUse given a email already associated with a user', async () => {
		prismaClientMock.user.findUnique = jest
			.fn()
			.mockReturnValue({ email: 'test@test.test' });

		const authReposistory = createAuthRepository(prismaClientMock);

		const createUserResponse = await authReposistory.createUser(
			fakeEmail,
			'',
			'',
			'',
		);

		expect(prismaClientMock.user.findUnique).toHaveBeenCalledTimes(1);
		expect(prismaClientMock.user.findUnique).toHaveBeenCalledWith({
			where: { email: fakeEmail.value },
		});
		expect(createUserResponse).toStrictEqual(new EmailAlreadyInUse());
	});
	it('returns UserCreated and a User given valid user credentials', async () => {
		prismaClientMock.user.findUnique = jest.fn().mockReturnValue(null);
		prismaClientMock.user.create = jest.fn().mockReturnValue(fakeDbUser);

		const authReposistory = createAuthRepository(prismaClientMock);

		const createUserResponse = await authReposistory.createUser(
			new Email(fakeDbUser.email),
			fakeDbUser.passwordHash,
			fakeDbUser.passwordSalt,
			fakeDbUser.name,
		);

		expect(prismaClientMock.user.findUnique).toHaveBeenCalledTimes(1);
		expect(prismaClientMock.user.findUnique).toHaveBeenCalledWith({
			where: { email: fakeDbUser.email },
		});

		expect(prismaClientMock.user.create).toHaveBeenCalledTimes(1);
		expect(prismaClientMock.user.create).toHaveBeenCalledWith({
			data: {
				email: fakeDbUser.email,
				passwordHash: fakeDbUser.passwordHash,
				passwordSalt: fakeDbUser.passwordSalt,
				name: fakeDbUser.name,
			},
		});

		expect(createUserResponse).toStrictEqual(
			new UserCreated({
				id: fakeDbUser.id,
				email: new Email(fakeDbUser.email),
				name: fakeDbUser.name,
				passwordHash: fakeDbUser.passwordHash,
			}),
		);
	});
});

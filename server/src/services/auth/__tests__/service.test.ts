import { Email } from '../../../typeguard';
import {
	EmailAlreadyInUse,
	IAuthRepo,
	ReturnedUser,
	ReturnedUsers,
	User,
	UserCreated,
	UserNotFound,
} from '../repository';
import {
	createAuthService,
	TokenCreated,
	TokenCreationFailed,
	UserSessionCreated,
	UserSessionCreationFailed,
} from '../service';
import { mocked } from 'ts-jest/utils';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../../../env';

// Mocks
jest.mock('bcrypt');
let bcryptMock: typeof bcrypt;

const createAuthRepositoryMock = (): IAuthRepo => ({
	getUserByEmail: jest.fn(),
	getUsers: jest.fn(),
	createUser: jest.fn(),
});

let authRepositoryMock: IAuthRepo;

const fakeName = 'Tester';
const fakeEmail = new Email('test@test.test');
const fakePassword = 'testtest';

beforeEach(() => {
	authRepositoryMock = createAuthRepositoryMock();
	bcryptMock = mocked(bcrypt, true);
});

// Tests
describe('getUsers()', () => {
	it('returns ReturnedUsers with users', async () => {
		const fakeUsers = new ReturnedUsers([
			{
				id: 0,
				name: '',
				email: new Email('test@test.one'),
				passwordHash: '',
			},
			{
				id: 1,
				name: '',
				email: new Email('test@test.two'),
				passwordHash: '',
			},
		] as User[]);
		authRepositoryMock.getUsers = jest.fn().mockReturnValue(fakeUsers);
		const service = createAuthService(authRepositoryMock);
		const users = await service.getUsers();

		expect(authRepositoryMock.getUsers).toHaveBeenCalledTimes(1);
		expect(users).toBeInstanceOf(ReturnedUsers);
		expect(users).toEqual(fakeUsers);
	});
});

describe('createUser()', () => {
	it('returns UserCreated with a user given no existing user with same email already exists', async () => {
		const fakeUserCreated = new UserCreated({
			id: 0,
			email: fakeEmail,
			name: fakeName,
			passwordHash: '',
		});
		authRepositoryMock.createUser = jest
			.fn()
			.mockReturnValue(fakeUserCreated);

		bcryptMock.genSalt = jest.fn().mockReturnValue('salt');
		bcryptMock.hash = jest.fn().mockReturnValue('hash');

		const service = createAuthService(authRepositoryMock);

		const userCreatedResponse = await service.createUser(
			fakeName,
			fakeEmail,
			fakePassword,
		);

		expect(authRepositoryMock.createUser).toHaveBeenCalledTimes(1);
		expect(authRepositoryMock.createUser).toHaveBeenCalledWith(
			fakeEmail,
			expect.anything(),
			expect.anything(),
			fakeName,
		);
		expect(userCreatedResponse).toBe(fakeUserCreated);
	});
	it('returns EmailAlreadyInUse given an existing email already exists', async () => {
		const fakeEmailAlreadyInUse = new EmailAlreadyInUse();
		authRepositoryMock.createUser = jest
			.fn()
			.mockReturnValue(fakeEmailAlreadyInUse);

		bcryptMock.genSalt = jest.fn().mockReturnValue('salt');
		bcryptMock.hash = jest.fn().mockReturnValue('hash');

		const service = createAuthService(authRepositoryMock);

		const userCreatedResponse = await service.createUser(
			fakeName,
			fakeEmail,
			fakePassword,
		);

		expect(authRepositoryMock.createUser).toHaveBeenCalledTimes(1);
		expect(authRepositoryMock.createUser).toHaveBeenCalledWith(
			fakeEmail,
			expect.anything(),
			expect.anything(),
			fakeName,
		);
		expect(userCreatedResponse).toBe(fakeEmailAlreadyInUse);
	});
});

describe('signIn()', () => {
	it('returns TokenCreationFailed when a user with a given email is not found', async () => {
		authRepositoryMock.getUserByEmail = jest
			.fn()
			.mockReturnValue(new UserNotFound());
		const service = createAuthService(authRepositoryMock);

		const signInResponse = await service.signIn(fakeEmail, fakePassword);

		expect(authRepositoryMock.getUserByEmail).toHaveBeenCalledTimes(1);
		expect(authRepositoryMock.getUserByEmail).toHaveBeenCalledWith(
			fakeEmail,
		);
		expect(signInResponse).toStrictEqual(new TokenCreationFailed());
	});
	it('returns TokenCreationFailed when a user with a given password does not match', async () => {
		authRepositoryMock.getUserByEmail = jest.fn().mockReturnValue(
			new ReturnedUser({
				id: 0,
				name: fakeName,
				email: fakeEmail,
				passwordHash: 'PRETEND-HASH',
			}),
		);
		bcryptMock.compare = jest.fn().mockReturnValue(false); // Makes so that no password match
		const service = createAuthService(authRepositoryMock);

		const signInResponse = await service.signIn(fakeEmail, fakeName);

		expect(authRepositoryMock.getUserByEmail).toHaveBeenCalledTimes(1);
		expect(authRepositoryMock.getUserByEmail).toHaveBeenCalledWith(
			fakeEmail,
		);
		expect(signInResponse).toStrictEqual(new TokenCreationFailed());
	});
	it('returns TokenCreated when a user with a given email exists and password hash matches', async () => {
		authRepositoryMock.getUserByEmail = jest.fn().mockReturnValue(
			new ReturnedUser({
				id: 0,
				name: fakeName,
				email: fakeEmail,
				passwordHash: 'PRETEND-HASH',
			}),
		);
		bcryptMock.compare = jest.fn().mockReturnValue(true); // Makes so that all passwords match
		const service = createAuthService(authRepositoryMock);

		const signInResponse = await service.signIn(fakeEmail, fakePassword);

		expect(authRepositoryMock.getUserByEmail).toHaveBeenCalledTimes(1);
		expect(authRepositoryMock.getUserByEmail).toHaveBeenCalledWith(
			fakeEmail,
		);
		expect(signInResponse).toEqual(new TokenCreated(expect.anything()));
	});
});

describe('extractToken()', () => {
	it('returns UserSessionCreationFailed given a invalid token', async () => {
		const service = createAuthService(authRepositoryMock);

		const tokenResponse = service.extractToken('invalidtoken'); // Hope fully this counts :)

		expect(tokenResponse).toStrictEqual(
			new UserSessionCreationFailed(expect.anything()),
		);
	});
	it('returns UserSessionCreated and a userSession given a valid token', async () => {
		const service = createAuthService(authRepositoryMock);

		const fakeUserSession: Record<string, unknown> = {
			id: 0,
			email: fakeEmail.value,
			name: fakeName,
		};

		const fakeToken = jwt.sign(fakeUserSession, ACCESS_TOKEN_SECRET);

		const extractTokenResponse = service.extractToken(fakeToken);

		expect(extractTokenResponse).toStrictEqual(
			new UserSessionCreated({
				id: 0,
				email: fakeEmail,
				name: fakeName,
			}),
		);
	});
});

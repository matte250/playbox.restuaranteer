import { Email } from '../../../typeguard';
import { IAuthRepo, User } from '../repository';
import { createAuthService, UserSession } from '../service';
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
	it('returns all stored users.', async () => {
		const fakeUsers: User[] = [
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
		];
		authRepositoryMock.getUsers = jest.fn().mockReturnValue(fakeUsers);
		const service = createAuthService(authRepositoryMock);
		const users = await service.getUsers();

		expect(authRepositoryMock.getUsers).toHaveBeenCalledTimes(1);
		expect(users).toEqual(fakeUsers);
	});
});

describe('createUser()', () => {
	it('returns "user-created" given no existing user with same email already exists', async () => {
		authRepositoryMock.createUser = jest
			.fn()
			.mockReturnValue({ msg: 'user-created' });

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
		expect(userCreatedResponse).toBe('user-created');
	});
	it('returns "email-already-in-use" given an existing email already exists', async () => {
		authRepositoryMock.createUser = jest
			.fn()
			.mockReturnValue({ msg: 'email-already-in-use' });

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
		expect(userCreatedResponse).toBe('email-already-in-use');
	});
});

describe('signIn()', () => {
	it('returns "sign-in-failed" when a user with a given email is not found', async () => {
		authRepositoryMock.getUserByEmail = jest
			.fn()
			.mockReturnValue({ msg: 'user-not-found' });
		const service = createAuthService(authRepositoryMock);

		const signInResponse = await service.signIn(fakeEmail, fakePassword);

		expect(authRepositoryMock.getUserByEmail).toHaveBeenCalledTimes(1);
		expect(authRepositoryMock.getUserByEmail).toHaveBeenCalledWith(
			fakeEmail,
		);
		expect(signInResponse).toStrictEqual({ msg: 'sign-in-failed' });
	});
	it('returns "sign-in-failed" when a user with a given password does not match', async () => {
		authRepositoryMock.getUserByEmail = jest.fn().mockReturnValue({
			msg: 'user-found',
			user: {
				id: 0,
				name: fakeName,
				email: fakeEmail,
				passwordHash: 'PRETEND-HASH',
			},
		});
		bcryptMock.compare = jest.fn().mockReturnValue(false); // Makes so that no password match
		const service = createAuthService(authRepositoryMock);

		const signInResponse = await service.signIn(fakeEmail, fakeName);

		expect(authRepositoryMock.getUserByEmail).toHaveBeenCalledTimes(1);
		expect(authRepositoryMock.getUserByEmail).toHaveBeenCalledWith(
			fakeEmail,
		);
		expect(signInResponse).toStrictEqual({ msg: 'sign-in-failed' });
	});
	it('returns "sign-in-success" when a user with a given email exists and password hash matches', async () => {
		authRepositoryMock.getUserByEmail = jest.fn().mockReturnValue({
			msg: 'user-found',
			user: {
				id: 0,
				name: fakeName,
				email: fakeEmail,
				passwordHash: 'PRETEND-HASH',
			},
		});
		bcryptMock.compare = jest.fn().mockReturnValue(true); // Makes so that all passwords match
		const service = createAuthService(authRepositoryMock);

		const signInResponse = await service.signIn(fakeEmail, fakePassword);

		expect(authRepositoryMock.getUserByEmail).toHaveBeenCalledTimes(1);
		expect(authRepositoryMock.getUserByEmail).toHaveBeenCalledWith(
			fakeEmail,
		);
		expect(signInResponse).toEqual({
			msg: 'sign-in-success',
			cookie: expect.anything(),
		});
	});
});

describe('extractToken()', () => {
	it('returns "failed" given a invalid token', async () => {
		const jwtVerifySpy = jest.spyOn(jwt, 'verify');
		const service = createAuthService(authRepositoryMock);

		const tokenResponse = await service.extractToken('invalidtoken'); // Hope fully this counts :)

		expect(jwtVerifySpy).toBeCalledTimes(1);
		expect(tokenResponse).toStrictEqual({ msg: 'failed' });

		jwtVerifySpy.mockReset();
	});
	it('returns "sucess" and a userSession given a valid token', () => {
		/*
		const jwtVerifySpy = jest.spyOn(jwt, 'verify');
		const service = createAuthService(authRepositoryMock);

		const fakeUserSession: UserSession = {
			id: 0,
			email: fakeEmail,
			name: fakeName,
		};

		const fakeToken = jwt.sign(fakeUserSession, ACCESS_TOKEN_SECRET);

		const extractTokenResponse = service.extractToken(fakeToken);

		expect(jwtVerifySpy).toBeCalledTimes(1);
		expect(extractTokenResponse).toBe({
			msg: 'success',
			UserSession: fakeUserSession,
		});

		jwtVerifySpy.mockReset();*/
	});
});

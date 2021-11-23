import { IAuthService, TokenCreated, TokenCreationFailed } from '../service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { createAuthController } from '../controller';
import { Email } from '../../../typeguard';
import { Conflict, NotFound, Ok } from '../../../router/responseTypes';
import {
	EmailAlreadyInUse,
	ReturnedUser,
	UserCreated,
	UserNotFound,
} from '../repository';
let authServiceMock: DeepMockProxy<IAuthService>;

beforeEach(() => {
	authServiceMock = mockDeep<IAuthService>();
});

const fakeEmail = new Email('test@test.test');
const fakeName = 'name';
const fakePassword = 'password';
const fakeId = 0;

describe('POST auth/v1/register', () => {
	it('returns Conflict given a email that is already in use', async () => {
		authServiceMock.createUser.mockResolvedValue(new EmailAlreadyInUse());

		const authController = createAuthController(authServiceMock);

		const response =
			await authController.routes.registerPostRequest.response({
				email: fakeEmail,
				name: fakeName,
				password: fakePassword,
			});

		expect(authServiceMock.createUser).toBeCalledTimes(1);
		expect(authServiceMock.createUser).toBeCalledWith(
			fakeName,
			fakeEmail,
			fakePassword,
		);
		expect(response).toStrictEqual(new Conflict());
	});
	it('returns Ok with a id(of created user) given a user was created', async () => {
		authServiceMock.createUser.mockResolvedValue(
			new UserCreated({
				id: fakeId,
				email: fakeEmail,
				name: fakeName,
				passwordHash: '',
			}),
		);

		const authController = createAuthController(authServiceMock);

		const response =
			await authController.routes.registerPostRequest.response({
				email: fakeEmail,
				name: fakeName,
				password: fakePassword,
			});

		expect(authServiceMock.createUser).toBeCalledTimes(1);
		expect(authServiceMock.createUser).toBeCalledWith(
			fakeName,
			fakeEmail,
			fakePassword,
		);
		expect(response).toStrictEqual(new Ok(fakeId));
	});
});

describe('POST auth/v1/login', () => {
	it('returns Conflict given signIn failed', async () => {
		authServiceMock.signIn.mockResolvedValue(new TokenCreationFailed());

		const authController = createAuthController(authServiceMock);

		const response = await authController.routes.loginPostRequest.response({
			email: fakeEmail,
			password: fakePassword,
		});

		expect(authServiceMock.signIn).toBeCalledTimes(1);
		expect(authServiceMock.signIn).toBeCalledWith(fakeEmail, fakePassword);
		expect(response).toStrictEqual(new Conflict());
	});

	it('returns Ok with a cookie and id(of signed in user) given signIn succeded', async () => {
		const fakeCookie = 'cookie';
		authServiceMock.signIn.mockResolvedValue(
			new TokenCreated(fakeCookie, fakeId),
		);

		const authController = createAuthController(authServiceMock);

		const response = await authController.routes.loginPostRequest.response({
			email: fakeEmail,
			password: fakePassword,
		});

		expect(authServiceMock.signIn).toBeCalledTimes(1);
		expect(authServiceMock.signIn).toBeCalledWith(fakeEmail, fakePassword);
		expect(response).toStrictEqual(
			new Ok({ token: fakeCookie, id: fakeId }),
		);
	});
});

describe('GET auth/v1/user', () => {
	const fakeId = 0;
	it('returns NotFound given a id not assosicated with any user', async () => {
		authServiceMock.getUser.mockResolvedValue(new UserNotFound());

		const authController = createAuthController(authServiceMock);

		const response = await authController.routes.userGetRequest.response({
			id: fakeId,
		});

		expect(authServiceMock.getUser).toBeCalledTimes(1);
		expect(authServiceMock.getUser).toBeCalledWith(fakeId);
		expect(response).toStrictEqual(new NotFound());
	});
	it('returns Ok with user information given a id accosicated with a user', async () => {
		authServiceMock.getUser.mockResolvedValue(
			new ReturnedUser({
				name: fakeName,
				email: fakeEmail,
				id: fakeId,
				passwordHash: fakePassword,
			}),
		);

		const authController = createAuthController(authServiceMock);

		const response = await authController.routes.userGetRequest.response({
			id: fakeId,
		});

		expect(authServiceMock.getUser).toBeCalledTimes(1);
		expect(authServiceMock.getUser).toBeCalledWith(fakeId);
		expect(response).toStrictEqual(
			new Ok({
				name: fakeName,
				email: fakeEmail.value,
				id: fakeId,
			}),
		);
	});
});

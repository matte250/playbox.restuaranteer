import { IAuthService } from '../service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { createAuthController } from '../controller';
import { Email } from '../../../typeguard';
import { Conflict, Ok } from '../../../router/responseTypes';
let authServiceMock: DeepMockProxy<IAuthService>;

beforeEach(() => {
	authServiceMock = mockDeep<IAuthService>();
});

const fakeEmail = new Email('test@test.test');
const fakeName = 'name';
const fakePassword = 'password';

describe('POST auth/v1/register', () => {
	it('returns Conflict given a email that is already in use', async () => {
		authServiceMock.createUser.mockResolvedValue('email-already-in-use');

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
	it('returns Ok given a user was created', async () => {
		authServiceMock.createUser.mockResolvedValue('user-created');

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
		expect(response).toStrictEqual(new Ok());
	});
});

describe('POST auth/v1/login', () => {
	it('returns Conflict given signIn failed', async () => {
		authServiceMock.signIn.mockResolvedValue({ msg: 'sign-in-failed' });

		const authController = createAuthController(authServiceMock);

		const response = await authController.routes.loginPostRequest.response({
			email: fakeEmail,
			password: fakePassword,
		});

		expect(authServiceMock.signIn).toBeCalledTimes(1);
		expect(authServiceMock.signIn).toBeCalledWith(fakeEmail, fakePassword);
		expect(response).toStrictEqual(new Conflict());
	});

	it('returns Ok with a cookie given signIn succeded', async () => {
		const fakeCookie = 'cookie';
		authServiceMock.signIn.mockResolvedValue({
			msg: 'sign-in-success',
			cookie: fakeCookie,
		});

		const authController = createAuthController(authServiceMock);

		const response = await authController.routes.loginPostRequest.response({
			email: fakeEmail,
			password: fakePassword,
		});

		expect(authServiceMock.signIn).toBeCalledTimes(1);
		expect(authServiceMock.signIn).toBeCalledWith(fakeEmail, fakePassword);
		expect(response).toStrictEqual(new Ok(fakeCookie));
	});
});

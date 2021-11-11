import { Email, stringTypeGuard } from '../../typeguard';
import { IAuthService } from './service';
import { Controller } from '../../router/createRouter';
import { Conflict, Ok } from '../../router/responseTypes';

interface IRegisterPostRequest {
	email: Email;
	name: string;
	password: string;
}

interface ILoginPostRequest {
	email: Email;
	password: string;
}

export const createAuthController = (
	authService: IAuthService,
): Controller<{
	registerPostRequest: IRegisterPostRequest;
	loginPostRequest: ILoginPostRequest;
}> => ({
	domain: 'auth',
	version: 1,
	routes: {
		registerPostRequest: {
			httpMethod: 'post',
			path: 'register',
			requestMap: ({ body }) => ({
				email: new Email(body.email),
				name: stringTypeGuard(body.name),
				password: stringTypeGuard(body.password),
			}),
			response: async (req) => {
				const { email, name, password } = req;

				const msg = await authService.createUser(name, email, password);
				if (msg == 'email-already-in-use') return new Conflict();

				return new Ok();
			},
		},
		loginPostRequest: {
			httpMethod: 'post',
			path: 'login',
			requestMap: ({ body }) => ({
				email: new Email(body.email),
				password: stringTypeGuard(body.password),
			}),
			response: async (req) => {
				const { email, password } = req;

				const result = await authService.signIn(email, password);
				if (result.msg === 'sign-in-failed') return new Conflict();

				return new Ok(result.cookie);
			},
		},
	},
});

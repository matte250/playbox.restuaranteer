import { Email, stringTypeGuard } from '../../typeguard';
import { IAuthService, TokenCreationFailed } from './service';
import { Controller, Route } from '../../router/createRouter';
import { Conflict, Ok } from '../../router/responseTypes';
import { EmailAlreadyInUse } from './repository';

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
): Controller => ({
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

				const createUserResponse = await authService.createUser(
					name,
					email,
					password,
				);
				if (createUserResponse instanceof EmailAlreadyInUse)
					return new Conflict();

				return new Ok();
			},
		} as Route<IRegisterPostRequest>,
		loginPostRequest: {
			httpMethod: 'post',
			path: 'login',
			requestMap: ({ body }) => ({
				email: new Email(body.email),
				password: stringTypeGuard(body.password),
			}),
			response: async (req) => {
				const { email, password } = req;

				const signInResult = await authService.signIn(email, password);
				if (signInResult instanceof TokenCreationFailed)
					return new Conflict();

				return new Ok(signInResult.token);
			},
		} as Route<ILoginPostRequest>,
	},
});

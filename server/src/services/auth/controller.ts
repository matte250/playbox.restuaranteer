import { Email, numberTypeGuard, stringTypeGuard } from '../../typeguard';
import { IAuthService, TokenCreationFailed } from './service';
import { Controller, Route } from '../../router/createRouter';
import { Conflict, NotFound, Ok } from '../../router/responseTypes';
import { EmailAlreadyInUse, UserNotFound } from './repository';

interface IRegisterPostRequest {
	email: Email;
	name: string;
	password: string;
}

interface ILoginPostRequest {
	email: Email;
	password: string;
}

interface IUserGetRequest {
	id: number;
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
			response: async ({ email, name, password }) => {
				const cereateUserResult = await authService.createUser(
					name,
					email,
					password,
				);
				if (cereateUserResult instanceof EmailAlreadyInUse)
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
			response: async ({ email, password }) => {
				const signInResult = await authService.signIn(email, password);
				if (signInResult instanceof TokenCreationFailed)
					return new Conflict();

				return new Ok(signInResult.token);
			},
		} as Route<ILoginPostRequest>,
		userGetRequest: {
			httpMethod: 'get',
			path: 'user/:id',
			requestMap: ({ param }) => ({ id: numberTypeGuard(param.id) }),
			response: async ({ id }) => {
				const getUserResult = await authService.getUser(id);
				if (getUserResult instanceof UserNotFound)
					return new NotFound();
				const { name, email } = getUserResult.user;
				return new Ok({ name, email, id });
			},
		} as Route<IUserGetRequest>,
	},
});

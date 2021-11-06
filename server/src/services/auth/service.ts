import { IAuthRepo, User } from './repository';
import bcrypt from 'bcrypt';
import jwt, { JsonWebTokenError, JwtHeader, JwtPayload } from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../../env';
import { Email, numberTypeGuard, stringTypeGuard } from '../../typeguard';

export interface IAuthService {
	getUsers: () => Promise<User[]>;
	createUser: (
		name: string,
		email: Email,
		password: string,
	) => Promise<'user-created' | 'email-already-in-use'>;
	signIn: (
		email: Email,
		password: string,
	) => Promise<
		{ msg: 'sign-in-success'; cookie: string } | { msg: 'sign-in-failed' }
	>;
	extractToken: (
		token: string,
	) =>
		| { msg: 'success'; userSession: UserSession }
		| { msg: 'parsing-error'; reason: string };
}

export interface UserSession {
	id: number;
	name: string;
	email: Email;
}

export const createAuthService = (authRepo: IAuthRepo): IAuthService => ({
	getUsers: async () => await authRepo.getUsers(),
	createUser: async (name, email, password) => {
		const salt = await bcrypt.genSalt(10);
		const passwordHash = await bcrypt.hash(password, salt);

		const { msg } = await authRepo.createUser(
			email,
			passwordHash,
			salt,
			name,
		);
		return msg;
	},
	signIn: async (email, password) => {
		const res = await authRepo.getUserByEmail(email);
		if (res.msg === 'user-not-found') return { msg: 'sign-in-failed' };

		const match = await bcrypt.compare(password, res.user.passwordHash);

		if (!match) return { msg: 'sign-in-failed' };

		const userSession: Record<string, unknown> = {
			id: res.user.id,
			name: res.user.name,
			email: res.user.email.value,
		};

		return {
			msg: 'sign-in-success',
			cookie: jwt.sign(userSession, ACCESS_TOKEN_SECRET),
		};
	},
	extractToken: (token) => {
		let reason = 'unknown';

		try {
			const decoded = jwt.verify(token, 'dev-access-token');

			if (decoded !== undefined && decoded !== typeof 'string') {
				const { id, email, name } = decoded as Record<string, unknown>;
				return {
					msg: 'success',
					userSession: {
						id: numberTypeGuard(id),
						name: stringTypeGuard(name),
						email: new Email(email),
					},
				};
			}
		} catch (ex) {
			if (ex instanceof TypeError || ex instanceof JsonWebTokenError)
				reason = ex.message;
		}

		return { msg: 'parsing-error', reason };
	},
});

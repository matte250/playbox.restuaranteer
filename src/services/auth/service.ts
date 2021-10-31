import { IAuthRepo, User } from './repository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../../env';
import { Email } from '../../typeguard';

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
	) => { msg: 'success'; userSession: UserSession } | { msg: 'failed' };
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

		const userSession: UserSession = {
			id: res.user.id,
			name: res.user.name,
			email: res.user.email,
		};

		return {
			msg: 'sign-in-success',
			cookie: jwt.sign(userSession, ACCESS_TOKEN_SECRET),
		};
	},
	extractToken: (token) => {
		jwt.verify(
			token,
			ACCESS_TOKEN_SECRET,
			(err: any, userSession: unknown) => {
				if (userSession !== undefined) {
					return { msg: 'success', userSession };
				}
			},
		);

		return { msg: 'failed' };
	},
});

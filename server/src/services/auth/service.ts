import {
	EmailAlreadyInUse,
	IAuthRepo,
	ReturnedUser,
	ReturnedUsers,
	UserCreated,
	UserNotFound,
} from './repository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN_SECRET } from '../../env';
import { Email, numberTypeGuard, stringTypeGuard } from '../../typeguard';

export class TokenCreated {
	constructor(readonly token: string, readonly userId: number) {}
}

export class TokenCreationFailed {}

export class UserSessionCreated {
	constructor(readonly userSession: UserSession) {}
}

export class UserSessionCreationFailed {
	constructor(readonly reason: string) {}
}
export interface IAuthService {
	getUsers: () => Promise<ReturnedUsers>;
	getUser: (id: number) => Promise<ReturnedUser | UserNotFound>;
	createUser: (
		name: string,
		email: Email,
		password: string,
	) => Promise<UserCreated | EmailAlreadyInUse>;
	signIn: (
		email: Email,
		password: string,
	) => Promise<TokenCreated | TokenCreationFailed>;
	extractToken: (
		token: string,
	) => UserSessionCreated | UserSessionCreationFailed;
}

export interface UserSession {
	id: number;
	name: string;
	email: Email;
}

export const createAuthService = (authRepo: IAuthRepo): IAuthService => ({
	getUsers: async () => await authRepo.getUsers(),
	getUser: async (id) => await authRepo.getUserById(id),
	createUser: async (name, email, password) => {
		const salt = await bcrypt.genSalt(10);
		const passwordHash = await bcrypt.hash(password, salt);

		const response = await authRepo.createUser(
			email,
			passwordHash,
			salt,
			name,
		);
		return response;
	},
	signIn: async (email, password) => {
		const getUserResponse = await authRepo.getUserByEmail(email);
		if (getUserResponse instanceof UserNotFound)
			return new TokenCreationFailed();

		const { user } = getUserResponse;
		const match = await bcrypt.compare(password, user.passwordHash);

		if (!match) return new TokenCreationFailed();

		const userSession: Record<string, unknown> = {
			id: user.id,
			name: user.name,
			email: user.email.value,
		};

		return new TokenCreated(
			jwt.sign(userSession, ACCESS_TOKEN_SECRET),
			user.id,
		);
	},
	extractToken: (token) => {
		let reason = 'unknown';

		try {
			const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

			if (decoded !== undefined && decoded !== typeof 'string') {
				const { id, email, name } = decoded as Record<string, unknown>;
				return new UserSessionCreated({
					id: numberTypeGuard(id),
					name: stringTypeGuard(name),
					email: new Email(email),
				});
			}
		} catch (ex) {
			if (ex instanceof TypeError || ex instanceof jwt.JsonWebTokenError)
				reason = ex.message;
		}

		return new UserSessionCreationFailed(reason);
	},
});

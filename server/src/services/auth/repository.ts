import { PrismaClient, User as DbUser } from '.prisma/client';
import { Email } from '../../typeguard';

export interface User {
	id: number;
	name: string;
	email: Email;
	passwordHash: string;
}

export class ReturnedUser {
	constructor(readonly user: User) {}
}

export class UserNotFound {}

export class ReturnedUsers {
	constructor(readonly users: User[]) {}
}

export class UserCreated {
	constructor(readonly createdUser: User) {}
}

export class EmailAlreadyInUse {}

export interface IAuthRepo {
	getUserByEmail: (email: Email) => Promise<ReturnedUser | UserNotFound>;
	getUsers: () => Promise<ReturnedUsers>;
	createUser: (
		email: Email,
		passwordHash: string,
		passwordSalt: string,
		name: string,
	) => Promise<UserCreated | EmailAlreadyInUse>;
}

const mapDbUser = (dbUser: DbUser): User => {
	const { id, name, email, passwordHash } = dbUser;
	return { id, name, email: new Email(email), passwordHash };
};

export const createAuthRepository = (client: PrismaClient): IAuthRepo => ({
	getUserByEmail: async (email: Email) => {
		const user = await client.user.findUnique({
			where: { email: email.value },
		});
		if (!user) return new UserNotFound();

		return new ReturnedUser(mapDbUser(user));
	},
	getUsers: async () =>
		new ReturnedUsers(
			(await client.user.findMany()).map((x) => mapDbUser(x)),
		),
	createUser: async (email, passwordHash, passwordSalt, name) => {
		return await client.$transaction(async (tran) => {
			const existingUser = await tran.user.findUnique({
				where: { email: email.value },
			});
			if (existingUser) return new EmailAlreadyInUse();

			const createdUser = await tran.user.create({
				data: { email: email.value, passwordHash, passwordSalt, name },
			});
			return new UserCreated(mapDbUser(createdUser));
		});
	},
});

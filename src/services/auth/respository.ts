import { PrismaClient, User as DbUser } from '.prisma/client';

export interface User {
	id: number;
	name: string;
	email: string;
	passwordHash: string;
}

export interface IAuthRepo {
	getUserByEmail: (
		email: string,
	) => Promise<{ msg: 'user-found'; user: User } | { msg: 'user-not-found' }>;
	getUsers: () => Promise<User[]>;
	createUser: (
		email: string,
		passwordHash: string,
		passwordSalt: string,
		name: string,
	) => Promise<
		| { msg: 'user-created'; createdUser: User }
		| { msg: 'email-already-in-use' }
	>;
}

const mapDbUser = (dbUser: DbUser): User => {
	const { id, name, email, passwordHash } = dbUser;
	return { id, name, email, passwordHash };
};

export const createAuthRepository = (client: PrismaClient): IAuthRepo => ({
	getUserByEmail: async (email: string) => {
		const user = await client.user.findUnique({ where: { email } });
		if (!user) return { msg: 'user-not-found' };

		return { msg: 'user-found', user: mapDbUser(user) };
	},
	getUsers: async () =>
		(await client.user.findMany()).map((x) => mapDbUser(x)),
	createUser: async (email, passwordHash, passwordSalt, name) => {
		return await client.$transaction(async (tran) => {
			const existingUser = await tran.user.findUnique({
				where: { email },
			});
			if (existingUser) return { msg: 'email-already-in-use' };

			const createdUser = await tran.user.create({
				data: { email, passwordHash, passwordSalt, name },
			});
			return { msg: 'user-created', createdUser: mapDbUser(createdUser) };
		});
	},
});

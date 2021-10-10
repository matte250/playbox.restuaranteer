import { PrismaClient } from ".prisma/client";
import { IAuthRepo } from "./respository";

export const createAuthService = (authRepo: IAuthRepo, prisma: PrismaClient) => ({
    fetchAllUsers: async () => await prisma.user.findMany(),
})
import { PrismaClient } from ".prisma/client"
import { createAuthController } from "./services/auth/controller"
import { createAuthRepository, IAuthRepo } from "./services/auth/respository"
import { createAuthService, IAuthService } from "./services/auth/service"

enum ProviderEnum {
    prismaClient = "prismaClient",
    authRepo = "authRepo",
    authService = "authService"
}

type ProviderEnumFields = {[P in ProviderEnum]: any} 

interface Providers extends ProviderEnumFields {
    prismaClient: PrismaClient;
    authRepo: IAuthRepo;
    authService: IAuthService;
}

const creatorFunctions: {[key in ProviderEnum]: (...args: any) => Providers[key]} = {
    prismaClient: () => new PrismaClient(),
    authRepo: createAuthRepository,
    authService: createAuthService
}

export type Consumer = (provider: Providers) => any

const tester: Consumer = ({authRepo}) => ({
    test: async () => await authRepo.getUserByEmail("lol")
})



export const createRequestProvider = () => {
    var temp = {}
    
    while(Object.keys(temp).length !== Object.keys(creatorFunctions).length)
    {

    }

}

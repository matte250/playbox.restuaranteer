import { emailRegex } from "validation/regex";
import { IAuthRepo, User } from "./respository";
import bcrypt from "bcrypt";
import { ACCESS_TOKEN_SECRET } from "env";
import jwt from "jsonwebtoken"

export interface IAuthService {
    getUsers: () => Promise<User[]>
    createUser: (name: string, email: UserEmail, password: string) => Promise<"user-created" | "email-already-in-use">
    signIn: (email: string, password: string) => Promise<{msg: "sign-in-success", cookie: string} | { msg: "sign-in-failed"}>
}

class UserEmail {
    readonly value: string
    constructor(email: string){
        if(emailRegex.test(email))
            this.value = email;
        else
            throw Error("Invalid email")
    }
}

export interface UserSession {
    id: number;
    name: string;
    email: UserEmail;
}

export const createAuthService = (authRepo: IAuthRepo): IAuthService => ({
    getUsers: async () => await authRepo.getUsers(),
    createUser: async (name, email, password) => {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt)

        const { msg } = await authRepo.createUser(email.value, passwordHash, salt, name)
        return msg;
    },
    signIn: async (email, password) => {
        const res = await authRepo.getUserByEmail(email);
        if(res.msg === "user-not-found")
            return { msg: "sign-in-failed" }
        
        const match = await bcrypt.compare(password, res.user.passwordHash);

        if(!match)
            return { msg: "sign-in-failed" }
        
        const userSession: UserSession = {
            id: res.user.id,
            name: res.user.name,
            email: new UserEmail(res.user.email)
        }

        return {
            msg: "sign-in-success",
            cookie: jwt.sign(userSession, ACCESS_TOKEN_SECRET)
        }
    }
})
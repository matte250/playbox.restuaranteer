import { v4 as guid } from "uuid";
import { RepoFunctionResponse, RepoFunctionResponseWithResult, SqlClient, SqlResult } from "../../SqlClient";

interface DbUser {
    id: string
    email: string
    name: string
}

export interface IAuthRepo {
    createUser: (email: string, password: string, name: string) => Promise<UserCreated | UserAlreadyExists>;
    fetchAllUsers: () => Promise<UsersFetched>
    getUserWithCredentials: (email: string, password: string) => Promise<UserFetched | UserNotAuthorized>
}

type UserCreated = RepoFunctionResponse<"usercreated">
type UserAlreadyExists = RepoFunctionResponse<"userexists">
type UsersFetched = RepoFunctionResponseWithResult<"usersfetched", DbUser[]>
type UserFetched = RepoFunctionResponseWithResult<"userfetched", DbUser>
type UserNotAuthorized = RepoFunctionResponse<"usernotauthorized">

export const createAuthRepository = (client: SqlClient): IAuthRepo => ({
    createUser: (email: string, password: string, name: string) =>
        client.useConnection(async connection => {
            var { result } = await connection.query(
                `
                SELECT EXISTS(
                    SELECT *
                    FROM users
                    WHERE email = :email)
                `,
                {
                    email
                }
            )
            console.log(result[0][0]);
            if(result[0] == true)
                return { type: "userexists"}
            await connection.query(
                `
                    INSERT INTO users (id, email, password, name) VALUES(:id,:email,:password,:name)
                `,
                {
                    id: guid(),
                    email,
                    password,
                    name,
                }
            )
            return { type: "usercreated"}
        }),

    fetchAllUsers: () =>
        client.useConnection(async connection => {
            var res = await connection.query(`SELECT id, email, name FROM users`)
            return { type: "usersfetched", obj: res.result}
        })     , 
    getUserWithCredentials: async (email: string, password: string) =>
        client.useConnection(async connection => {
            var { result } = await connection.query(`
            SELECT
                id,
                email,
                name 
            FROM 
                users
            WHERE 
                email = :email
                AND password = :password
            LIMIT 1;
            `, {
                email,
                password
            });
            var possibleUser = result[0]
            if(possibleUser == undefined)
                return { type: "usernotauthorized"}

            return { type: "userfetched", obj: (possibleUser as DbUser) }
        })
})
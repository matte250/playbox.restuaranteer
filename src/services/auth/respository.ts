import { v4 as guid } from "uuid";
import { SqlClient, SqlResult } from "../../SqlClient";

interface DbUser {
    id: string
    email: string
    name: string
}

export interface IAuthRepo {
    createUser: (email: string, password: string, name: string) => Promise<void>;
    getUserWithCredentials: (email: string, password: string) => Promise<SqlResult<DbUser>>
}

export const createAuthRepository = (client: SqlClient): IAuthRepo => ({
    createUser: async (email: string, password: string, name: string) => {
        await client.query(
            "INSERT INTO users (id, email, password, name) VALUES(:id,:email,:password,:name)",
            {
                id: guid(),
                email,
                password,
                name,
            }
        )
    },
    getUserWithCredentials: async (email: string, password: string) => {
        var { result, error } = await client.query(`
            SELECT TOP 1 
                id,
                email,
                name 
            FROM 
                users
            WHERE 
                email = :email
                AND password = :password
            `, {
            email,
            password
        });
        if (error)
            return { error }

        return { result: (result[0] as DbUser) ?? null }
    }
});

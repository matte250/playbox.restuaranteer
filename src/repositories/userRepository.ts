import { v4 as guid } from "uuid"
import { SqlClient } from "./SqlClient"

interface DbUser {
    id: string
    email: string
    name: string
}

export const createUserRepository = (client: SqlClient) => ({
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

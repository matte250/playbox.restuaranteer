import { createConnection, createPool } from "mysql2/promise";

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "secret";
const DB_NAME = process.env.DB_NAME || "restu_db";

interface QueryResponse {
    result?: any;
    error?: any;
}

export type RepoFunctionResponse<T extends string> = {
    type: T
}

export type RepoFunctionResponseWithResult<T extends string, E> = {
    type: T,
    obj: E
}

export type SqlResult<T> = {
    result: T
    error: any
}
export interface SqlClient {
    useConnection: (context: UseConnection) => any
}

interface Connection {
    query: (sql: string, placeholders?: {[key: string]: any}) => Promise<QueryResponse>;
}

export type UseConnection = (connection: Connection) => Promise<RepoFunctionResponse<any> | RepoFunctionResponseWithResult<any, any> | void> 

export const createSqlClient = async (): Promise<SqlClient> => {
    console.log("Connecting to db");
    var pool = await createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
    });

    const useConnection = async (context: UseConnection) => {
        const connection = await pool.getConnection();
        connection.config.namedPlaceholders = true;
        connection.query("START TRANSACTION;")
        const query = async (sql: string, placeholders?: {[key: string]: any}) => {
            const [rows, _fields] = await pool.query(sql, placeholders);
            return { result: rows ?? [] };
        }
        var res;
        try {
            res = context({ query })
        } catch (ex) {
            connection.query("ROLLBACK;")
            connection.release();
            throw ex;
        }
        connection.query("COMMIT;")
        connection.release();
        return res;
    }

    return {
        useConnection,
    };
};
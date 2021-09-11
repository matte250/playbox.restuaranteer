import { createConnection } from "mysql2/promise";

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "secret";
const DB_NAME = process.env.DB_NAME || "restu_db";

interface QueryResponse {
    result?: any;
    error?: any;
}

export type SqlResult<T> = {
    result: T
} | {
    error: any
}
export interface SqlClient {
    query: (sql: string, placeholders?: {[key: string]: any}) => Promise<QueryResponse>;
}

export const createSqlClient = async (): Promise<SqlClient> => {
    console.log("Connecting to db");
    var connection = await createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
    });
    connection.config.namedPlaceholders = true;
    var attempt = 0;
    const tryConnect = async () => {

        attempt++;
        console.log("Attempt " + attempt);
        try {
            await connection.connect();
        } catch (ex) {
            await setTimeout(tryConnect, 1000 * 5)
        }
    };

    await tryConnect();

    const query = async (sql: string, placeholders?: {[key: string]: any}) => {
        try {
            const [rows, _fields] = await connection.query(sql, placeholders);
            return { result: rows ?? [] };
        } catch (ex) {
            return { error: ex };
        }
    }

    return {
        query,
    };
};
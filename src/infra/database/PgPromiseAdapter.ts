import DatabaseConnection, { DatabaseSession } from "./DatabaseConnection";
import pgp, { IDatabase } from "pg-promise";

export default class PgPromiseAdapter implements DatabaseConnection {
	readonly connection: IDatabase<unknown>;

	constructor () {
		this.connection = pgp()("postgres://postgres:123456@localhost:5432/app");
	}

	query (statement: string, params: unknown[]): Promise<any> {
		return this.connection.query(statement, params);
	}

	transaction<T> (work: (session: DatabaseSession) => Promise<T>): Promise<T> {
		return this.connection.tx(task => work(task));
	}

	close (): Promise<void> {
		return this.connection.$pool.end();
	}
}

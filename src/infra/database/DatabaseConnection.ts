export interface DatabaseSession {
	query (statement: string, params: unknown[]): Promise<any>;
}

export default interface DatabaseConnection extends DatabaseSession {
	transaction<T> (work: (session: DatabaseSession) => Promise<T>): Promise<T>;
	close (): Promise<void>;
}

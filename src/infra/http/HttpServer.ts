export type HttpCallback = (
	params: Record<string, string>,
	body: any,
	headers: Record<string, string | string[] | undefined>,
	query: Record<string, unknown>
) => Promise<unknown>;

export default interface HttpServer {
	on (method: string, url: string, callback: HttpCallback): void;
	listen (port: number): void;
}

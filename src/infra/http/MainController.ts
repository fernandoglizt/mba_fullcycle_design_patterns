import HttpServer from "./HttpServer";
import Usecase from "../../application/usecase/Usecase";

export default class MainController {

	constructor (
		readonly httpServer: HttpServer,
		readonly generateInvoices: Usecase,
		readonly closeInvoicing: Usecase,
		readonly listInvoices: Usecase
	) {
		httpServer.on("post", "/generate_invoices", async (params, body, headers) =>
			generateInvoices.execute({ ...body, userAgent: headers["user-agent"], host: headers.host })
		);

		httpServer.on("post", "/close_invoicing", async (params, body, headers) =>
			closeInvoicing.execute({ ...body, userAgent: headers["user-agent"], host: headers.host })
		);

		httpServer.on("get", "/invoices", async (params, body, headers, query) =>
			listInvoices.execute({
				month: Number(query.month),
				year: Number(query.year),
				type: query.type,
				format: query.format
			})
		);
	}
}

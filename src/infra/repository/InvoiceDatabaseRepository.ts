import InvoiceRepository, { InvoiceToSave } from "../../application/repository/InvoiceRepository";
import { InvoiceDto, Period } from "../../application/usecase/Invoicing";
import DatabaseConnection from "../database/DatabaseConnection";

export default class InvoiceDatabaseRepository implements InvoiceRepository {

	constructor (readonly connection: DatabaseConnection) {
	}

	async replacePeriod ({ month, year, type }: Period, invoices: InvoiceToSave[]): Promise<void> {
		await this.connection.transaction(async tx => {
			await tx.query(
				"delete from branas.invoice where month = $1 and year = $2 and type = $3",
				[month, year, type]
			);
			for (const { idContract, date, amount } of invoices) {
				await tx.query(
					"insert into branas.invoice (id_contract, month, year, type, date, amount) values ($1, $2, $3, $4, $5, $6)",
					[idContract, month, year, type, date, amount]
				);
			}
		});
	}

	async listPeriod ({ month, year, type }: Period): Promise<InvoiceDto[]> {
		const rows = await this.connection.query(
			"select date, amount from branas.invoice where month = $1 and year = $2 and type = $3 order by date",
			[month, year, type]
		);
		return rows.map(({ date, amount }: { date: Date, amount: string }) => ({ date, amount: Number(amount) }));
	}
}

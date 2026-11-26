import InvoiceGenerationFactory from "../../domain/InvoiceGenerationFactory";
import PresenterFactory from "../presenter/PresenterFactory";
import InvoiceRepository from "../repository/InvoiceRepository";
import { Input, InvoiceDto } from "./Invoicing";
import Usecase from "./Usecase";

export default class ListInvoices implements Usecase {

	constructor (
		readonly invoices: InvoiceRepository,
		readonly presenters: PresenterFactory<InvoiceDto[]>
	) {
	}

	async execute ({ month, year, type, format }: Input): Promise<InvoiceDto[] | string> {
		const presenter = this.presenters.create(format);
		InvoiceGenerationFactory.create(type);
		return presenter.present(await this.invoices.listPeriod({ month, year, type }));
	}
}

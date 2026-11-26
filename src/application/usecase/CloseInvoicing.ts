import InvoiceGenerationFactory from "../../domain/InvoiceGenerationFactory";
import EventPublisher from "../events/EventPublisher";
import PresenterFactory from "../presenter/PresenterFactory";
import ContractRepository from "../repository/ContractRepository";
import InvoiceRepository, { InvoiceToSave } from "../repository/InvoiceRepository";
import { Input, InvoiceDto } from "./Invoicing";
import Usecase from "./Usecase";

export default class CloseInvoicing implements Usecase {

	constructor (
		readonly contracts: ContractRepository,
		readonly invoices: InvoiceRepository,
		readonly presenters: PresenterFactory<InvoiceDto[]>,
		readonly mediator: EventPublisher
	) {
	}

	async execute ({ month, year, type, format }: Input): Promise<InvoiceDto[] | string> {
		const presenter = this.presenters.create(format);
		InvoiceGenerationFactory.create(type);
		const batch: InvoiceToSave[] = [];
		for (const contract of await this.contracts.list()) {
			for (const invoice of contract.generateInvoices(month, year, type)) {
				batch.push({ idContract: contract.idContract, date: invoice.date, amount: invoice.amount });
			}
		}
		await this.invoices.replacePeriod({ month, year, type }, batch);
		const output = batch.map(({ date, amount }) => ({ date, amount }));
		await this.mediator.publish("InvoicesClosed", {
			month, year, type, invoices: batch.length,
			total: batch.reduce((sum, invoice) => sum + invoice.amount, 0)
		});
		return presenter.present(output);
	}
}

import ContractRepository from "../repository/ContractRepository";
import PresenterFactory from "../presenter/PresenterFactory";
import EventPublisher from "../events/EventPublisher";
import { Input, InvoiceDto } from "./Invoicing";
import Usecase from "./Usecase";

export default class GenerateInvoices implements Usecase {

	constructor (
		readonly contractRepository: ContractRepository,
		readonly presenterFactory: PresenterFactory<InvoiceDto[]>,
		readonly mediator: EventPublisher
	) {
	}

	execute (input: Input & { format?: "json" }): Promise<InvoiceDto[]>;
	execute (input: Input & { format: "csv" }): Promise<string>;
	execute (input: Input): Promise<InvoiceDto[] | string>;
	async execute (input: Input): Promise<InvoiceDto[] | string> {
		const presenter = this.presenterFactory.create(input.format);
		const output: InvoiceDto[] = [];
		const contracts = await this.contractRepository.list();
		for (const contract of contracts) {
			const invoices = contract.generateInvoices(input.month, input.year, input.type);
			for (const invoice of invoices) {
				output.push({ date: invoice.date, amount: invoice.amount });
			}
		}
		await this.mediator.publish("InvoicesGenerated", output);
		return presenter.present(output);
	}
}

export type Output = InvoiceDto;

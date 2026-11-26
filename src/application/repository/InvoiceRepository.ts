import { InvoiceDto, Period } from "../usecase/Invoicing";

export type InvoiceToSave = InvoiceDto & { idContract: string };

export default interface InvoiceRepository {
	replacePeriod (period: Period, invoices: InvoiceToSave[]): Promise<void>;
	listPeriod (period: Period): Promise<InvoiceDto[]>;
}

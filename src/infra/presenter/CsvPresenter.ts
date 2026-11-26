import { InvoiceDto } from "../../application/usecase/Invoicing";
import Presenter from "../../application/presenter/Presenter";
import moment from "moment";

export default class CsvPresenter implements Presenter<InvoiceDto[], string> {

	present(output: InvoiceDto[]): string {
		const lines: string[] = [];
		for (const data of output) {
			const line: string[] = [];
			line.push(moment(data.date).format("YYYY-MM-DD"));
			line.push(`${data.amount}`);
			lines.push(line.join(";"));
		}
		return lines.join("\n");
	}

}
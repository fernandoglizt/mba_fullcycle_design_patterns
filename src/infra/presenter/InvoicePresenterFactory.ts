import Presenter from "../../application/presenter/Presenter";
import PresenterFactory from "../../application/presenter/PresenterFactory";
import { InvoiceDto } from "../../application/usecase/Invoicing";
import CsvPresenter from "./CsvPresenter";
import JsonPresenter from "./JsonPresenter";

export default class InvoicePresenterFactory implements PresenterFactory<InvoiceDto[]> {

	create (format = "json"): Presenter<InvoiceDto[], InvoiceDto[] | string> {
		if (format === "json") {
			return new JsonPresenter<InvoiceDto[]>();
		}
		if (format === "csv") {
			return new CsvPresenter();
		}
		throw new Error("Invalid format");
	}
}

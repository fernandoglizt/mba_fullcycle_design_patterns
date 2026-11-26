import axios from "axios";
import CloseInvoicing from "../src/application/usecase/CloseInvoicing";
import Contract from "../src/domain/Contract";
import PgPromiseAdapter from "../src/infra/database/PgPromiseAdapter";
import InvoicePresenterFactory from "../src/infra/presenter/InvoicePresenterFactory";
import JsonPresenter from "../src/infra/presenter/JsonPresenter";
import CsvPresenter from "../src/infra/presenter/CsvPresenter";
import ContractDatabaseRepository from "../src/infra/repository/ContractDatabaseRepository";
import InvoiceDatabaseRepository from "../src/infra/repository/InvoiceDatabaseRepository";

const url = "http://localhost:3000";
const january = { month: 1, year: 2022, type: "accrual" };
const seedId = "4224a279-c162-4283-86f5-1095f559b08c";
let connection: PgPromiseAdapter;
let invoices: InvoiceDatabaseRepository;

beforeAll(() => {
	connection = new PgPromiseAdapter();
	invoices = new InvoiceDatabaseRepository(connection);
});

afterAll(async () => {
	await connection.close();
});

test("seleciona o presenter pelo formato", () => {
	const presenters = new InvoicePresenterFactory();
	expect(presenters.create()).toBeInstanceOf(JsonPresenter);
	expect(presenters.create("json")).toBeInstanceOf(JsonPresenter);
	expect(presenters.create("csv")).toBeInstanceOf(CsvPresenter);
	expect(() => presenters.create("html")).toThrow("Invalid format");
});

test("fecha janeiro, substitui o lote e devolve as faturas por HTTP", async () => {
	const expected = [{ date: "2022-01-01T13:00:00.000Z", amount: 500 }];
	expect((await axios.post(url + "/close_invoicing", january)).data).toEqual(expected);
	expect((await axios.post(url + "/close_invoicing", january)).data).toEqual(expected);
	expect((await axios.get(url + "/invoices", { params: january })).data).toEqual(expected);

	const saved = await connection.query(
		"select id_contract from branas.invoice where month = $1 and year = $2 and type = $3",
		[1, 2022, "accrual"]
	);
	expect(saved).toEqual([{ id_contract: seedId }]);
	expect((await axios.get(url + "/invoices", {
		params: { ...january, year: 2000 }
	})).data).toEqual([]);
});

test("entrega CSV em texto e mantém a simulação sem persistência", async () => {
	const cash = { ...january, type: "cash", format: "csv" };

	const result = await axios.post(url + "/close_invoicing", cash);
	expect(result.headers["content-type"]).toMatch(/^text\/plain/);
	expect(result.data).toBe("2022-01-05;6000");
	expect((await axios.get(url + "/invoices", { params: cash })).data).toBe("2022-01-05;6000");

	const february = { ...january, month: 2, format: "csv" };
	await invoices.replacePeriod(february, []);
	expect((await axios.post(url + "/generate_invoices", february)).data).toBe("2022-02-01;500");
	expect(await invoices.listPeriod(february)).toEqual([]);
});

test("reverte o lote anterior inteiro quando um insert falha", async () => {
	const current = new ContractDatabaseRepository(connection);
	const publish = jest.fn(async () => {});
	const close = new CloseInvoicing(current, invoices, new InvoicePresenterFactory(), { publish });
	await close.execute(january);
	expect(publish).toHaveBeenCalledWith("InvoicesClosed", { ...january, invoices: 1, total: 500 });
	publish.mockClear();
	const readRows = () => connection.query(
		"select id_invoice, amount from branas.invoice where month = 1 and year = 2022 and type = 'accrual'",
		[]
	);
	const before = await readRows();

	const valid = new Contract(seedId, "Contrato alterado", 12000, 12, new Date("2022-01-01T10:00:00"));
	const invalid = new Contract("11111111-1111-4111-8111-111111111111", "Sem registro", 1200, 12, valid.date);
	const broken = new CloseInvoicing(
		{ list: async () => [valid, invalid] },
		invoices,
		new InvoicePresenterFactory(),
		{ publish }
	);
	await expect(broken.execute(january)).rejects.toMatchObject({ code: "23503" });
	expect(await readRows()).toEqual(before);
	expect(publish).not.toHaveBeenCalled();

	await expect(broken.execute({ ...january, format: "html" })).rejects.toThrow("Invalid format");
	await expect(broken.execute({ ...january, type: "unknown" })).rejects.toThrow("Invalid type");
	expect(await readRows()).toEqual(before);
});

test("um lote vazio remove apenas o período e o regime fechados", async () => {
	const period = { ...january, month: 3 };
	const date = new Date("2022-03-01T10:00:00");
	await invoices.replacePeriod(period, [{ idContract: seedId, date, amount: 100 }]);
	const cash = { ...period, type: "cash" };
	await invoices.replacePeriod(cash, [{ idContract: seedId, date, amount: 50 }]);
	const close = new CloseInvoicing({ list: async () => [] }, invoices, new InvoicePresenterFactory(), {
		publish: async () => {}
	});

	expect(await close.execute(period)).toEqual([]);
	expect(await invoices.listPeriod(period)).toEqual([]);
	expect(await invoices.listPeriod(cash)).toEqual([{ date, amount: 50 }]);
});

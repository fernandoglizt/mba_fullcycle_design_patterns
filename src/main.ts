import ContractDatabaseRepository from "./infra/repository/ContractDatabaseRepository";
import InvoiceDatabaseRepository from "./infra/repository/InvoiceDatabaseRepository";
import ExpressAdapter from "./infra/http/ExpressAdapter";
import GenerateInvoices from "./application/usecase/GenerateInvoices";
import CloseInvoicing from "./application/usecase/CloseInvoicing";
import ListInvoices from "./application/usecase/ListInvoices";
import InvoicePresenterFactory from "./infra/presenter/InvoicePresenterFactory";
import LoggerDecorator from "./application/decorator/LoggerDecorator";
import MainController from "./infra/http/MainController";
import PgPromiseAdapter from "./infra/database/PgPromiseAdapter";
import Mediator from "./infra/mediator/Mediator";
import SendEmail from "./application/usecase/SendEmail";

const connection = new PgPromiseAdapter();
const contractRepository = new ContractDatabaseRepository(connection);
const invoiceRepository = new InvoiceDatabaseRepository(connection);
const presenters = new InvoicePresenterFactory();
const mediator = new Mediator();
const sendEmail = new SendEmail();
mediator.on("InvoicesGenerated", data => sendEmail.execute(data));
mediator.on("InvoicesClosed", data => sendEmail.execute(data));

const generateInvoices = new LoggerDecorator(new GenerateInvoices(contractRepository, presenters, mediator));
const closeInvoicing = new LoggerDecorator(new CloseInvoicing(contractRepository, invoiceRepository, presenters, mediator));
const listInvoices = new ListInvoices(invoiceRepository, presenters);
const httpServer = new ExpressAdapter();
new MainController(httpServer, generateInvoices, closeInvoicing, listInvoices);
httpServer.listen(3000);

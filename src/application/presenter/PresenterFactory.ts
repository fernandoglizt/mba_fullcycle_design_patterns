import Presenter from "./Presenter";

export default interface PresenterFactory<Input> {
	create (format?: string): Presenter<Input, Input | string>;
}

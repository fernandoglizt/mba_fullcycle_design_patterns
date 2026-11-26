import Presenter from "../../application/presenter/Presenter";

export default class JsonPresenter<T> implements Presenter<T, T> {

	present (output: T): T {
		return output;
	}
}

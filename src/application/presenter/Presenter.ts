export default interface Presenter<Input, Output> {
	present (input: Input): Output;
}

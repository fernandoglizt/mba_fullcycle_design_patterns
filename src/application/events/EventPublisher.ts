export default interface EventPublisher {
	publish (event: string, data: unknown): Promise<void>;
}

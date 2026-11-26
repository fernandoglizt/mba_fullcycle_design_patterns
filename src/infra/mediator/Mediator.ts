import EventPublisher from "../../application/events/EventPublisher";

type Observer = (data: unknown) => void | Promise<void>;

export default class Mediator implements EventPublisher {
	observers: { event: string, callback: Observer }[];

	constructor () {
		this.observers = [];
	}

	on (event: string, callback: Observer) {
		this.observers.push({ event, callback });
	}

	async publish (event: string, data: unknown) {
		for (const observer of this.observers) {
			if (observer.event === event) {
				await observer.callback(data);
			}
		}
	}
}

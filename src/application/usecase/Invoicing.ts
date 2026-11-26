export type Period = {
	month: number,
	year: number,
	type: string
}

export type Input = Period & { format?: string };

export type InvoiceDto = {
	date: Date,
	amount: number
}

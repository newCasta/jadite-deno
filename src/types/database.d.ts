export interface JSONDocument {
	// deno-lint-ignore no-explicit-any
	[k: string]: any
	id: string
	createdAt: Date
	updatedAt: Date
}

export interface JSONDatabase<Document extends JSONDocument = JSONDocument> {
	[k: string]: Array<Document>
}

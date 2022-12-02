import { JSONDatabase, JSONDocument } from 'types/database.d.ts'
import { DocumentToUpdate } from '../types/collection.d.ts'

export class Document<CSchema extends JSONDocument = JSONDocument> {
	[k: string]: unknown
	#filePath
	#name

	async #getData() {
		const decoder = new TextDecoder('utf-8')
		const encodedData = await Deno.readFile(this.#filePath)
		const decodedData = decoder.decode(encodedData)
		const data: JSONDatabase<CSchema> = JSON.parse(decodedData)

		return data
	}

	async #saveData(data: JSONDatabase<CSchema>) {
		try {
			const encoder = new TextEncoder()
			const encodedData = encoder.encode(JSON.stringify(data, null, 4))
			await Deno.writeFile(this.#filePath, encodedData, { create: false })
		} catch (err) {
			console.log(err)
		}
	}

	constructor(documentData: CSchema, filePath: string, name: string) {
		for (const key in documentData) this[key as string] = documentData[key]

		this.#filePath = filePath
		this.#name = name

		return this
	}

	toObject() {
		const document = JSON.parse(JSON.stringify(this)) as CSchema

		document.createdAt = new Date(document.createdAt)
		document.updatedAt = new Date(document.updatedAt)

		return document
	}

	toString() {
		return JSON.stringify(this)
	}

	async update(documentValues: DocumentToUpdate<CSchema>) {
		if ('id' in documentValues) throw Error("can't update id")
		if ('createdAt' in documentValues)
			throw Error('createdAt is automatically updated')
		if ('updatedAt' in documentValues)
			throw Error('updatedAt is automatically updated')

		const data = await this.#getData()
		const document = data[this.#name].find(d => d.id === this.id)!

		const newDocument = {
			...document,
			...documentValues,
			createdAt: new Date(document.createdAt),
			updatedAt: new Date()
		} as CSchema

		data[this.#name] = data[this.#name].map(d =>
			d.id === this.id ? newDocument : d
		)

		await this.#saveData(data)

		return newDocument
	}

	async delete() {
		const data = await this.#getData()

		data[this.#name] = data[this.#name].filter(d => d.id !== this.id)

		await this.#saveData(data)
	}
}

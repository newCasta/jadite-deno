import { JSONDatabase, JSONDocument } from 'types/database.d.ts'
import { Collection } from './collection.ts'

export class Database {
	#filePath

	constructor(filePath: string) {
		this.#filePath = filePath
	}

	private async initCollection(name: string) {
		const decoder = new TextDecoder('utf-8')
		const encoder = new TextEncoder()
		let encodedData = await Deno.readFile(this.#filePath)
		let decodedData = decoder.decode(encodedData)

		if (!decodedData) {
			await Deno.writeFile(this.#filePath, encoder.encode('{}'), {
				create: false
			})
			encodedData = await Deno.readFile(this.#filePath)
			decodedData = decoder.decode(encodedData)
		}

		const data: JSONDatabase = JSON.parse(decodedData)

		if (!data[name]) {
			data[name] = []

			const encodedData = encoder.encode(JSON.stringify(data, null, 4))
			await Deno.writeFile(this.#filePath, encodedData, { create: false })
		}
	}

	async collection<CSchema extends JSONDocument>(name: string) {
		await this.initCollection(name)

		return new Collection<CSchema>(name, this.#filePath)
	}
}

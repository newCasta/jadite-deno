import {
	DocumentToInsert,
	DocumentToUpdate,
	FilterDocument
} from 'types/collection.d.ts'
import { JSONDatabase, JSONDocument } from 'types/database.d.ts'
import { Document } from './document.ts'

export class Collection<CSchema extends JSONDocument = JSONDocument> {
	#name
	#filePath

	static #matches<T, K extends keyof T>(query: FilterDocument<T>, data: T) {
		for (const [k, v] of Object.entries(query))
			if (data[k as K] !== v) return false

		return true
	}

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

	constructor(name: string, filePath: string) {
		this.#name = name
		this.#filePath = filePath
	}

	async find(query?: FilterDocument<CSchema>) {
		const data = await this.#getData()

		if (!query)
			return data[this.#name].map(d => {
				const document = {
					...d,
					createdAt: new Date(d.createdAt),
					updatedAt: new Date(d.updatedAt)
				} as CSchema

				return new Document(document, this.#filePath, this.#name)
			})

		const documents = data[this.#name]
			.filter(d => Collection.#matches(query, d))
			.map(d => {
				const document = {
					...d,
					createdAt: new Date(d.createdAt),
					updatedAt: new Date(d.updatedAt)
				} as CSchema

				return new Document(document, this.#filePath, this.#name)
			})

		return documents
	}

	async findOne(query: FilterDocument<CSchema>) {
		if (!query) return undefined

		const data = await this.#getData()
		const document = data[this.#name].find(d =>
			Collection.#matches(query, d)
		)

		if (!document) return undefined

		document.createdAt = new Date(document.createdAt)
		document.updatedAt = new Date(document.updatedAt)

		return new Document(document, this.#filePath, this.#name)
	}

	async insertOne(documentValues: DocumentToInsert<CSchema>) {
		if ('id' in documentValues) throw Error('id is automatically created')
		if ('createdAt' in documentValues)
			throw Error('createdAt is automatically created')
		if ('updatedAt' in documentValues)
			throw Error('updatedAt is automatically created')

		const data = await this.#getData()
		const document = {
			...documentValues,
			id: crypto.randomUUID(),
			createdAt: new Date(),
			updatedAt: new Date()
		} as CSchema

		data[this.#name].push(document)

		await this.#saveData(data)

		return new Document(document, this.#filePath, this.#name)
	}

	async insertMany(documentsValues: Array<DocumentToInsert<CSchema>>) {
		const data = await this.#getData()
		const documents = []

		for (const documentValues of documentsValues) {
			if ('id' in documentValues)
				throw Error('id is automatically created')
			if ('createdAt' in documentValues)
				throw Error('createdAt is automatically created')
			if ('updatedAt' in documentValues)
				throw Error('updatedAt is automatically created')

			const document = {
				...documentValues,
				id: crypto.randomUUID(),
				createdAt: new Date(),
				updatedAt: new Date()
			} as CSchema

			data[this.#name].push(document)
			documents.push(new Document(document, this.#filePath, this.#name))
		}

		await this.#saveData(data)

		return documents
	}

	async updateOne(
		query: FilterDocument<CSchema>,
		documentValues: DocumentToUpdate<CSchema>
	) {
		if (!query) throw Error('query must be assigned')
		if ('id' in documentValues) throw Error("can't update id")
		if ('createdAt' in documentValues)
			throw Error('createdAt is automatically updated')
		if ('updatedAt' in documentValues)
			throw Error('updatedAt is automatically updated')

		const data = await this.#getData()
		const document = data[this.#name].find(d =>
			Collection.#matches(query, d)
		)

		if (!document) return undefined

		const newDocument = {
			...document,
			...documentValues,
			updatedAt: new Date()
		} as CSchema

		data[this.#name] = data[this.#name].map(d =>
			Collection.#matches(query, d) ? newDocument : d
		)

		await this.#saveData(data)

		return new Document(document, this.#filePath, this.#name)
	}

	async updateMany(
		query: FilterDocument<CSchema>,
		documentValues: DocumentToUpdate<CSchema>
	) {
		const data = await this.#getData()
		const docs = data[this.#name].filter(d => Collection.#matches(query, d))
		const documents = []

		for (const document of docs) {
			if (!query) throw Error('query must be assigned')
			if ('id' in documentValues) throw Error("can't update id")
			if ('createdAt' in documentValues)
				throw Error('createdAt is automatically updated')
			if ('updatedAt' in documentValues)
				throw Error('updatedAt is automatically updated')

			const newDocument = {
				...document,
				...documentValues,
				updatedAt: new Date()
			} as CSchema

			data[this.#name] = data[this.#name].map(d =>
				Collection.#matches(query, d) ? newDocument : d
			)
			documents.push(
				new Document(newDocument, this.#filePath, this.#name)
			)
		}

		await this.#saveData(data)

		return documents
	}

	async deleteOne(query: FilterDocument<CSchema>) {
		if (!query) throw Error('query must be assigned')

		const data = await this.#getData()
		const document = data[this.#name].find(d =>
			Collection.#matches(query, d)
		)

		if (!document) return

		data[this.#name] = data[this.#name].filter(d => d.id !== document.id)

		await this.#saveData(data)
	}

	async deleteMany(query: FilterDocument<CSchema>) {
		if (!query) throw Error('query must be assigned')

		const data = await this.#getData()

		data[this.#name] = data[this.#name].filter(
			d => !Collection.#matches(query, d)
		)

		await this.#saveData(data)
	}

	async findById(id: CSchema['id']) {
		if (!id) return undefined

		const document = await this.findOne({ id } as FilterDocument<CSchema>)

		return document
	}

	async findByIdAndUpdate(
		id: CSchema['id'],
		documentValues: DocumentToUpdate<CSchema>
	) {
		if (!id) return undefined

		const document = await this.findOne({ id } as FilterDocument<CSchema>)

		if (!document) return undefined

		const newDocument = await document.update(documentValues)

		return new Document(newDocument, this.#filePath, this.#name)
	}

	async findByIdAndDelete(id: CSchema['id']) {
		if (!id) return

		const document = await this.findOne({ id } as FilterDocument<CSchema>)

		if (!document) return

		await document.delete()
	}
}

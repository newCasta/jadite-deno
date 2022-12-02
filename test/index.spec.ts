import { join } from 'path'
import { assertEquals } from 'https://deno.land/std@0.167.0/testing/asserts.ts'
import { JSONClient } from '../mod.ts'
import { exists, dirname } from 'utils/functions.ts'
import { JSONDatabase } from '../src/types/database.d.ts'

interface Test {
	id: string
	createdAt: Date
	updatedAt: Date
	name: string
	desc: string
}

const __dirname = dirname(import.meta)
const filePath = join(__dirname, 'test.db.json')
const client = new JSONClient('./test')

Deno.test('Check if JSON file is created', async () => {
	await client.database('test')
	const existFile = await exists(filePath)

	assertEquals(existFile, true)

	await Deno.remove(filePath)
})

Deno.test(
	'Check if table test is created, and also if table length equals to 0',
	async () => {
		const decoder = new TextDecoder('utf-8')
		const db = await client.database('test')
		await db.collection('test')
		const encodedFile = await Deno.readFile(filePath)
		const fileData: JSONDatabase<Test> = JSON.parse(
			decoder.decode(encodedFile)
		)

		const existTable = 'test' in fileData
		const tableLength = fileData.test.length < 1

		assertEquals(existTable, true)
		assertEquals(tableLength, true)

		await Deno.remove(filePath)
	}
)

Deno.test('Check if document is created in the table', async () => {
	const decoder = new TextDecoder('utf-8')
	const db = await client.database('test')
	const coll = await db.collection<Test>('test')

	const document = (
		await coll.insertOne({
			name: 'test',
			desc: 'is a test'
		})
	).toObject()

	const encodedFile = await Deno.readFile(filePath)
	const fileData: JSONDatabase<Test> = JSON.parse(decoder.decode(encodedFile))

	fileData.test[0].createdAt = new Date(fileData.test[0].createdAt)
	fileData.test[0].updatedAt = new Date(fileData.test[0].updatedAt)

	assertEquals(document, fileData.test[0])

	await Deno.remove(filePath)
})

Deno.test('Check if document is deleted in the table', async () => {
	const decoder = new TextDecoder('utf-8')
	const db = await client.database('test')
	const coll = await db.collection<Test>('test')
	const encodedFile = await Deno.readFile(filePath)
	const fileData: JSONDatabase<Test> = JSON.parse(decoder.decode(encodedFile))

	const document = await coll.insertMany([
		{
			name: 'test',
			desc: 'is a test'
		},
		{
			name: 'test 2',
			desc: 'is a test 2'
		}
	])
	await document[1].delete()

	assertEquals((await coll.find()).length !== 0, fileData.test.length === 0)

	await Deno.remove(filePath)
})

Deno.test('Check if document is updated in the table', async () => {
	const decoder = new TextDecoder('utf-8')
	const db = await client.database('test')
	const coll = await db.collection<Test>('test')

	const document = await coll.insertOne({
		name: 'test',
		desc: 'is a test'
	})

	const encodedFile = await Deno.readFile(filePath)
	const fileData: JSONDatabase<Test> = JSON.parse(decoder.decode(encodedFile))

	const newDocument = await document.update({
		name: 'test 2'
	})

	assertEquals(newDocument.name !== 'test', fileData.test[0].name === 'test')

	await Deno.remove(filePath)
})

Deno.test('Check if get all documents of the table', async () => {
	const decoder = new TextDecoder('utf-8')
	const db = await client.database('test')
	const coll = await db.collection<Test>('test')

	await coll.insertMany([
		{
			name: 'test',
			desc: 'is a test'
		},
		{
			name: 'test',
			desc: 'is a test'
		},
		{
			name: 'test',
			desc: 'is a test'
		},
		{
			name: 'test',
			desc: 'is a test'
		}
	])
	const documents = (await coll.find()).map(d => d.toObject())

	const encodedFile = await Deno.readFile(filePath)
	const fileData: JSONDatabase<Test> = JSON.parse(decoder.decode(encodedFile))

	const data = fileData.test.map(
		d =>
			({
				...d,
				createdAt: new Date(d.createdAt),
				updatedAt: new Date(d.updatedAt)
			} as Test)
	)

	assertEquals(documents, data)

	await Deno.remove(filePath)
})

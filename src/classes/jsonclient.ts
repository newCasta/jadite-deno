import { join } from 'path'
import { ensureFile } from 'fs'

import { Database } from './database.ts'

export class JSONClient {
	#path

	constructor(path: string) {
		this.#path = path
	}

	async database(name: string) {
		const filePath = join(Deno.cwd(), this.#path, `${name}.db.json`)

		await ensureFile(filePath)

		return new Database(filePath)
	}
}

import { JSONDocument } from './database.d.ts'

export type FilterDocument<D> = {
	[P in keyof D]?: D[P]
}

export type DocumentToUpdate<D extends JSONDocument> = FilterDocument<
	Omit<D, 'id' | 'createdAt' | 'updatedAt'>
>

export type DocumentToInsert<D extends JSONDocument> = Omit<
	D,
	'id' | 'createdAt' | 'updatedAt'
>

import { dirname as dir } from 'path'
import { fileURLToPath } from 'url'

export const filename = (meta: ImportMeta) => {
	return fileURLToPath(meta.url)
}

export const dirname = (meta: ImportMeta) => {
	return dir(filename(meta))
}

export const exists = async (filePath: string): Promise<boolean> => {
	try {
		await Deno.stat(filePath)
		// successful, file or directory must exist
		return true
	} catch (error) {
		if (error instanceof Deno.errors.NotFound) {
			// file or directory does not exist
			return false
		} else {
			// unexpected error, maybe permissions, pass it along
			throw error
		}
	}
}

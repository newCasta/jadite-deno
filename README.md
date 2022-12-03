# JADite

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Usage](#usage)

## About <a name = "about"></a>

A library that let you use JSON files as databases.

## Getting Started <a name = "getting_started"></a>

```ts
import { JSONClient } from 'https://deno.land/x/jadite/mod.ts'
```

## Usage <a name = "usage"></a>

```ts
interface Test {
	id: string
	createdAt: Date
	updatedAt: Date
	name: string
	desc: string
}

const client = new JSONClient('./src/data')
// It will create a test.db.json file in the ./src/data path
const database = await client.database('test')
// It will create a table in the test.db.json file
const collection = await db.collection<Test>('test-table')
```

Each collection have the following methods

```ts
// insert a document with the values in the parameter
collection.insertOne({...values})
// insert an array of documents with the values in the parameter
collection.insertMany([{..values}, {...values}, {...values}])
// find the documents of the table query parameter is optional to find specific documents
collection.find({...properties})
// find a document with the query parameter
collection.findOne({ ...properties })
// find a document with id
collection.findById('id')
// update a document with id
collection.findByIdAndUpdate('id')
// delete a document with id
collection.findByIdAndDelete('id')
// update a document with the query and the values
collection.updateOne({...properties}, {...values})
// update all the documents that match with the query
collection.updateMany({...properties}, {...values})
// delete a document with the query
collection.deleteOne({...properties})
// find all the documents with the query
collection.deleteMany({...properties})
```

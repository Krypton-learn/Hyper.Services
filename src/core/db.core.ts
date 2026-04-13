import { MongoClient, Db } from 'mongodb'
import { env } from './env.core'

let client: MongoClient | null = null
let isConnected = false

export async function connectDB(): Promise<Db> {
	if (isConnected && client) {
		return client.db(env.DB_NAME)
	}

	try {
		client = new MongoClient(env.DB_URI)
		await client.connect()
		isConnected = true
		console.log('MongoDB connected')
		return client.db(env.DB_NAME)
	} catch (error) {
		console.error('MongoDB connection error:', error)
		throw error
	}
}

export async function disconnectDB(): Promise<void> {
	if (!client || !isConnected) return

	try {
		await client.close()
		client = null
		isConnected = false
		console.log('MongoDB disconnected')
	} catch (error) {
		console.error('MongoDB disconnect error:', error)
	}
}

export function getDB(): Db {
	if (!client) {
		throw new Error('Database not connected. Call connectDB() first.')
	}
	return client.db(env.DB_NAME)
}
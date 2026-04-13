import { Schema } from 'mongodb'

export const employeeSchema = new Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		passwordHash: {
			type: String,
			required: true,
		},
	},
	{
		collection: 'employees',
		timestamps: true,
	}
)
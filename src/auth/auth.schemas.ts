import { Schema } from 'mongodb'

export const userSchema = new Schema(
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
		firstName: {
			type: String,
		},
		lastName: {
			type: String,
		},
		phone: {
			type: String,
		},
		dob: {
			type: Date,
		},
		interests: {
			type: [String],
		},
		address: {
			type: String,
		},
	},
	{
		collection: 'users',
		timestamps: true,
	}
)
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
		organization: {
			type: Schema.Types.ObjectId,
			ref: 'organizations',
		},
	},
	{
		collection: 'users',
		timestamps: true,
	}
)
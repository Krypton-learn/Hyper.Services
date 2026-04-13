import { Schema } from 'mongodb'

export const orgSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    founder: {
      type: Schema.Types.ObjectId,
      ref: 'employees',
      required: true,
    },
    admin: {
      type: [Schema.Types.ObjectId],
      ref: 'employees',
    },
    departments: {
      type: [String],
    },
  },
  {
    collection: 'organizations',
    timestamps: true,
  }
)
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
    }
  },
  {
    collection: 'organizations',
    timestamps: true,
  }
)

import { Schema } from 'mongodb'

export const phaseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    tasks: {
      type: [Schema.Types.ObjectId],
      ref: 'tasks',
    },
    budget: {
      type: Number,
    },
    starting_date: {
      type: Date,
    },
    ending_date: {
      type: Date,
    },
    sops: {
      type: [Schema.Types.ObjectId],
      ref: 'documents',
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
      required: true,
    },
  },
  {
    collection: 'phases',
    timestamps: true,
  }
)
import { Schema } from 'mongodb'

export const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'employees',
      required: true,
    },
    created_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
    assigned_to: {
      type: Schema.Types.ObjectId,
      ref: 'employees',
    },
    starting_date: {
      type: Date,
    },
    due_date: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Due', 'Upcoming', 'Completed'],
      default: 'Upcoming',
    },
    team: {
      type: [Schema.Types.ObjectId],
      ref: 'employees',
    },
    phase: {
      type: Schema.Types.ObjectId,
      ref: 'phases',
    },
    tempTeamMembers: {
      type: [Schema.Types.ObjectId],
      ref: 'employees',
    },
    description: {
      type: String,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
  },
  {
    collection: 'tasks',
    timestamps: true,
  }
)

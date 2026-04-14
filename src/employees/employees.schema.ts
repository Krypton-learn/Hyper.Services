import { Schema } from 'mongodb'

export const employeeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      unique: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isFounder: {
      type: Boolean,
      default: false,
    },
    department: {
      type: String,
    },
    organization: {
      type: [Schema.Types.ObjectId],
      ref: 'organizations',
    },
    role: {
      type: String,
      enum: ['employee', 'Head'],
      default: 'employee',
    },
    joiningDate: {
      type: Date,
    },
  },
  {
    collection: 'employees',
    timestamps: true,
  }
)

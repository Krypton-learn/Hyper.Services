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
    isAdmin: {
      type: Boolean,
      required: true,
    },
    isFounder: {
      type: Boolean,
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
    department: {
      type: String,
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: 'organizations',
    },
    role: {
      type: String,
      enum: ['employee', 'Head'],
      default: 'employee',
    },
    profilePicture: {
      type: String,
    },
    address: {
      type: String,
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

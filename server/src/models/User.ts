import { Schema, model, type Document } from 'mongoose';

export type UserRole = 'traveler' | 'admin';

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

const userSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['traveler', 'admin'],
      default: 'traveler',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret.id = ret.id || String(ret._id);
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash; // Critical: passwordHash NEVER leaves server in JSON representation
        return ret;
      },
    },
  },
);

export const UserModel = model<IUser>('User', userSchema);

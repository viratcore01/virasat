import mongoose, { Schema, Document } from 'mongoose'
import { Religion, CheckInFrequency, UserStatus } from '@/types'

export interface UserDocument extends Document {
  email: string
  name: string
  phone: string
  religion: Religion
  dob: string
  passwordHash: string
  encryptionSalt: string
  serverShare: string
  checkInFrequency: CheckInFrequency
  lastCheckIn: Date
  missedCount: number
  snoozeUntil?: Date
  status: UserStatus
  subscriptionStatus: 'free' | 'pending' | 'active' | 'past_due' | 'cancelled'
  subscriptionId?: string
  subscriptionCurrentEnd?: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<UserDocument>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  religion: { type: String, enum: ['hindu', 'muslim', 'christian', 'sikh', 'jain', 'other'], required: true },
  dob: { type: String, required: true },
  passwordHash: { type: String, required: true },
  encryptionSalt: { type: String, required: true },
  serverShare: { type: String, default: '' }, // Shamir share 1
  checkInFrequency: { type: String, enum: ['weekly', 'fortnightly', 'monthly'], default: 'weekly' },
  lastCheckIn: { type: Date, default: Date.now },
  missedCount: { type: Number, default: 0 },
  snoozeUntil: { type: Date },
  status: { type: String, enum: ['active', 'pending_verification', 'verified_deceased', 'delivered'], default: 'active' },
  subscriptionStatus: { type: String, enum: ['free', 'pending', 'active', 'past_due', 'cancelled'], default: 'free' },
  subscriptionId: { type: String },
  subscriptionCurrentEnd: { type: Date },
}, { timestamps: true })

UserSchema.index({ status: 1 })
UserSchema.index({ lastCheckIn: 1, status: 1 })

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema)

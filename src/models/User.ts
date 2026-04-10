import mongoose, { Schema, Document } from 'mongoose'
import { Religion, CheckInFrequency, UserStatus } from '@/types'
import { encryptField, decryptField } from '@/lib/serverCrypto'

export interface UserDocument extends Document {
  email: string
  name: string
  phone: string
  religion: Religion
  dob: string
  passwordHash: string
  encryptionSalt: string
  keyCheck?: string
  serverShare: string
  checkInFrequency: CheckInFrequency
  lastCheckIn: Date
  missedCount: number
  snoozeUntil?: Date
  status: UserStatus
  subscriptionStatus: 'free' | 'pending' | 'active' | 'past_due' | 'cancelled'
  subscriptionId?: string
  subscriptionCurrentEnd?: Date
  isDataEncrypted: boolean
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
  keyCheck: { type: String, default: '' },
  serverShare: { type: String, default: '' },
  checkInFrequency: { type: String, enum: ['weekly', 'fortnightly', 'monthly'], default: 'weekly' },
  lastCheckIn: { type: Date, default: Date.now },
  missedCount: { type: Number, default: 0 },
  snoozeUntil: { type: Date },
  status: { type: String, enum: ['active', 'pending_verification', 'verified_deceased', 'delivered'], default: 'active' },
  subscriptionStatus: { type: String, enum: ['free', 'pending', 'active', 'past_due', 'cancelled'], default: 'free' },
  subscriptionId: { type: String },
  subscriptionCurrentEnd: { type: Date },
  isDataEncrypted: { type: Boolean, default: false },
}, { timestamps: true })

UserSchema.index({ status: 1 })
UserSchema.index({ lastCheckIn: 1, status: 1 })

function decryptUserFields(doc: UserDocument) {
  if (!doc.isDataEncrypted) return

  try {
    if (doc.phone) doc.phone = decryptField(doc.phone)
    if (doc.religion) doc.religion = decryptField(doc.religion) as Religion
    if (doc.dob) doc.dob = decryptField(doc.dob)
  } catch (error) {
    console.error('Failed to decrypt user fields:', error)
  }
}

UserSchema.pre('save', function (next) {
  if (this.isDataEncrypted) {
    return next()
  }

  if (this.isModified('phone') && this.phone) {
    this.phone = encryptField(this.phone)
  }
  if (this.isModified('religion') && this.religion) {
    this.religion = encryptField(this.religion) as Religion
  }
  if (this.isModified('dob') && this.dob) {
    this.dob = encryptField(this.dob)
  }

  this.isDataEncrypted = true
  next()
})

UserSchema.post('find', function (docs: UserDocument[]) {
  docs.forEach(doc => decryptUserFields(doc))
})

UserSchema.post('findOne', function (doc: UserDocument | null) {
  if (doc) decryptUserFields(doc)
})

UserSchema.post('findOneAndUpdate', function (doc: UserDocument | null) {
  if (doc) decryptUserFields(doc)
})

export const User = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema)
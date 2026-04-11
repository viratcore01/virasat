import mongoose, { Schema, Document } from 'mongoose'
import { ExecutorStatus } from '@/types'

export interface ExecutorDocument extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  email: string
  phone: string
  relationship: string
  uniqueToken: string
  executorShare: string
  status: ExecutorStatus
  notifiedAt?: Date
  verifiedAt?: Date
  deathCertificateUrl?: string
  dateOfDeath?: string
  unlockDate?: Date
  createdAt: Date
  verifiedEmailAt?: Date
  identityVerified: boolean
  currentStep: number
  flowCompleted: boolean
  vaultAccessToken?: string
}

const ExecutorSchema = new Schema<ExecutorDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, required: true },
  relationship: { type: String, required: true },
  uniqueToken: { type: String, required: true, unique: true },
  executorShare: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'notified', 'verified', 'cancelled'], default: 'pending' },
  notifiedAt: { type: Date },
  verifiedAt: { type: Date },
  deathCertificateUrl: { type: String },
  dateOfDeath: { type: String },
  unlockDate: { type: Date },
  verifiedEmailAt: { type: Date },
  identityVerified: { type: Boolean, default: false },
  currentStep: { type: Number, default: 0 },
  flowCompleted: { type: Boolean, default: false },
  vaultAccessToken: { type: String },
}, { timestamps: true })

ExecutorSchema.index({ userId: 1 })

export const Executor = mongoose.models.Executor || mongoose.model<ExecutorDocument>('Executor', ExecutorSchema)

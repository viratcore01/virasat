import mongoose, { Schema, Document } from 'mongoose'
import { VaultCategory, MessageType, TriggerType, ExecutorRequestStatus } from '@/types'

// ─── BENEFICIARY ─────────────────────────────────────────────────────────────

export interface BeneficiaryDocument extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  email: string
  phone: string
  relationship: string
  createdAt: Date
}

const BeneficiarySchema = new Schema<BeneficiaryDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, required: true },
  relationship: { type: String, required: true },
}, { timestamps: true })

BeneficiarySchema.index({ userId: 1 })

export const Beneficiary = mongoose.models.Beneficiary ||
  mongoose.model<BeneficiaryDocument>('Beneficiary', BeneficiarySchema)

// ─── VAULT ITEM ───────────────────────────────────────────────────────────────

export interface VaultItemDocument extends Document {
  userId: mongoose.Types.ObjectId
  category: VaultCategory
  title: string
  encryptedData: string
  assignedTo: mongoose.Types.ObjectId
  hasAttachment: boolean
  attachmentUrl?: string
  createdAt: Date
  updatedAt: Date
}

const VaultItemSchema = new Schema<VaultItemDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['bank_account', 'fd_rd', 'crypto', 'gold', 'insurance', 'property', 'password', 'bank_locker', 'other'],
    required: true
  },
  title: { type: String, required: true },
  encryptedData: { type: String, required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'Beneficiary', required: true },
  hasAttachment: { type: Boolean, default: false },
  attachmentUrl: { type: String },
}, { timestamps: true })

VaultItemSchema.index({ userId: 1 })
VaultItemSchema.index({ userId: 1, category: 1 })

export const VaultItem = mongoose.models.VaultItem ||
  mongoose.model<VaultItemDocument>('VaultItem', VaultItemSchema)

// ─── MESSAGE ─────────────────────────────────────────────────────────────────

export interface MessageDocument extends Document {
  userId: mongoose.Types.ObjectId
  type: MessageType
  title: string
  assignedTo: mongoose.Types.ObjectId
  triggerType: TriggerType
  triggerDate?: Date
  encryptedContentUrl?: string
  encryptedText?: string
  delivered: boolean
  deliveredAt?: Date
  createdAt: Date
}

const MessageSchema = new Schema<MessageDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['video', 'letter', 'voice'], required: true },
  title: { type: String, required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'Beneficiary', required: true },
  triggerType: { type: String, enum: ['on_death', 'on_date'], required: true },
  triggerDate: { type: Date },
  encryptedContentUrl: { type: String },
  encryptedText: { type: String },
  delivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
}, { timestamps: true })

MessageSchema.index({ userId: 1 })
MessageSchema.index({ delivered: 1, triggerType: 1, triggerDate: 1 })

export const Message = mongoose.models.Message ||
  mongoose.model<MessageDocument>('Message', MessageSchema)

// ─── CHECKIN ─────────────────────────────────────────────────────────────────

export interface CheckInDocument extends Document {
  userId: mongoose.Types.ObjectId
  token: string
  scheduledFor: Date
  respondedAt?: Date
  missed: boolean
  createdAt: Date
}

const CheckInSchema = new Schema<CheckInDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  scheduledFor: { type: Date, required: true },
  respondedAt: { type: Date },
  missed: { type: Boolean, default: false },
}, { timestamps: true })

CheckInSchema.index({ userId: 1, scheduledFor: -1 })

export const CheckIn = mongoose.models.CheckIn ||
  mongoose.model<CheckInDocument>('CheckIn', CheckInSchema)

// ─── EXECUTOR REQUEST ────────────────────────────────────────────────────────

export interface ExecutorRequestDocument extends Document {
  userId: mongoose.Types.ObjectId
  executorId: mongoose.Types.ObjectId
  initiatedAt: Date
  deathCertificateUrl?: string
  dateOfDeath?: string
  verifiedAt?: Date
  unlockDate?: Date
  status: ExecutorRequestStatus
  cancellationReason?: string
  createdAt: Date
}

const ExecutorRequestSchema = new Schema<ExecutorRequestDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  executorId: { type: Schema.Types.ObjectId, ref: 'Executor', required: true },
  initiatedAt: { type: Date, required: true },
  deathCertificateUrl: { type: String },
  dateOfDeath: { type: String },
  verifiedAt: { type: Date },
  unlockDate: { type: Date },
  status: {
    type: String,
    enum: ['pending', 'verified', 'waiting', 'delivered', 'cancelled'],
    default: 'pending'
  },
  cancellationReason: { type: String },
}, { timestamps: true })

ExecutorRequestSchema.index({ userId: 1 })
ExecutorRequestSchema.index({ status: 1, unlockDate: 1 })

export const ExecutorRequest = mongoose.models.ExecutorRequest ||
  mongoose.model<ExecutorRequestDocument>('ExecutorRequest', ExecutorRequestSchema)

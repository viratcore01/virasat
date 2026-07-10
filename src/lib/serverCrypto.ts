/**
 * SERVER-SIDE FIELD ENCRYPTION
 * Encrypts sensitive PII fields stored in MongoDB
 * Uses AES-256-GCM with server master key from environment
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

function getServerKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }
  const keyBuffer = Buffer.from(key, 'hex')
  if (keyBuffer.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters)')
  }
  return keyBuffer
}

function isValidEncryptedFormat(data: string): boolean {
  if (!data || typeof data !== 'string') return false
  const parts = data.split(':')
  if (parts.length !== 3) return false

  const [ivB64, ciphertextB64, tagB64] = parts
  const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/
  if (!ivB64 || !ciphertextB64 || !tagB64) return false
  if (!base64Pattern.test(ivB64) || !base64Pattern.test(ciphertextB64) || !base64Pattern.test(tagB64)) return false

  try {
    const ivBytes = Buffer.from(ivB64, 'base64')
    const tagBytes = Buffer.from(tagB64, 'base64')
    Buffer.from(ciphertextB64, 'base64')
    return ivBytes.length === IV_LENGTH && tagBytes.length === AUTH_TAG_LENGTH
  } catch {
    return false
  }
}

export function encryptField(plaintext: string): string {
  if (!plaintext || plaintext.trim() === '') {
    return plaintext
  }
  if (isValidEncryptedFormat(plaintext)) {
    return plaintext
  }

  const key = getServerKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const ciphertext = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ])

  const authTag = cipher.getAuthTag()

  return `${iv.toString('base64')}:${ciphertext.toString('base64')}:${authTag.toString('base64')}`
}

export function decryptField(encryptedData: string): string {
  if (!encryptedData || encryptedData.trim() === '') {
    return encryptedData
  }
  if (!isValidEncryptedFormat(encryptedData)) {
    return encryptedData
  }

  const key = getServerKey()
  const [ivBase64, ciphertextBase64, authTagBase64] = encryptedData.split(':')

  const iv = Buffer.from(ivBase64, 'base64')
  const ciphertext = Buffer.from(ciphertextBase64, 'base64')
  const authTag = Buffer.from(authTagBase64, 'base64')

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ])

  return plaintext.toString('utf8')
}

export const ENCRYPTED_FIELDS = ['phone', 'religion', 'dob'] as const
export type EncryptedField = typeof ENCRYPTED_FIELDS[number]

export function isEncryptedField(field: string): field is EncryptedField {
  return ENCRYPTED_FIELDS.includes(field as EncryptedField)
}

export function generateEncryptionKey(): string {
  const keyBytes = randomBytes(32)
  return keyBytes.toString('hex')
}
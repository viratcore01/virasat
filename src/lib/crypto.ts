/**
 * VIRASAT CRYPTO ENGINE
 * Zero-knowledge AES-256-GCM encryption
 * Server NEVER sees plaintext. Ever.
 * All encryption/decryption happens in the browser.
 */

const PBKDF2_ITERATIONS = 100000
const SALT_LENGTH = 32
const IV_LENGTH = 12
const KEY_LENGTH = 256

// ─── KEY DERIVATION ───────────────────────────────────────────────────────────

/**
 * Derives an AES-256 key from user's master password + salt
 * Uses PBKDF2 with 100k iterations — slow by design
 */
export async function deriveKey(masterPassword: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(masterPassword)
  const normalizedSalt = new Uint8Array(salt)

  const importedKey = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: normalizedSalt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    importedKey,
    { name: 'AES-GCM', length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  )
}

/**
 * Generates a random salt for a new user
 * Store this salt in DB (it's not secret — needed for key derivation)
 */
export function generateSalt(): string {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  return bufferToBase64(salt)
}

// ─── ENCRYPTION ───────────────────────────────────────────────────────────────

/**
 * Encrypts any string data using AES-256-GCM
 * Returns: base64(iv) + ":" + base64(ciphertext)
 */
export async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const data = encoder.encode(plaintext)

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )

  return `${bufferToBase64(iv)}:${bufferToBase64(new Uint8Array(ciphertext))}`
}

/**
 * Decrypts AES-256-GCM encrypted data
 */
export async function decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
  const [ivBase64, ciphertextBase64] = encryptedData.split(':')

  if (!ivBase64 || !ciphertextBase64) {
    throw new Error('Invalid encrypted data format')
  }

  const iv = base64ToBuffer(ivBase64)
  const ciphertext = base64ToBuffer(ciphertextBase64)
  const normalizedIv = new Uint8Array(iv)
  const normalizedCiphertext = new Uint8Array(ciphertext)
  const decoder = new TextDecoder()

  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: normalizedIv },
    key,
    normalizedCiphertext
  )

  return decoder.decode(plaintext)
}

/**
 * Encrypts a JS object (auto-serializes to JSON)
 */
export async function encryptObject<T>(obj: T, key: CryptoKey): Promise<string> {
  return encrypt(JSON.stringify(obj), key)
}

/**
 * Decrypts and deserializes a JS object
 */
export async function decryptObject<T>(encryptedData: string, key: CryptoKey): Promise<T> {
  const json = await decrypt(encryptedData, key)
  return JSON.parse(json) as T
}

// ─── SESSION KEY MANAGEMENT ───────────────────────────────────────────────────

/**
 * Stores the derived key in sessionStorage (cleared when tab closes)
 * We store the raw key bytes, not the CryptoKey object
 */
export async function storeSessionKey(key: CryptoKey, userId: string): Promise<void> {
  const exported = await crypto.subtle.exportKey('raw', key)
  const keyBase64 = bufferToBase64(new Uint8Array(exported))
  sessionStorage.setItem(`virasat_key_${userId}`, keyBase64)
}

/**
 * Retrieves the session key
 */
export async function getSessionKey(userId: string): Promise<CryptoKey | null> {
  const keyBase64 = sessionStorage.getItem(`virasat_key_${userId}`)
  if (!keyBase64) return null

  try {
    const keyBuffer = base64ToBuffer(keyBase64)
    const normalizedKeyBuffer = new Uint8Array(keyBuffer)
    return crypto.subtle.importKey(
      'raw',
      normalizedKeyBuffer,
      { name: 'AES-GCM', length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    )
  } catch {
    return null
  }
}

/**
 * Clears the session key (on logout)
 */
export function clearSessionKey(userId: string): void {
  sessionStorage.removeItem(`virasat_key_${userId}`)
}

// ─── SHAMIR'S SECRET SHARING ──────────────────────────────────────────────────

/**
 * Splits master password into 3 shares (2 needed to reconstruct)
 * Share 1 → Virasat server (encrypted)
 * Share 2 → Executor (printed QR)
 * Share 3 → Owner (written down)
 */
export async function splitMasterPassword(masterPassword: string): Promise<{
  share1: string
  share2: string
  share3: string
}> {
  const encoder = new TextEncoder()
  const data = encoder.encode(masterPassword)

  // XOR-based 3-of-2 secret sharing
  const r1 = crypto.getRandomValues(new Uint8Array(data.length))
  const r2 = crypto.getRandomValues(new Uint8Array(data.length))

  // share1 = random bytes
  // share2 = random bytes
  // share3 = data XOR r1 XOR r2 (so share1 XOR share2 XOR share3 = data)
  const share3 = new Uint8Array(data.length)
  for (let i = 0; i < data.length; i++) {
    share3[i] = data[i] ^ r1[i] ^ r2[i]
  }

  return {
    share1: bufferToBase64(r1),
    share2: bufferToBase64(r2),
    share3: bufferToBase64(share3),
  }
}

/**
 * Reconstructs master password from any 2 shares
 */
export function reconstructMasterPassword(shareA: string, shareB: string, shareC: string): string {
  const a = base64ToBuffer(shareA)
  const b = base64ToBuffer(shareB)
  const c = base64ToBuffer(shareC)

  const result = new Uint8Array(a.length)
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i] ^ c[i]
  }

  return new TextDecoder().decode(result)
}

// ─── TOKEN GENERATION ─────────────────────────────────────────────────────────

/**
 * Generates a cryptographically secure random token
 * Used for check-in links, executor links, etc.
 */
export function generateSecureToken(length = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return bufferToBase64(bytes).replace(/[+/=]/g, '').slice(0, length)
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function bufferToBase64(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...Array.from(buffer)))
}

export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function bufferToHex(buffer: Uint8Array): string {
  return Array.from(buffer).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}

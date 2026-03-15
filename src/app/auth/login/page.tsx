'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { deriveKey, storeSessionKey, base64ToBuffer } from '@/lib/crypto'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [masterPassword, setMasterPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !masterPassword) {
      toast.error('All fields required')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const json = await res.json()
      if (!json.success) throw new Error(json.error)

      // Derive encryption key
      const saltBuffer = base64ToBuffer(json.data.user.encryptionSalt)
      const key = await deriveKey(masterPassword, saltBuffer)
      await storeSessionKey(key, json.data.user.id)

      toast.success('Welcome back.')
      router.push('/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen vault-bg flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="flex items-center gap-3 mb-16">
            <div className="w-7 h-7 border border-gold/60 rotate-45 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-gold" />
            </div>
            <span className="font-display text-lg text-gold tracking-[0.2em]">VIRASAT</span>
          </Link>

          <h1 className="font-display text-5xl text-paper font-light mb-2">Welcome back.</h1>
          <p className="text-gold/50 font-mono text-sm tracking-wide mb-12">Your vault is waiting.</p>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="virasat-input-dark"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Login password"
                className="virasat-input-dark"
              />
            </div>
            <div>
              <input
                type="password"
                value={masterPassword}
                onChange={e => setMasterPassword(e.target.value)}
                placeholder="Master password (encryption key)"
                className="virasat-input-dark"
              />
              <p className="font-mono text-gold/30 text-xs mt-2 tracking-wide">This is used to decrypt your vault locally.</p>
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full">
              {loading ? 'Opening vault...' : 'Open My Vault →'}
            </button>
          </form>

          <p className="text-center text-gold/40 text-sm mt-8 font-mono">
            No account?{' '}
            <Link href="/auth/signup" className="text-gold hover:text-gold-light transition-colors">Create vault</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

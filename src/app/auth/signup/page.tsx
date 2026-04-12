'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { deriveKey, storeSessionKey, generateSalt, base64ToBuffer, encrypt } from '@/lib/crypto'

const SignupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Invalid phone number'),
  dob: z.string().min(1, 'Date of birth required'),
  religion: z.enum(['hindu', 'muslim', 'christian', 'sikh', 'jain', 'other']),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  masterPassword: z.string().min(10, 'Master password must be at least 10 characters'),
  confirmMaster: z.string(),
  checkInFrequency: z.enum(['weekly', 'fortnightly', 'monthly']),
}).refine(d => d.masterPassword === d.confirmMaster, {
  message: 'Master passwords do not match',
  path: ['confirmMaster'],
})

type SignupForm = z.infer<typeof SignupSchema>

const STEPS = ['Consent', 'Personal', 'Preferences']
const KEYCHECK_VALUE_V2 = 'virasat-key-check:v2'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)

  const { register, handleSubmit, formState: { errors }, watch, trigger } = useForm<SignupForm>({
    resolver: zodResolver(SignupSchema),
    defaultValues: { religion: 'hindu', checkInFrequency: 'weekly' }
  })

  const nextStep = async () => {
    // Consent step requires checkbox to be checked
    if (step === 0 && !consentChecked) {
      toast.error('Please accept the consent to continue')
      return
    }
    const fields: Record<number, (keyof SignupForm)[]> = {
      0: [],
      1: ['name', 'email', 'phone', 'dob', 'religion'],
      2: ['password', 'masterPassword', 'confirmMaster'],
    }
    const valid = await trigger(fields[step])
    if (valid) setStep(s => s + 1)
  }

  const onSubmit = async (data: SignupForm) => {
    setLoading(true)
    try {
      const encryptionSalt = generateSalt()
      const key = await deriveKey(data.masterPassword, base64ToBuffer(encryptionSalt))
      const keyCheck = await encrypt(KEYCHECK_VALUE_V2, key)

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          dob: data.dob,
          religion: data.religion,
          password: data.password,
          checkInFrequency: data.checkInFrequency,
          encryptionSalt,
          keyCheck,
          consentGiven: consentChecked,
          consentAt: new Date().toISOString(),
        })
      })

      const json = await res.json()
      if (!json.success) throw new Error(json.error)

      await storeSessionKey(key, json.data.user.id)

      toast.success('Vault created. Welcome to Virasat.')
      router.push('/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen vault-bg flex">
      {/* Left — Visual */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 border border-gold/60 rotate-45 flex items-center justify-center">
            <div className="w-2 h-2 bg-gold" />
          </div>
          <span className="font-display text-xl text-gold tracking-[0.2em]">VIRASAT</span>
        </Link>

        <div className="relative z-10">
          <p className="font-display text-4xl text-paper font-light leading-tight mb-8">
            &quot;The greatest gift you can give your family is <em className="text-gold">clarity</em>.&quot;
          </p>
          <div className="space-y-4">
            {['Zero-knowledge encryption — we never see your data', 'Automatic delivery when you\'re gone', 'Built for Indian assets and families'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-gold rounded-full" />
                <p className="font-mono text-gold/60 text-sm tracking-wide">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="font-mono text-gold/20 text-xs tracking-wider relative z-10">VIRASAT · 2025 · INDIA</p>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 bg-paper">
        <div className="w-full max-w-md">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-12">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 text-xs font-mono flex items-center justify-center border transition-all ${i === step ? 'border-gold bg-gold text-vault' : i < step ? 'border-gold/60 text-gold/60' : 'border-ash/30 text-ash/30'}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-mono tracking-wider hidden sm:block ${i === step ? 'text-ink' : 'text-ash/40'}`}>{s.toUpperCase()}</span>
                {i < STEPS.length - 1 && <div className={`w-8 h-px ${i < step ? 'bg-gold/60' : 'bg-ash/20'}`} />}
              </div>
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 0 — Consent */}
              {step === 0 && (
                <div className="space-y-8">
                  <div>
                    <h1 className="font-display text-4xl mb-2">Your Data, Your Control</h1>
                    <p className="text-ash text-sm">Before we create your vault, please read and accept our terms.</p>
                  </div>
                  
                  <div className="bg-vault/50 border border-gold/20 p-6 space-y-4 max-h-80 overflow-y-auto">
                    <div>
                      <h3 className="font-display text-gold text-lg mb-2">1. Data Collection & Purpose</h3>
                      <p className="text-ash/70 text-sm leading-relaxed">
                        We collect your name, email, phone, date of birth, and religion solely to create your digital legacy vault. 
                        Your messages and vault contents are encrypted with your master password — we never see or store them.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-gold text-lg mb-2">2. Data Storage & Retention</h3>
                      <p className="text-ash/70 text-sm leading-relaxed">
                        Your data is stored securely as long as your account is active. You can delete your account and all data at any time 
                        from Settings. Upon deletion, all personal data and vault contents are permanently removed.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-gold text-lg mb-2">3. Encryption & Security</h3>
                      <p className="text-ash/70 text-sm leading-relaxed">
                        Your vault uses zero-knowledge encryption. Your master password never leaves your device. 
                        We cannot access your messages or recover your data if you forget your master password.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-gold text-lg mb-2">4. Not a Legal Will</h3>
                      <p className="text-ash/70 text-sm leading-relaxed">
                        <strong className="text-ember">Important:</strong> Virasat is NOT a legal will, legal document, or substitute for legal advice. 
                        It is a digital legacy tool for organizing and delivering messages to your loved ones. 
                        For legal inheritance matters, please consult a qualified legal professional.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-gold text-lg mb-2">5. Consent</h3>
                      <p className="text-ash/70 text-sm leading-relaxed">
                        By checking below, you consent to our collection and processing of your data as described above. 
                        You can withdraw consent and delete your data at any time.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="mt-1 w-5 h-5 accent-gold"
                    />
                    <span className="text-ash text-sm">
                      I have read and agree to the <Link href="/privacy" target="_blank" className="text-gold underline">Privacy Policy</Link> and 
                      understand that Virasat is NOT a legal will or legal service. I consent to the collection and processing of my data.
                    </span>
                  </label>

                  <div className="bg-ember/10 border border-ember/30 p-4">
                    <p className="font-mono text-ember/80 text-xs">
                      ⚠️ This is a digital legacy tool, not a legal will. For legal matters, consult a lawyer.
                    </p>
                  </div>

                  <button type="button" onClick={nextStep} className="btn-gold w-full" disabled={!consentChecked}>
                    Accept & Continue →
                  </button>
                </div>
              )}

              {/* Step 1 — Personal */}
              {step === 1 && (
                <div className="space-y-8">
                  <div>
                    <h1 className="font-display text-4xl mb-2">Tell us about you</h1>
                    <p className="text-ash text-sm">This helps us set up your vault correctly.</p>
                  </div>
                  <div className="bg-gold/5 border border-gold/20 p-4">
                    <p className="font-mono text-xs text-gold/80 leading-relaxed">
                      <strong className="text-gold">IMPORTANT:</strong> Your Master Password encrypts your vault. We never store it. If you forget it, your data cannot be recovered. Write it down and keep it safe.
                    </p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-ash/60 text-xs font-mono tracking-wider uppercase block mb-2">Login Password</label>
                      <input {...register('password')} type="password" placeholder="At least 8 characters" className="virasat-input" />
                      {errors.password && <p className="text-ember text-xs mt-1 font-mono">{errors.password.message}</p>}
                    </div>
                    <div>
                      <label className="text-ash/60 text-xs font-mono tracking-wider uppercase block mb-2">Master Password (Encryption Key)</label>
                      <input {...register('masterPassword')} type="password" placeholder="At least 10 characters" className="virasat-input" />
                      {errors.masterPassword && <p className="text-ember text-xs mt-1 font-mono">{errors.masterPassword.message}</p>}
                    </div>
                    <div>
                      <input {...register('confirmMaster')} type="password" placeholder="Confirm master password" className="virasat-input" />
                      {errors.confirmMaster && <p className="text-ember text-xs mt-1 font-mono">{errors.confirmMaster.message}</p>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(0)} className="btn-outline-gold flex-1 text-sm">← Back</button>
                    <button type="button" onClick={nextStep} className="btn-gold flex-1">Continue →</button>
                  </div>
                </div>
              )}

              {/* Step 2 — Preferences */}
              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <h1 className="font-display text-4xl mb-2">Check-in frequency</h1>
                    <p className="text-ash text-sm">How often should we ping you to confirm you&apos;re okay?</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { value: 'weekly', label: 'Every week', desc: 'Recommended — highest safety' },
                      { value: 'fortnightly', label: 'Every 2 weeks', desc: 'Good balance' },
                      { value: 'monthly', label: 'Every month', desc: 'Minimal check-ins' },
                    ].map(opt => (
                      <label key={opt.value} className="cursor-pointer block">
                        <input {...register('checkInFrequency')} type="radio" value={opt.value} className="peer sr-only" />
                        <div className="border border-ash/20 p-4 peer-checked:border-gold peer-checked:bg-gold/5 hover:border-gold/30 transition-all">
                          <div className="font-body font-medium text-sm">{opt.label}</div>
                          <div className="font-mono text-ash/60 text-xs mt-1">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="btn-outline-gold flex-1 text-sm">← Back</button>
                    <button type="submit" disabled={loading} className="btn-gold flex-1">
                      {loading ? 'Creating vault...' : 'Create My Vault'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </motion.div>

          <p className="text-center text-ash text-sm mt-8">
            Already have a vault?{' '}
            <Link href="/auth/login" className="text-gold hover:text-gold-dark transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

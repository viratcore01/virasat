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
              {step === 0 && (
                <div className="space-y-8">
                  <div>
                    <h1 className="font-display text-4xl mb-2">Your Data, Your Control</h1>
                    <p className="text-ash text-sm">Before we create your vault, please read and accept our terms.</p>
                  </div>

                  <div className="bg-vault/50 border border-gold/20 p-6 space-y-4 max-h-80 overflow-y-auto">
                    <div>
                      <h3 className="font-display text-gold text-lg mb-2">1. Legal Disclaimer</h3>
                      <p className="text-ash/70 text-sm leading-relaxed">
                        <strong className="text-ember">IMPORTANT:</strong> Virasat is a secure storage and delivery tool only. It does NOT replace a legal Will, Trust,
                        or court-mandated succession process. We do not provide legal advice. Users must consult a
                        qualified lawyer for estate planning and succession under applicable Indian laws (Hindu Succession
                        Act, Muslim Personal Law, Indian Succession Act, etc.). Virasat delivers your encrypted data
                        and instructions to designated beneficiaries after verified death. Actual ownership transfer of
                        assets follows standard legal procedures.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-gold text-lg mb-2">2. Religion Selection</h3>
                      <p className="text-ash/70 text-sm leading-relaxed">
                        We ask for your religion for informational purposes. This selection does NOT create any religious
                        or legal prescriptions. Virasat provides general guidance only. Always consult qualified legal counsel
                        for advice specific to your personal law.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-gold text-lg mb-2">3. Zero-Knowledge Encryption</h3>
                      <p className="text-ash/70 text-sm leading-relaxed">
                        Your vault uses zero-knowledge encryption. Your master password never leaves your device
                        and is never stored on our servers. We cannot access your messages or recover your data
                        if you forget your master password.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-gold text-lg mb-2">4. No Automatic Asset Transfer</h3>
                      <p className="text-ash/70 text-sm leading-relaxed">
                        Virasat delivers encrypted information to beneficiaries but does NOT facilitate automatic asset
                        transfer. Banks, property registrars, and other institutions require standard legal documentation
                        regardless of Virasat&apos;s records.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-gold text-lg mb-2">5. Shamir Secret Sharing</h3>
                      <p className="text-ash/70 text-sm leading-relaxed">
                        Your master password is split into 3 shares (2-of-3 threshold). Losing your master password
                        AND both shares results in permanent, irreversible data loss. We cannot recover your encrypted vault.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-gold text-lg mb-2">6. Data Collection & Privacy (DPDP Act)</h3>
                      <p className="text-ash/70 text-sm leading-relaxed">
                        We collect your name, email, phone, date of birth, and religion to create your vault.
                        Your messages and vault contents are encrypted with your master password — we never see or store them.
                        Your data is processed in accordance with the DPDP Act, 2023.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-gold text-lg mb-2">7. Consent for Data Processing</h3>
                      <p className="text-ash/70 text-sm leading-relaxed">
                        By checking below, you consent to our collection and processing of your personal data as described
                        above and in our Privacy Policy. You can withdraw consent and delete your data at any time.
                      </p>
                    </div>
                  </div>

                  <div className="bg-ember/10 border border-ember/30 p-4">
                    <p className="font-mono text-ember/80 text-xs">
                      ⚠️ This is a digital legacy tool, not a legal will. For legal matters, consult a lawyer.
                      Losing your master password AND shares = permanent data loss.
                    </p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="mt-1 w-5 h-5 accent-gold"
                    />
                    <span className="text-ash text-sm">
                      I have read and agree to the <Link href="/terms" target="_blank" className="text-gold underline">Terms of Service</Link>,{' '}
                      <Link href="/privacy" target="_blank" className="text-gold underline">Privacy Policy</Link>, and{' '}
                      <Link href="/disclaimer" target="_blank" className="text-gold underline">Legal Disclaimer</Link>.
                      I consent to the processing of my personal data as per the DPDP Act. I understand Virasat is NOT a legal will or legal service.
                    </span>
                  </label>

                  <div className="flex gap-3">
                    <button type="button" onClick={nextStep} className="btn-outline-gold flex-1 text-sm" disabled>← Back</button>
                    <button type="button" onClick={nextStep} className="btn-gold flex-1" disabled={!consentChecked}>Accept & Continue →</button>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8">
                  <div>
                    <h1 className="font-display text-4xl mb-2">Tell us about you</h1>
                    <p className="text-ash text-sm">This helps us set up your vault correctly.</p>
                  </div>
                  <div className="bg-gold/5 border border-gold/20 p-4">
                    <p className="font-mono text-xs text-gold/80 leading-relaxed">
                      <strong className="text-gold">IMPORTANT:</strong> Your Master Password encrypts your vault. We never store it.
                      If you forget it, your data cannot be recovered. Write it down and keep it safe.
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

              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <h1 className="font-display text-4xl mb-2">Personal Details</h1>
                    <p className="text-ash text-sm">We need a few details to create your account.</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-ash/60 text-xs font-mono tracking-wider uppercase block mb-2">Full Name</label>
                      <input {...register('name')} type="text" placeholder="Your full name" className="virasat-input" />
                      {errors.name && <p className="text-ember text-xs mt-1 font-mono">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="text-ash/60 text-xs font-mono tracking-wider uppercase block mb-2">Email</label>
                      <input {...register('email')} type="email" placeholder="you@example.com" className="virasat-input" />
                      {errors.email && <p className="text-ember text-xs mt-1 font-mono">{errors.email.message}</p>}
                    </div>
                    <div>
                      <label className="text-ash/60 text-xs font-mono tracking-wider uppercase block mb-2">Phone</label>
                      <input {...register('phone')} type="tel" placeholder="10-digit mobile number" className="virasat-input" />
                      {errors.phone && <p className="text-ember text-xs mt-1 font-mono">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <label className="text-ash/60 text-xs font-mono tracking-wider uppercase block mb-2">Date of Birth</label>
                      <input {...register('dob')} type="date" className="virasat-input" />
                      {errors.dob && <p className="text-ember text-xs mt-1 font-mono">{errors.dob.message}</p>}
                    </div>
                    <div>
                      <label className="text-ash/60 text-xs font-mono tracking-wider uppercase block mb-2">Religion (for guidance only)</label>
                      <select {...register('religion')} className="virasat-input">
                        <option value="hindu">Hindu</option>
                        <option value="muslim">Muslim</option>
                        <option value="christian">Christian</option>
                        <option value="sikh">Sikh</option>
                        <option value="jain">Jain</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-ash/60 text-xs font-mono tracking-wider uppercase block mb-2">Check-in Frequency</label>
                      <select {...register('checkInFrequency')} className="virasat-input">
                        <option value="weekly">Every week</option>
                        <option value="fortnightly">Every 2 weeks</option>
                        <option value="monthly">Every month</option>
                      </select>
                    </div>
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

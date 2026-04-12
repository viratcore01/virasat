'use client'
import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { clearSessionKey } from '@/lib/crypto'

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'executor' | 'beneficiaries' | 'checkin' | 'account'>('executor')

  // Executor
  const [executor, setExecutor] = useState<any>(null)
  const [execForm, setExecForm] = useState({ name: '', email: '', phone: '', relationship: '' })
  const [savingExec, setSavingExec] = useState(false)

  // Beneficiaries
  const [beneficiaries, setBeneficiaries] = useState<any[]>([])
  const [benForm, setBenForm] = useState({ name: '', email: '', phone: '', relationship: '' })
  const [savingBen, setSavingBen] = useState(false)

  // Check-in
  const [user, setUser] = useState<any>(null)
  const [frequency, setFrequency] = useState('weekly')
  const [savingFreq, setSavingFreq] = useState(false)

  const fetchAll = useCallback(async () => {
    try {
      const [userRes, execRes, benRes] = await Promise.all([fetch('/api/auth/me'), fetch('/api/executor'), fetch('/api/beneficiaries')])
      const [userData, execData, benData] = await Promise.all([userRes.json(), execRes.json(), benRes.json()])
      if (!userData.success) { router.push('/auth/login'); return }
      setUser(userData.data)
      setFrequency(userData.data.checkInFrequency || 'weekly')
      if (execData.data) {
        setExecutor(execData.data)
        setExecForm({ name: execData.data.name, email: execData.data.email, phone: execData.data.phone, relationship: execData.data.relationship })
      }
      setBeneficiaries(benData.data || [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }, [router])

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  const saveExecutor = async () => {
    if (!execForm.name || !execForm.email || !execForm.phone || !execForm.relationship) { toast.error('All fields required'); return }
    setSavingExec(true)
    try {
      const res = await fetch('/api/executor', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(execForm) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success(json.message)
      void fetchAll()
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed') }
    finally { setSavingExec(false) }
  }

  const addBeneficiary = async () => {
    if (!benForm.name || !benForm.email || !benForm.phone || !benForm.relationship) { toast.error('All fields required'); return }
    setSavingBen(true)
    try {
      const res = await fetch('/api/beneficiaries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(benForm) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success('Beneficiary added')
      setBenForm({ name: '', email: '', phone: '', relationship: '' })
      void fetchAll()
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed') }
    finally { setSavingBen(false) }
  }

  const deleteBeneficiary = async (id: string) => {
    if (!confirm('Remove this beneficiary?')) return
    try {
      const res = await fetch(`/api/beneficiaries/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success('Removed')
      void fetchAll()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove')
    }
  }

  const saveFrequency = async () => {
    setSavingFreq(true)
    try {
      const res = await fetch('/api/auth/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checkInFrequency: frequency }) })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success('Check-in frequency updated')
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed') }
    finally { setSavingFreq(false) }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    if (user?._id) clearSessionKey(user._id)
    router.push('/')
  }

  if (loading) return <div className="min-h-screen vault-bg flex items-center justify-center"><div className="w-12 h-12 border border-gold/40 rotate-45 animate-spin" /></div>

  return (
    <div className="flex min-h-screen paper-texture">
      {/* Sidebar */}
      <div className="w-64 vault-bg flex flex-col py-8 fixed top-0 bottom-0 left-0 z-40">
        <div className="flex items-center gap-3 px-6 mb-12">
          <div className="w-7 h-7 border border-gold/60 rotate-45 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-gold" /></div>
          <span className="font-display text-lg text-gold tracking-[0.2em]">VIRASAT</span>
        </div>
        <nav className="flex-1">
          {[{ href: '/dashboard', icon: '◆', label: 'Dashboard' }, { href: '/vault', icon: '🔐', label: 'Vault' }, { href: '/messages', icon: '✉', label: 'Messages' }, { href: '/will', icon: '📜', label: 'Will Generator' }, { href: '/settings', icon: '⚙', label: 'Settings', active: true }].map(item => (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-6 py-3 text-sm tracking-wide border-l-2 transition-all ${item.active ? 'border-gold bg-gold/5 text-gold' : 'border-transparent text-gold/40 hover:text-gold hover:bg-gold/5'}`}>
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="ml-64 flex-1 p-10">
        <p className="font-mono text-ash/50 text-xs tracking-[0.3em] uppercase mb-2">Settings</p>
        <h1 className="font-display text-4xl mb-8">Configure Your Vault</h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-10 border-b border-gold/15">
          {[{ id: 'executor', label: 'Executor' }, { id: 'beneficiaries', label: 'Beneficiaries' }, { id: 'checkin', label: 'Check-ins' }, { id: 'account', label: 'Account' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`px-6 py-3 font-mono text-xs tracking-wider uppercase border-b-2 transition-all -mb-px ${tab === t.id ? 'border-gold text-gold' : 'border-transparent text-ash/40 hover:text-gold/60'}`}
            >{t.label}</button>
          ))}
        </div>

        {/* Executor tab */}
        {tab === 'executor' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg">
            <h2 className="font-display text-2xl mb-3">Your Trusted Executor</h2>
            <p className="text-ash text-sm leading-relaxed mb-8">This person will receive the vault trigger if you miss 3 check-ins. Choose your most trusted person — a spouse, sibling, or close friend.</p>

            {executor && (
              <div className="vault-card p-5 mb-6 flex items-center gap-4">
                <div className="w-10 h-10 bg-gold/10 border border-gold/30 flex items-center justify-center text-lg">👤</div>
                <div>
                  <p className="text-gold font-medium">{executor.name}</p>
                  <p className="font-mono text-gold/40 text-xs">{executor.email} · {executor.relationship}</p>
                </div>
                <span className={`ml-auto font-mono text-xs px-2 py-1 border ${executor.status === 'pending' ? 'border-gold/30 text-gold/50' : 'border-sage/50 text-sage'}`}>
                  {executor.status.toUpperCase()}
                </span>
              </div>
            )}

            <div className="space-y-5">
              {[{ key: 'name', label: 'Full Name', placeholder: 'Suresh Sharma' }, { key: 'email', label: 'Email', placeholder: 'suresh@gmail.com' }, { key: 'phone', label: 'Phone (notifications)', placeholder: '9876543210' }, { key: 'relationship', label: 'Relationship', placeholder: 'Brother / Friend / Spouse' }].map(f => (
                <div key={f.key}>
                  <label className="font-mono text-ash/50 text-xs tracking-[0.15em] uppercase block mb-2">{f.label}</label>
                  <input value={(execForm as any)[f.key]} onChange={e => setExecForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} className="virasat-input" />
                </div>
              ))}
            </div>
            <button onClick={saveExecutor} disabled={savingExec} className="btn-gold mt-8 w-full">
              {savingExec ? 'Saving...' : executor ? 'Update Executor' : 'Save Executor'}
            </button>
            <p className="font-mono text-ash/40 text-xs mt-4 text-center">They will receive an email when saved, explaining their role.</p>
          </motion.div>
        )}

        {/* Beneficiaries tab */}
        {tab === 'beneficiaries' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg">
            <h2 className="font-display text-2xl mb-3">Beneficiaries</h2>
            <p className="text-ash text-sm leading-relaxed mb-8">These are the people who will receive your vault items and messages. Add everyone you want to assign assets to.</p>

            {/* Existing */}
            {beneficiaries.length > 0 && (
              <div className="space-y-2 mb-8">
                {beneficiaries.map(b => (
                  <div key={b._id} className="vault-card p-4 flex items-center justify-between">
                    <div>
                      <p className="text-gold font-medium text-sm">{b.name}</p>
                      <p className="font-mono text-gold/35 text-xs">{b.email} · {b.relationship}</p>
                    </div>
                    <button onClick={() => deleteBeneficiary(b._id)} className="text-ember/40 hover:text-ember text-xs font-mono transition-colors">REMOVE</button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new */}
            <div className="border border-gold/15 p-6">
              <p className="font-mono text-gold/40 text-xs tracking-[0.2em] uppercase mb-5">Add Beneficiary</p>
              <div className="space-y-5">
                {[{ key: 'name', label: 'Full Name', placeholder: 'Priya Sharma' }, { key: 'email', label: 'Email', placeholder: 'priya@gmail.com' }, { key: 'phone', label: 'Phone', placeholder: '9876543210' }, { key: 'relationship', label: 'Relationship', placeholder: 'Wife / Son / Daughter' }].map(f => (
                  <div key={f.key}>
                    <label className="font-mono text-ash/50 text-xs tracking-[0.15em] uppercase block mb-2">{f.label}</label>
                    <input value={(benForm as any)[f.key]} onChange={e => setBenForm(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={f.placeholder} className="virasat-input" />
                  </div>
                ))}
              </div>
              <button onClick={addBeneficiary} disabled={savingBen} className="btn-gold mt-6 w-full">
                {savingBen ? 'Adding...' : '+ Add Beneficiary'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Check-in tab */}
        {tab === 'checkin' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg">
            <h2 className="font-display text-2xl mb-3">Check-in Frequency</h2>
            <p className="text-ash text-sm leading-relaxed mb-8">How often should we ping you to confirm you&apos;re okay? If you miss 3 consecutive check-ins, your executor will be notified.</p>

            <div className="space-y-3 mb-8">
              {[{ v: 'weekly', l: 'Every week', d: 'Recommended — highest safety. Miss 3 = 3 weeks before trigger.' }, { v: 'fortnightly', l: 'Every 2 weeks', d: 'Good balance. Miss 3 = 6 weeks before trigger.' }, { v: 'monthly', l: 'Every month', d: 'Minimal. Miss 3 = 3 months before trigger.' }].map(opt => (
                <label key={opt.v} className="cursor-pointer block">
                  <input type="radio" name="freq" value={opt.v} checked={frequency === opt.v} onChange={() => setFrequency(opt.v)} className="sr-only peer" />
                  <div className="border border-ash/20 p-4 peer-checked:border-gold peer-checked:bg-gold/5 hover:border-gold/30 transition-all">
                    <div className="font-medium text-sm mb-1">{opt.l}</div>
                    <div className="font-mono text-ash/50 text-xs">{opt.d}</div>
                  </div>
                </label>
              ))}
            </div>

            <button onClick={saveFrequency} disabled={savingFreq} className="btn-gold w-full">
              {savingFreq ? 'Saving...' : 'Save Frequency'}
            </button>

            {/* Snooze Section */}
            <div className="mt-10 pt-8 border-t border-gold/15">
              <h2 className="font-display text-2xl mb-3">Temporarily Snooze Check-ins</h2>
              <p className="text-ash text-sm leading-relaxed mb-6">Going on vacation, hospitalized, or unavailable? Pause check-ins for a set period. You&apos;ll still receive reminders but won&apos;t trigger your executor.</p>
              
              {user?.snoozeUntil && new Date(user.snoozeUntil) > new Date() ? (
                <div className="border border-gold/30 bg-gold/5 p-5 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-mono text-gold text-xs tracking-wider uppercase mb-1">Currently Snoozed</p>
                      <p className="text-gold/70 text-sm">Until {new Date(user.snoozeUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <span className="text-2xl">⏸️</span>
                  </div>
                  <button onClick={async () => {
                    try {
                      const res = await fetch('/api/checkin/snooze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ days: 0 }) })
                      const json = await res.json()
                      if (!json.success) throw new Error(json.error)
                      toast.success('Snooze cancelled - check-ins resumed')
                      void fetchAll()
                    } catch (err) { toast.error('Failed to cancel snooze') }
                  }} className="w-full py-2 border border-gold/30 text-gold/70 hover:text-gold hover:border-gold font-mono text-xs tracking-wider transition-all">
                    RESUME CHECK-INS NOW
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {[{ d: 7, l: '1 Week' }, { d: 14, l: '2 Weeks' }, { d: 30, l: '1 Month' }, { d: 60, l: '2 Months' }, { d: 90, l: '3 Months' }].map(opt => (
                    <button key={opt.d} onClick={async () => {
                      try {
                        const res = await fetch('/api/checkin/snooze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ days: opt.d }) })
                        const json = await res.json()
                        if (!json.success) throw new Error(json.error)
                        toast.success(`Check-ins snoozed for ${opt.d} days`)
                        void fetchAll()
                      } catch (err) { toast.error('Failed to snooze') }
                    }} className="py-3 border border-gold/20 text-gold/70 hover:text-gold hover:border-gold font-mono text-xs tracking-wider transition-all">
                      {opt.l}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Account tab */}
        {tab === 'account' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg">
            <h2 className="font-display text-2xl mb-3">Account</h2>
            {user && (
              <div className="vault-card p-6 mb-6">
                <div className="space-y-3">
                  {[{ l: 'Name', v: user.name }, { l: 'Email', v: user.email }, { l: 'Phone', v: user.phone }, { l: 'Religion', v: user.religion }, { l: 'Date of Birth', v: user.dob }, { l: 'Status', v: user.status }, { l: 'Member since', v: new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) }].map(f => (
                    <div key={f.l} className="flex justify-between border-b border-gold/10 pb-2">
                      <span className="font-mono text-gold/35 text-xs tracking-wider uppercase">{f.l}</span>
                      <span className="text-gold/70 text-sm capitalize">{f.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="border border-ember/20 p-5">
              <p className="font-mono text-ember/60 text-xs tracking-wider uppercase mb-3">Danger Zone</p>
              <p className="text-ash text-sm mb-4">Remember: your master password is never stored. If you forget it, your encrypted data cannot be recovered.</p>
              <button onClick={handleLogout} className="text-ember/60 hover:text-ember font-mono text-xs tracking-wider transition-colors border border-ember/20 px-4 py-2">
                SIGN OUT
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

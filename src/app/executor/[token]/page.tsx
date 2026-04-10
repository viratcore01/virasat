'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ExecutorPortalPage() {
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [info, setInfo] = useState<{ executor: { name: string; status: string }; owner: { name: string; status: string } } | null>(null)
  const [view, setView] = useState<'choice' | 'verify' | 'cancel' | 'done'>('choice')
  const [deathDate, setDeathDate] = useState('')
  const [certUrl, setCertUrl] = useState('')
  const [result, setResult] = useState<{ unlockDate?: string } | null>(null)

  useEffect(() => {
    fetch(`/api/executor/${token}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setInfo(json.data)
        else toast.error('Invalid executor link')
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleAction = async (action: 'verify' | 'cancel') => {
    setSubmitting(true)
    try {
      const body: Record<string, string> = { action }
      if (action === 'verify') {
        if (!certUrl) { toast.error('Please provide death certificate'); setSubmitting(false); return }
        body.deathCertificateUrl = certUrl
        body.dateOfDeath = deathDate
      } else {
        body.cancellationReason = 'False alarm — owner is alive'
      }

      const res = await fetch(`/api/executor/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setResult(json.data)
      setView('done')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen vault-bg flex items-center justify-center">
      <div className="w-12 h-12 border border-gold/40 rotate-45 animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen vault-bg flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-16">
          <div className="w-8 h-8 border border-gold/60 rotate-45 flex items-center justify-center">
            <div className="w-2 h-2 bg-gold" />
          </div>
          <span className="font-display text-xl text-gold tracking-[0.2em]">VIRASAT</span>
        </div>

        {info && (
          <div className="vault-card p-6 mb-8">
            <p className="font-mono text-gold/40 text-xs tracking-wider uppercase mb-2">You are the Executor for</p>
            <p className="font-display text-3xl text-gold">{info.owner.name}</p>
            <p className="font-mono text-gold/50 text-sm mt-1">Executor: {info.executor.name}</p>
          </div>
        )}

        {view === 'choice' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl text-paper mb-3">Vault has been triggered.</h1>
            <p className="text-gold/50 font-body mb-10 leading-relaxed">
              {info?.owner.name} has not responded to 3 consecutive Virasat check-ins. Please choose how to proceed.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => setView('cancel')}
                className="w-full border border-gold/40 p-5 text-left hover:border-gold hover:bg-gold/5 transition-all"
              >
                <p className="font-body text-gold font-medium mb-1">This is a false alarm</p>
                <p className="font-mono text-gold/50 text-xs">{info?.owner.name} is alive. Cancel the vault trigger.</p>
              </button>
              <button
                onClick={() => setView('verify')}
                className="w-full border border-ember/30 p-5 text-left hover:border-ember/60 hover:bg-ember/5 transition-all"
              >
                <p className="font-body text-ember font-medium mb-1">Proceed with verification</p>
                <p className="font-mono text-ember/50 text-xs">{info?.owner.name} has passed away. Upload death certificate.</p>
              </button>
            </div>
          </motion.div>
        )}

        {view === 'cancel' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="font-display text-3xl text-paper mb-4">Confirm cancellation</h2>
            <p className="text-gold/50 text-sm mb-8">This will reset the vault trigger and restore everything to normal. Please ask {info?.owner.name} to log in to Virasat to confirm their check-in.</p>
            <div className="flex gap-3">
              <button onClick={() => setView('choice')} className="btn-outline-gold flex-1">← Back</button>
              <button onClick={() => handleAction('cancel')} disabled={submitting} className="btn-gold flex-1">
                {submitting ? 'Processing...' : 'Cancel Trigger'}
              </button>
            </div>
          </motion.div>
        )}

        {view === 'verify' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="font-display text-3xl text-paper mb-4">Upload death certificate</h2>
            <div className="bg-ember/10 border border-ember/30 p-4 mb-8">
              <p className="font-mono text-ember/80 text-xs">After verification, a 30-day waiting period begins as a fraud prevention measure. The vault will unlock on the date shown.</p>
            </div>
            <div className="space-y-6 mb-8">
              <div>
                <label className="text-gold/50 text-xs font-mono tracking-wider uppercase block mb-2">Date of Death</label>
                <input type="date" value={deathDate} onChange={e => setDeathDate(e.target.value)} className="virasat-input-dark" />
              </div>
              <div>
                <label className="text-gold/50 text-xs font-mono tracking-wider uppercase block mb-2">Death Certificate URL</label>
                <input
                  type="url"
                  placeholder="Upload to Drive/Dropbox and paste link"
                  value={certUrl}
                  onChange={e => setCertUrl(e.target.value)}
                  className="virasat-input-dark"
                />
                <p className="font-mono text-gold/30 text-xs mt-1">Upload the certificate to Google Drive and paste the shareable link here.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setView('choice')} className="btn-outline-gold flex-1">← Back</button>
              <button onClick={() => handleAction('verify')} disabled={submitting} className="border border-ember/60 text-ember px-8 py-3.5 hover:bg-ember/10 transition-all flex-1">
                {submitting ? 'Verifying...' : 'Submit Verification'}
              </button>
            </div>
          </motion.div>
        )}

        {view === 'done' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-20 h-20 border-2 border-gold flex items-center justify-center mx-auto mb-8">
              <span className="text-gold text-3xl">✓</span>
            </div>
            <h2 className="font-display text-4xl text-paper mb-4">Done.</h2>
            {result?.unlockDate ? (
              <>
                <p className="text-gold/70 font-body mb-2">Verification complete. A 30-day waiting period has begun.</p>
                <p className="font-mono text-gold text-sm mb-2">Vault unlocks: {new Date(result.unlockDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-mono text-gold/30 text-xs">All beneficiaries will be notified on that date.</p>
              </>
            ) : (
              <>
                <p className="text-gold/70 font-body">Vault trigger has been cancelled.</p>
                <p className="font-mono text-gold/30 text-xs mt-2">Everything is back to normal.</p>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

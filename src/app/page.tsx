'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

const VAULT_ITEMS = [
  { icon: '🏦', label: 'Bank Accounts' },
  { icon: '📈', label: 'Fixed Deposits' },
  { icon: '₿', label: 'Crypto Wallets' },
  { icon: '🪙', label: 'Gold & Jewellery' },
  { icon: '🏠', label: 'Property Papers' },
  { icon: '📋', label: 'Insurance Policies' },
  { icon: '🔐', label: 'Passwords' },
  { icon: '🗝️', label: 'Bank Lockers' },
]

const STATS = [
  { number: '1.5M+', label: 'Inheritance cases\npending in Indian courts' },
  { number: '95%', label: 'Indians with\nzero will or plan' },
  { number: '₹3.7M', label: 'BTC lost forever\ndue to no inheritance plan' },
  { number: '0', label: 'Serious death tech\nstartups in India' },
]

export default function HomePage() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, -100])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = e.clientX + 'px'
        cursorRef.current.style.top = e.clientY + 'px'
      }
      setTimeout(() => {
        if (ringRef.current) {
          ringRef.current.style.left = e.clientX + 'px'
          ringRef.current.style.top = e.clientY + 'px'
        }
      }, 80)
    }
    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [])

  return (
    <>
      <div ref={cursorRef} className="cursor" />
      <div ref={ringRef} className="cursor-ring" />

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-6 mix-blend-normal">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border border-gold/60 rotate-45 flex items-center justify-center">
            <div className="w-2 h-2 bg-gold" />
          </div>
          <span className="font-display text-xl text-gold tracking-[0.2em]">VIRASAT</span>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/auth/login" className="font-body text-sm text-ash hover:text-ink transition-colors tracking-wide">
            Sign In
          </Link>
          <Link href="/auth/signup" className="btn-gold text-sm">
            Start Free
          </Link>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen vault-bg flex items-center overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)' }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 max-w-7xl mx-auto px-10 pt-32 pb-20 xl:pr-[24rem]"
        >
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <p className="font-mono text-gold/60 text-xs tracking-[0.4em] uppercase mb-8">
              Digital Legacy Vault — India
            </p>

            <h1 className="font-display text-[clamp(3rem,7vw,6.5rem)] text-paper leading-[0.95] font-light mb-8">
              Everything you built,<br />
              <em className="text-gold italic font-light">safely passed on.</em>
            </h1>

            <p className="font-body text-vault-light/70 text-xl max-w-xl leading-relaxed mb-12 text-paper/60">
              Your bank accounts, crypto, gold, property papers — stored in an encrypted vault that automatically reaches your family when you&apos;re gone.
            </p>

            <div className="flex items-center gap-6">
              <Link href="/auth/signup" className="btn-gold text-base px-10 py-4 animate-pulse-gold">
                Protect Your Family
              </Link>
              <Link href="#how" className="font-body text-gold/70 hover:text-gold text-sm tracking-wide transition-colors flex items-center gap-2">
                See how it works
                <span className="text-lg">↓</span>
              </Link>
            </div>
          </motion.div>

          {/* Vault items floating */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="absolute right-10 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-3"
          >
            {VAULT_ITEMS.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.08, duration: 0.5 }}
                className="flex items-center gap-3 vault-card px-4 py-2.5 rounded-none"
                style={{ animationDelay: `${i * 0.5}s` }}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-mono text-gold/70 text-xs tracking-wider">{item.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-px h-16 bg-gradient-to-b from-gold/0 via-gold/40 to-gold/0 animate-float" />
        </div>
      </section>

      {/* ─── STORY ─── */}
      <section className="py-32 px-10 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="ornament-divider"><span>◆</span></div>
          <p className="font-display text-[clamp(1.5rem,3vw,2.5rem)] text-ink/80 leading-relaxed font-light text-center">
            &quot;My father passed away last year. We spent <em className="text-ember">8 months and ₹2 lakh</em> trying to find his FDs, access his crypto, and open his bank locker. His gold is still somewhere at home. Nobody knew anything.&quot;
          </p>
          <p className="text-center text-ash font-body text-sm mt-6 tracking-wide">— A story shared by millions of Indian families</p>
          <div className="ornament-divider"><span>◆</span></div>
        </motion.div>
      </section>

      {/* ─── STATS ─── */}
      <section className="vault-bg py-24 px-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-gold/10">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-vault p-10 text-center"
            >
              <div className="font-display text-5xl text-gold font-light mb-3">{stat.number}</div>
              <div className="font-mono text-gold/50 text-xs tracking-wider uppercase leading-relaxed whitespace-pre-line">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="py-32 px-10 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <p className="font-mono text-gold/60 text-xs tracking-[0.4em] uppercase mb-4">The System</p>
          <h2 className="font-display text-5xl font-light">How Virasat Works</h2>
        </motion.div>

        <div className="space-y-2">
          {[
            { num: '01', title: 'Fill Your Vault', desc: 'Add your bank accounts, FDs, crypto wallets, gold, insurance, property — everything encrypted in your browser. We never see your data.' },
            { num: '02', title: 'Assign to Family', desc: 'Tell us who gets what. Your FD goes to your wife. Your crypto to your son. Your letters to your daughter on her 18th birthday.' },
            { num: '03', title: 'Weekly Check-in', desc: 'Every week, one WhatsApp. One tap. That\'s it. Miss 3 times and your Executor gets notified.' },
            { num: '04', title: 'Executor Verifies', desc: 'Your trusted Executor uploads the death certificate. A 30-day waiting period begins to prevent fraud.' },
            { num: '05', title: 'Family Receives', desc: 'Everyone gets exactly what you intended. Your letters are delivered. Your assets are documented. Your family is okay.' },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-8 p-8 hover:bg-gold/5 transition-colors group border border-transparent hover:border-gold/20"
            >
              <div className="font-mono text-gold/30 text-4xl font-light group-hover:text-gold/60 transition-colors w-16 shrink-0 pt-1">{step.num}</div>
              <div>
                <h3 className="font-display text-2xl mb-2">{step.title}</h3>
                <p className="font-body text-ash leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="vault-bg py-32 px-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at center, #C9A84C 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="font-mono text-gold/60 text-xs tracking-[0.4em] uppercase mb-6">Start Today</p>
            <h2 className="font-display text-5xl text-paper font-light mb-6">
              Free to start.<br />
              <em className="text-gold">Takes 10 minutes.</em>
            </h2>
            <p className="font-body text-paper/50 mb-12 text-lg">The best time to do this was yesterday. The second best time is now.</p>
            <Link href="/auth/signup" className="btn-gold text-base px-12 py-4 inline-block">
              Create Your Vault →
            </Link>
            <p className="font-mono text-paper/30 text-xs tracking-wider mt-6">FREE FOREVER · ZERO-KNOWLEDGE ENCRYPTION · MADE IN INDIA</p>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="vault-bg border-t border-gold/10 px-10 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border border-gold/40 rotate-45 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-gold/70" />
          </div>
          <span className="font-display text-gold/70 tracking-[0.2em]">VIRASAT</span>
        </div>
        <p className="font-mono text-gold/30 text-xs tracking-wider">
          A LOVE LETTER TO YOUR FAMILY&apos;S FUTURE
        </p>
        <p className="font-mono text-gold/30 text-xs">© 2025 Virasat</p>
      </footer>
    </>
  )
}

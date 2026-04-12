'use client'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen paper-texture p-8 lg:p-16">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-12">
          <Link href="/">
            <div className="w-7 h-7 border border-gold/60 rotate-45 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-gold" />
            </div>
          </Link>
          <span className="font-display text-lg text-gold tracking-[0.2em]">VIRASAT</span>
        </div>

        <h1 className="font-display text-4xl mb-8">Privacy Policy</h1>
        <p className="text-ash/60 font-mono text-sm mb-12">Last updated: April 2026</p>

        <div className="space-y-8 text-ash/80 leading-relaxed">
          <section>
            <h2 className="font-display text-xl text-gold mb-4">1. Introduction</h2>
            <p>
              At Virasat, we believe your digital legacy is personal and private. This Privacy Policy explains how we collect, 
              use, and protect your information. By using Virasat, you agree to the practices described here.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-gold mb-4">2. Data We Collect</h2>
            <ul className="space-y-2 list-disc pl-6">
              <li><strong>Account Information:</strong> Name, email, phone, date of birth, religion</li>
              <li><strong>Encryption Data:</strong> Salt and key check value (never your master password)</li>
              <li><strong>Vault Contents:</strong> Messages, beneficiary details, vault items (encrypted)</li>
              <li><strong>Check-in Data:</strong> Last check-in timestamp, missed count</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-gold mb-4">3. How We Use Your Data</h2>
            <ul className="space-y-2 list-disc pl-6">
              <li>To create and manage your account</li>
              <li>To send check-in reminders (email/WhatsApp)</li>
              <li>To deliver your messages to beneficiaries when triggered</li>
              <li>To communicate important updates about your account</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-gold mb-4">4. Encryption & Security</h2>
            <p>
              Your vault contents are encrypted using your master password with AES-256 encryption. 
              Your master password is never stored on our servers — we literally cannot see your data.
            </p>
            <p className="mt-4">
              If you forget your master password, your encrypted data cannot be recovered. 
              This is by design — it ensures maximum security.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-gold mb-4">5. Data Sharing</h2>
            <p>
              We do NOT sell, rent, or share your personal data with third parties, except:
            </p>
            <ul className="space-y-2 list-disc pl-6 mt-2">
              <li><strong>Service Providers:</strong> Email delivery (Resend), hosting (Vercel)</li>
              <li><strong>Legal Requirements:</strong> If required by law or court order</li>
              <li><strong>Trigger Event:</strong> When your executor portal is activated after missed check-ins</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-gold mb-4">6. Data Retention</h2>
            <p>
              Your data is retained as long as your account is active. You can delete your account and all data 
              at any time from Settings. Upon deletion, all personal data and vault contents are permanently removed.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl text-gold mb-4">7. Your Rights</h2>
            <ul className="space-y-2 list-disc pl-6">
              <li><strong>Access:</strong> Download your data at any time</li>
              <li><strong>Delete:</strong> Delete your account and all data</li>
              <li><strong>Withdraw Consent:</strong> Request data deletion</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl text-gold mb-4">8. Not a Legal Service</h2>
            <div className="bg-ember/10 border border-ember/30 p-4">
              <p className="text-ember/90">
                <strong>Important:</strong> Virasat is NOT a legal will, legal document, or legal service. 
                It is a digital legacy tool for organizing and delivering messages to your loved ones. 
                For legal inheritance matters, please consult a qualified legal professional.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl text-gold mb-4">9. Contact Us</h2>
            <p>
              If you have questions about this policy or want to exercise your rights, contact us at: 
              <strong className="text-gold"> support@virasat.in</strong>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-gold/20 text-center">
          <Link href="/auth/signup" className="text-gold hover:text-gold-dark transition-colors">
            ← Back to Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
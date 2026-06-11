'use client'

import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-amber-500 hover:text-amber-400 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-400 text-lg">Last updated: June 2026</p>
        </div>

        {/* Critical Disclaimer Banner */}
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-red-400 mb-4">⚠️ Critical Disclaimer</h2>
          <p className="text-red-100 leading-relaxed mb-4">
            <strong>Virasat is a secure digital storage and delivery tool ONLY.</strong> It does NOT:
          </p>
          <ul className="list-disc list-inside text-red-100 space-y-2 mb-4">
            <li>Replace a legal Will, Trust, or court-mandated succession process</li>
            <li>Provide legal advice on estate planning or succession laws</li>
            <li>Automatically transfer ownership of assets (bank accounts, property, crypto, etc.)</li>
            <li>Serve as a substitute for consulting a qualified lawyer</li>
            <li>Guarantee data delivery in all circumstances</li>
          </ul>
          <p className="text-red-100 font-semibold">
            <strong>You must consult a qualified lawyer</strong> for estate planning and succession under applicable Indian laws
            (Hindu Succession Act, Muslim Personal Law, Indian Succession Act, Waqf Act, etc.).
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8 text-gray-300 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Virasat ("Service"), you agree to be bound by these Terms of Service ("Terms").
              If you do not agree to these Terms, you may not use the Service. Virasat reserves the right to modify
              these Terms at any time. Your continued use of the Service following the posting of modified Terms will
              constitute your acceptance of the modified Terms.
            </p>
          </section>

          {/* Sections 2-14 */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">2. Service Description</h2>
            <p>Virasat is a digital legacy vault enabling secure storage of encrypted personal information with designated beneficiary delivery after verified death. The Service ONLY stores and delivers information and does NOT transfer asset ownership or handle legal succession.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">3. No Legal Advice</h2>
            <p>Virasat does NOT provide legal advice. Consult a qualified lawyer before creating Wills, designating beneficiaries, or making succession decisions.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">4. Religion Selection & Succession Law</h2>
            <p>Religion selection provides general guidance on applicable Indian succession laws (Hindu Succession Act, Muslim Personal Law, Indian Succession Act, etc.). This is informational only and does NOT ensure legal compliance. Consult a lawyer.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">5. Encryption & Zero-Knowledge Security</h2>
            <p>Your vault data uses AES-256-GCM encryption with Shamir Secret Sharing. Server never sees plaintext. Loss of master password and recovery shares = permanent, irreversible data loss.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">6. Data Delivery After Death</h2>
            <p>After executor verification and 30-day wait, encrypted data is delivered to beneficiaries via secure links. Beneficiaries must follow standard legal/financial procedures to actually claim assets.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">7. Limitation of Liability</h2>
            <p>Virasat is not liable for data loss, delivery failures, succession conflicts, breaches, or indirect damages, to the maximum extent permitted by law.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">8. Disclaimers & Warranties</h2>
            <p>Service provided "AS-IS" without warranty of merchantability, fitness, accuracy, security, or uninterrupted access.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">9. Prohibited Uses</h2>
            <p>No illegal content, violations of law, harassment, malware, interference with service, circumvention of security, impersonation, or fraud.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">10. Termination</h2>
            <p>Virasat may terminate accounts for Terms violations, illegal activity, inaccurate contact info, missed check-ins (60+ days), or user request.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">11. Indemnification</h2>
            <p>You indemnify Virasat from claims arising from your use, Terms violations, legal violations, IP infringement, or family disputes.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">12. Dispute Resolution</h2>
            <p>Governed by Indian law. Disputes subject to Indian court jurisdiction and arbitration as permitted by law.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">13. Contact</h2>
            <p>Legal questions? Contact legal@virasat.life</p>
          </section>

          {/* Final Acknowledgment */}
          <div className="bg-amber-900/30 border border-amber-500/50 rounded-lg p-6 mt-12">
            <h3 className="text-2xl font-bold text-amber-400 mb-3">📋 Before You Use Virasat</h3>
            <p className="text-amber-100 leading-relaxed">
              By using Virasat, you acknowledge that:
            </p>
            <ul className="list-disc list-inside text-amber-100 space-y-2 mt-3">
              <li>Virasat is a storage tool only, NOT a legal Will</li>
              <li>You will consult a qualified lawyer for your estate plan</li>
              <li>You understand the risks of losing your master password and recovery shares</li>
              <li>You accept all limitations and disclaimers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

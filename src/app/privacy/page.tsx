'use client'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-amber-500 hover:text-amber-400 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400 text-lg">Last updated: June 2026 | DPDP Act 2023 Compliant (Foundation)</p>
        </div>

        {/* DPDP Compliance Notice */}
        <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">🛡️ Data Protection Notice</h2>
          <p className="text-blue-100 leading-relaxed">
            Virasat is committed to protecting your personal data in compliance with the
            <strong> Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and applicable Indian data protection laws.
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-3xl font-bold text-white mb-4">1. Information We Collect</h2>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-4">
              <li><strong>Account:</strong> Name, email, phone, DOB, religion, password hash, encryption salt</li>
              <li><strong>Vault:</strong> All encrypted financial/asset information, messages, attachments</li>
              <li><strong>Beneficiaries/Executors:</strong> Names, emails, phones, death certificates</li>
              <li><strong>Usage:</strong> Check-in history, login timestamps, IP addresses, device info, API logs</li>
              <li><strong>Communication:</strong> Support tickets, feedback, consent records</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">2. Lawful Basis (DPDP Act Compliance)</h2>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-4">
              <li><strong>Consent:</strong> Your explicit consent (signup) to process your data</li>
              <li><strong>Contract:</strong> Processing necessary to provide Virasat service</li>
              <li><strong>Legal Obligation:</strong> Compliance with Indian taxation, AML laws</li>
              <li><strong>Legitimate Interest:</strong> Fraud prevention, security, service improvement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-4">
              <li>Create and maintain your Virasat account</li>
              <li>Encrypt, store, and deliver your vault data</li>
              <li>Send periodic check-in reminders</li>
              <li>Verify executor identity and death certificates</li>
              <li>Deliver encrypted data to beneficiaries after death</li>
              <li>Process payments and manage subscriptions</li>
              <li>Provide customer support</li>
              <li>Detect and prevent fraud and security threats</li>
              <li>Comply with legal obligations and court orders</li>
              <li>Improve the Service through analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">4. Encryption & Zero-Knowledge Security</h2>
            <p className="mb-4"><strong>Your vault data is protected using:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>AES-256-GCM encryption (all vault items, messages, attachments)</li>
              <li>Client-side encryption (happens in your browser before reaching servers)</li>
              <li>Shamir Secret Sharing (3 shares, need 2 to recover master password)</li>
              <li>PBKDF2 key derivation (100,000 iterations)</li>
            </ul>
            <p className="mt-4 text-yellow-300">
              <strong>Important:</strong> Even we cannot recover your data if you lose your master password and recovery shares.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">5. Data Sharing & Third Parties</h2>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-4">
              <li><strong>Beneficiaries/Executors:</strong> Receive encrypted data after death verification</li>
              <li><strong>Payment:</strong> Razorpay/Stripe (tokenized, we don't store full payment data)</li>
              <li><strong>Email:</strong> Resend (check-in reminders and notifications)</li>
              <li><strong>Storage:</strong> Cloudflare R2/AWS S3 (encrypted documents)</li>
              <li><strong>Legal:</strong> Government/courts (only with valid legal process)</li>
              <li><strong>Cloud:</strong> MongoDB, Vercel (with confidentiality agreements)</li>
            </ul>
            <p className="mt-4"><strong>We do NOT sell, trade, or monetize your personal data.</strong></p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">6. Data Retention & Deletion</h2>
            <div className="bg-slate-700/50 rounded p-4 mt-4 space-y-3">
              <div>
                <strong className="text-white">Active Accounts:</strong>
                <p className="text-sm text-gray-400">Retained as long as account is active</p>
              </div>
              <div>
                <strong className="text-white">Post-Delivery:</strong>
                <p className="text-sm text-gray-400">Deleted 30 days after beneficiary delivery</p>
              </div>
              <div>
                <strong className="text-white">Audit Logs:</strong>
                <p className="text-sm text-gray-400">Retained for 7 years (Indian law requirement)</p>
              </div>
              <div>
                <strong className="text-white">Deleted Accounts:</strong>
                <p className="text-sm text-gray-400">All data deleted within 30 days of deletion request</p>
              </div>
            </div>
            <p className="mt-4"><strong>You can request data deletion anytime via account settings or privacy@virasat.life. We respond within 30 days.</strong></p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">7. Your Rights Under DPDP Act</h2>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-4">
              <li><strong>Right to Access:</strong> Download all your personal data (via account settings)</li>
              <li><strong>Right to Correction:</strong> Update inaccurate information</li>
              <li><strong>Right to Erasure:</strong> Request data deletion (subject to legal retention)</li>
              <li><strong>Right to Portability:</strong> Receive data in JSON/CSV format</li>
              <li><strong>Right to Withdraw Consent:</strong> Stop data processing anytime</li>
              <li><strong>Right to Complain:</strong> File complaints with Data Protection Board (India)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">8. Data Residency & International Transfers</h2>
            <p className="mb-4"><strong>Virasat prioritizes data residency in India:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li><strong>Database:</strong> MongoDB (planned: India region)</li>
              <li><strong>Storage:</strong> Cloudflare R2 (India-region routing where possible)</li>
              <li><strong>Hosting:</strong> Vercel (India-region edge caching)</li>
            </ul>
            <p className="mt-4 text-yellow-300">
              <strong>Note:</strong> Some data may be temporarily transferred internationally for processing. We ensure compliance with data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">9. Security Measures</h2>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-4">
              <li>AES-256-GCM encryption for all vault data</li>
              <li>HTTPS/TLS for data in transit</li>
              <li>JWT tokens with expiration for authentication</li>
              <li>Rate limiting on sensitive APIs</li>
              <li>Access logging and audit trails</li>
              <li>Regular security updates and patches</li>
              <li>Intrusion detection and DDoS protection</li>
              <li>Employee access controls and confidentiality agreements</li>
            </ul>
            <p className="mt-4 text-yellow-300">
              <strong>Note:</strong> No security system is 100% secure. We cannot guarantee complete immunity from cyberattacks or breaches.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">10. Breach Notification</h2>
            <p className="mb-4">In case of a data breach, we will:</p>
            <ul className="list-disc list-inside ml-4 space-y-2">
              <li>Notify you within 72 hours via email/SMS</li>
              <li>Provide details of the breach and affected data</li>
              <li>Explain remediation steps</li>
              <li>Offer guidance on account protection</li>
              <li>Notify government authorities as required</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">11. Cookies & Tracking</h2>
            <p>We use cookies for:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Session management (authentication)</li>
              <li>User preferences and settings</li>
              <li>Analytics (non-identifying patterns)</li>
              <li>Security (CSRF tokens, fraud detection)</li>
            </ul>
            <p className="mt-2">You can control cookies via browser settings. Disabling may affect functionality.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">12. Children & Minors</h2>
            <p>Virasat is not intended for children under 18. We do not knowingly collect minor data. If we discover a minor, we delete all data immediately.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-white mb-4">13. Contact & Data Rights</h2>
            <div className="bg-slate-700/50 rounded p-4 mt-4">
              <p><strong>Data Protection Officer (DPO):</strong> privacy@virasat.life</p>
              <p><strong>Address:</strong> Virasat, India</p>
              <p className="mt-4 text-sm text-gray-400">
                For data access, correction, deletion, or complaints: Contact us at privacy@virasat.life. We respond within 30 days.
              </p>
            </div>
          </section>

          {/* Final Notice */}
          <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-6 mt-12">
            <h3 className="text-2xl font-bold text-blue-400 mb-3">📋 Key Takeaway</h3>
            <p className="text-blue-100 leading-relaxed">
              Your data is encrypted on your device, never decrypted by us, and only shared with beneficiaries after verified death.
              We comply with DPDP Act 2023 and provide you full control. For legal clarity, consult a lawyer and review our
              <Link href="/terms" className="text-blue-300 hover:underline ml-1">Terms of Service</Link> and
              <Link href="/legal" className="text-blue-300 hover:underline ml-1">Legal Disclaimer</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

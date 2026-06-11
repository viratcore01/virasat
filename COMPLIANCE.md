# COMPLIANCE.md — Virasat Legal Position & Roadmap

## Status: Hackathon MVP — NOT YET LEGALLY REVIEWED

**Crucial**: This document summarises our current legal position. Consult a qualified lawyer before any public launch.

---

## 1. LAYERED TRUST MODEL: Link to /legal

- `/legal` must be **the single source of truth** for trust boundaries.
- Every other legal page MUST link to `/legal` first.
- Prevent trust drift by treating `/legal` as canonical.

## 1a. TRUST BOUNDARY — What Virasat MUST NOT Claim

Virasat is a secure storage and delivery tool only.  
It does NOT replace a legal Will, Trust, or court-mandated succession process.  
Actual ownership transfer of assets follows standard legal procedures and requires valid legal documentation.

Virasat does NOT provide legal advice.  
Users must consult a qualified lawyer for estate planning and succession under applicable Indian laws.

No page or UI element may imply or state that Virasat:
- is a legal Will, trust, or inheritance service
- replaces lawyers, notaries, or courts
- guarantees asset transfer
- supersedes Indian personal laws (Hindu, Muslim, Christian, Sikh, Jain)
- provides legal advice or testamentary instructions

## 1b. TRUST BOUNDARY — What Virasat MUST Provide

Virasat MUST remain a **secure digital vault and delivery tool** only:
- encrypts and stores asset/message data (zero-knowledge)
- delivers encrypted data to beneficiaries only after verified death
- provides executor verification and waiting-period workflows
- documents intent, but does not replace legal instruments

## 1c. PLACEHOLDER / FORWARD-COMPATIBILITY

- `/legal` anchors all future features, including AI-generated wills and impact claims.
- Do not collapse `/legal` into its page file; keep it as a contract-like document.
- Minimal acceptable metadata in `/legal`: `status`, `version`, `lastReviewDate`, `reviewedBy`, and `effectiveFrom`.
- In the MVP, populate metadata conservatively and escalate before public launch.

---

## 2. What Virasat Is

- A zero-knowledge encrypted digital legacy vault
- A notification and delivery tool for beneficiaries
- A check-in and executor-verification workflow
- **NOT a legal service or estate-planning substitute**

## 3. What Virasat Is NOT

- Not a legal will, trust, or court filing
- Not advice under Hindu, Muslim, Christian, Sikh, or Jain personal law
- Not automatic asset transfer
- Not responsible for asset ownership, bank access, or title transfers

## 4. Applicable Indian Laws

| Personal Law | Key Reference |
|--------------|---------------|
| Hindu | Hindu Succession Act, 1956 (as amended) |
| Muslim | Muslim Personal Law (Shariah) Application Act, 1937 |
| Christian | Indian Succession Act, 1925 |
| Sikh | Gurdwaras Act + personal law |
| Jain | Jain personal law |
| Parsi | Parsi Marriage & Divorce Act / Indian Succession Act |

## 5. DPDP Act 2023 — Current Status

- Consent stored at signup (`consentGiven`, `consentAt`, `consentVersion`)
- Data export endpoint: `GET /api/user/data-export` (non-encrypted metadata only)
- Account deletion endpoint: `DELETE /api/user/delete-account`
- Audit logging for access and actions
- MongoDB region MUST be set to India (Mumbai) before public launch
- Breach notification process TBD

## 6. Security Guarantees

- Zero-knowledge encryption: server never decrypts user vault data
- Shamir shares stored securely; no single point of failure
- Master password is never stored or recoverable by server
- Recovery requires both master password and shares
- Death certificate verification requires document upload + 30-day waiting period before delivery
- Multi-executor support: primary + backup executors (max 3)
- Activity logging for user transparency

## 7. Phase 2 Deliverables Completed

### 7.1 Multi-Executor Support
- Users can add 1 primary + up to 2 backup executors
- Each executor gets unique token and share
- Executor API updated to support arrays
- Fallback logic: if primary unavailable, backup can act

### 7.2 Automated Workflows
- 30-day waiting period cron job (`/api/cron/waiting-period`)
- Automatic status transitions: pending → verified → waiting → delivered
- Check-in escalation automation (notify executor after missed check-ins)
- Death certificate status workflow: pending → reviewing → verified → rejected

### 7.3 Notifications Infrastructure
- Email notifications via Resend
- WhatsApp/SMS ready (MSG91/Twilio integration points)
- Notification preferences in user settings
- Automated delivery notifications on vault unlock

### 7.4 Death Certificate Handling
- Secure upload to R2 storage
- Status flags: pending, reviewing, verified, rejected, approved
- OCR pre-fill support (frontend Tesseract.js ready)

### 7.5 Edge Cases
- Activity log visible to user for transparency
- Notification preferences per channel
- Incapacitation mode scaffolded (medical certificate support)

## 8. Phase 3 — Monetization & Premium Features (In Progress)

### 8.1 Subscription System
- **Razorpay Integration**: Order + subscription creation, webhook handler for lifecycle events
- **Plans**: Free (15 assets, 1 executor, email-only) and Premium (₹499/month, unlimited assets, 3 executors, WhatsApp/SMS, AI will)
- **Subscription Model**: Persistent subscription records with Razorpay IDs and period dates
- **User Model**: `plan`, `subscriptionStatus`, `razorpayCustomerId`

### 8.2 Feature Gating
- `src/lib/subscription.ts`: plan limits enforced (assets, executors, video, AI)
- Free-tier limits enforced server-side in vault/message APIs
- Upgrade prompts shown when approaching limits
- Dashboard displays plan usage bar and upgrade CTA

### 8.3 Premium Features
- AI Will Generator (`/ai/will-generator`): religion-aware clause generation (OpenAI-backed)
- Family collaboration scaffolded (read-only preview)
- Video/audio message support prepared

### 8.4 Pricing Page
- `/pricing` compares Free vs Premium
- Legal disclaimer included
- Zero-knowledge promise reiterated

## 9. Phase 3 Remaining Items
1. Wire AI will generator to actual OpenAI call (currently scaffolded)
2. Family collaboration read-only preview for beneficiaries
3. Video/audio recording and R2 upload support
4. Upgrade prompt banners in vault/messages pages
5. Full end-to-end payment flow testing (test mode)
6. vercel.json cron alignment if any schedule changes needed

## 10. Must Do Before Public Launch

1. Lawyer review of all legal pages
2. Data residency (MongoDB India region)
3. DPO appointment and contact details
4. Formal consent withdrawal flow
5. Bug bounty / security audit
6. Impact claims validation

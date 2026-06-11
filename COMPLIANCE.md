# VIRASAT — Phase 1 Compliance Documentation

**Status:** MVP Phase 1 Complete | NOT YET READY FOR PUBLIC LAUNCH

**Last Updated:** June 2026

---

## Executive Summary

Virasat is a zero-knowledge digital legacy vault designed for Indian users. **Phase 1** focuses on establishing legal, DPDP compliance, and security foundations before public launch.

### ⚠️ CRITICAL: This is NOT a finished product
- **Not production-ready** for public use
- **Requires lawyer review** before any public launch
- **DPDP Act compliance is foundational only** — full audit needed
- **Data residency in India** not yet enforced (in progress)

---

## Part 1: Legal Position & Disclaimers

### Pages Created
✅ `/terms` — Terms of Service
✅ `/privacy` — Privacy Policy  
✅ `/legal` — Legal Disclaimer

### Key Disclaimers in Place

**Virasat is NOT:**
- ❌ A legal Will or court-recognized successor document
- ❌ A legal service or advice provider
- ❌ An automatic asset transfer mechanism
- ❌ A replacement for consulting a lawyer
- ❌ Guaranteed to deliver data in all scenarios

**What it IS:**
- ✅ A secure, encrypted digital storage tool
- ✅ A delivery mechanism for after-death beneficiary access
- ✅ A check-in reminder system to verify user is alive
- ✅ Zero-knowledge encrypted (server never sees plaintext)

### Religion & Succession Law

Virasat respects Indian succession laws:
- **Hindu:** Hindu Succession Act, 1956 (Amended)
- **Muslim:** Muslim Personal Law (Shariat) Application Act, 1937
- **Christian:** Indian Succession Act, 1925
- **Sikh/Jain:** Applicable personal laws + Indian Succession Act
- **Other:** Indian Succession Act, 1925

**NOTE:** Virasat provides guidance only. Users MUST consult lawyers to ensure beneficiary designations comply with succession law.

### Master Password & Recovery Shares

**CRITICAL WARNING:** Loss of master password + all recovery shares = PERMANENT, IRREVERSIBLE data loss.

Shamir Secret Sharing (3-of-2 threshold):
- Share 1: Virasat servers (encrypted)
- Share 2: Executor (QR code, printed)
- Share 3: User (written down, stored safely)

**User responsibility:** Keep shares safe. Tell executor where to find Share 2.

---

## Part 2: DPDP Act 2023 Compliance

### Phase 1A: Foundation (COMPLETED ✅)

#### Consent Management
- ✅ Consent checkbox on signup (required)
- ✅ `consentVersion` tracked in User model
- ✅ `consentAt` timestamp recorded
- ✅ ConsentLog model stores consent history with timestamp, version, status

#### Data Rights APIs (COMPLETED ✅)
- ✅ `GET /api/user/data-export` — Download all personal data (JSON)
- ✅ `DELETE /api/user/delete-account` — Full account deletion
- ✅ `POST /api/user/delete-account` — Schedule deletion (30-day grace period)

#### Data Retention Policy
- Active accounts: Retained indefinitely
- Post-delivery: Deleted 30 days after beneficiary receives data
- Audit logs: Retained 7 years (Indian law requirement)
- Deleted accounts: All personal data deleted within 30 days

#### Encryption & Security
- ✅ AES-256-GCM encryption (client-side only)
- ✅ Zero-knowledge (server never decrypts vault data)
- ✅ Shamir Secret Sharing for recovery
- ✅ PBKDF2 key derivation (100,000 iterations)

#### Access Logging
- ✅ AccessLog model created
- ✅ Logs all sensitive actions: vault access, beneficiary assignment, executor verification, data export, deletion
- ✅ Stores: userId, action, timestamp, IP, user agent, success status, error messages
- ✅ 7-year retention for compliance

#### Privacy Policy
- ✅ Updated with DPDP Act clauses
- ✅ Sections on lawful basis, data usage, rights, retention, breach notification
- ✅ Data residency note (MongoDB India region planned)

### Phase 1B: NOT YET COMPLETE ❌

#### Still Needed Before Public Launch:
1. **Lawyer Review** — Full legal review by succession law experts
2. **Data Residency** — Enforce India region for MongoDB (currently: undefined)
3. **Breach Notification Protocol** — 72-hour notification procedure
4. **Rate Limiting** — Implement on sensitive endpoints (login 5/15min, sensitive 10/hour)
5. **Security Headers** — CSP, X-Frame-Options, HSTS in next.config.js
6. **Input Validation** — Hardened with Zod on all APIs
7. **Audit Trail Testing** — Verify logging works end-to-end
8. **Data Export Testing** — Test with large data sets (>10MB)
9. **Deletion Grace Period** — Test 30-day grace period workflow
10. **International Transfers** — Document & minimize cross-border transfers

---

## Part 3: Security Hardening

### Phase 1A: COMPLETED ✅

#### Encryption
- ✅ AES-256-GCM with PBKDF2 key derivation
- ✅ Client-side encryption (browser only)
- ✅ Shamir Secret Sharing recovery mechanism
- ✅ Server never stores plaintext or master password

#### Audit Logging
- ✅ AccessLog model with comprehensive fields
- ✅ Logs: encryption, key shares, beneficiary assignment, executor verification, data access
- ✅ IP tracking and user agent logging
- ✅ Success/failure recording

#### Data Access Control
- ✅ Death certificate verification before delivery
- ✅ 30-day waiting period before final delivery
- ✅ Executor role-based access
- ✅ Beneficiary one-time token delivery

### Phase 1B: NOT YET COMPLETE ❌

#### Still Needed:
1. **Rate Limiting** — Using rate-limiter-flexible or built-in
2. **Security Headers** — CSP, HSTS, X-Frame-Options
3. **Input Validation** — Zod validation on all APIs
4. **Recovery Flow UX** — Add warnings about permanent data loss
5. **Death Certificate Verification** — OCR or blockchain verification (manual for now)
6. **Multi-Factor Authentication** — Biometric/2FA support (planned)
7. **Penetration Testing** — Security audit by external firm

---

## Part 4: Data Residency Strategy

### Current Status ❌ NOT YET ENFORCED

**Planned Architecture:**
- **Database:** MongoDB Atlas India region (Mumbai)
- **File Storage:** Cloudflare R2 (India-region routing)
- **Hosting:** Vercel with India-region edge caching
- **Backups:** India-only backup locations

### Why This Matters (DPDP Act)
- DPDP Act 2023 emphasizes data localization for Indian users
- Sensitive personal data should remain in India
- Cross-border transfers require user consent and justification

### Action Items:
1. ☐ Migrate MongoDB to Mumbai region
2. ☐ Configure R2 bucket with India-region preference
3. ☐ Test data residency enforcement
4. ☐ Document in Privacy Policy

---

## Part 5: Roadmap Before Public Launch

### Pre-Launch Checklist

#### Legal & Compliance (WEEKS 1-2)
- ☐ Full lawyer review by succession law expert
- ☐ Finalize Terms of Service, Privacy Policy, Legal Disclaimer
- ☐ Get legal opinion on DPDP Act compliance
- ☐ Confirm data residency approach with lawyer

#### Security (WEEKS 2-3)
- ☐ Implement rate limiting on auth endpoints
- ☐ Add security headers (CSP, HSTS, X-Frame-Options)
- ☐ Harden input validation with Zod
- ☐ External penetration testing
- ☐ Fix any findings from pentest

#### DPDP Compliance (WEEKS 3-4)
- ☐ Complete data residency migration
- ☐ Test data export endpoint with large data sets
- ☐ Test deletion workflow with grace period
- ☐ Verify audit logs retention
- ☐ Breach notification procedure documented

#### Testing & QA (WEEKS 4-5)
- ☐ Full end-to-end testing of legal flow
- ☐ Signup → consent → vault → export → delete
- ☐ Verify all disclaimers display correctly
- ☐ Test beneficiary delivery flow
- ☐ Test executor death verification flow
- ☐ Performance testing (concurrent users, data volumes)

#### Launch Preparation (WEEKS 5-6)
- ☐ Finalize go-to-market strategy
- ☐ Prepare user documentation
- ☐ Set up customer support channels
- ☐ Plan for monitoring and logging
- ☐ Public launch!

---

## Part 6: Known Limitations & Risks

### Legal Risks ⚠️
- **Court Challenges:** Beneficiary designations may be challenged in succession courts
- **Conflicting Wills:** If user has both legal Will and Virasat, courts will prioritize legal Will
- **Forged Death Certificates:** Manual review can miss forgeries (no OCR/blockchain verification yet)
- **Family Disputes:** Virasat does NOT mediate disputes; courts will decide

### Technical Risks ⚠️
- **Data Loss:** If user loses master password + all recovery shares
- **Executor Unavailable:** If executor disappears, data cannot be delivered
- **Cyberattacks:** Despite encryption, no system is 100% secure
- **Service Discontinuation:** If Virasat shuts down without warning (need succession plan for company itself!)

### Compliance Risks ⚠️
- **DPDP Act Evolution:** Rules may change; we need ongoing legal review
- **RBI Regulations:** If adding payments/crypto features, need fintech compliance
- **State-Level Laws:** Some states may have additional succession law nuances
- **Waqf Act:** If handling Muslim waqf properties, special rules apply

---

## Part 7: Lawyer Recommendation

**BEFORE PUBLIC LAUNCH:**

1. ✅ **Hire a lawyer specializing in:**
   - Indian succession law (Hindu Succession Act, Muslim Personal Law)
   - Digital law and data protection (DPDP Act 2023)
   - Technology liability and disclaimers

2. ✅ **Get legal opinion on:**
   - Whether Virasat disclaimers are sufficient to avoid liability
   - DPDP Act compliance roadmap
   - Data residency requirements and approach
   - Terms of Service liability cap enforceability in India

3. ✅ **Draft legal documents:**
   - Finalized Terms of Service
   - Privacy Policy (already done, needs review)
   - Legal Disclaimer (already done, needs review)
   - Insurance policy for errors & omissions

4. ✅ **Get written opinion on:**
   - Whether Virasat can be used alongside legal Wills
   - How courts will treat Virasat data in succession disputes
   - Whether DPDP Act requirements are met

---

## Part 8: Contact & Support

### Legal & Compliance Questions
- **Email:** legal@virasat.life
- **For DPDP Act issues:** Consult external data protection counsel

### Data Privacy Requests
- **Email:** privacy@virasat.life
- **Response SLA:** 30 days (per DPDP Act)

### Technical Support
- **Email:** support@virasat.life

### Breach Notification
- **Breach Report Email:** breaches@virasat.life
- **Timeline:** 72 hours (per DPDP Act)
- **Notify:** User + Data Protection Board

---

## Part 9: Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | June 2026 | Initial Phase 1 completion: Legal pages, DPDP foundation, security models |

---

## Conclusion

**Virasat Phase 1 is COMPLETE for MVP purposes, but NOT ready for public launch without:**

1. ✅ **Legal review** by qualified lawyer
2. ✅ **DPDP compliance audit** by data protection expert
3. ✅ **Security penetration test** by external firm
4. ✅ **Data residency migration** to India
5. ✅ **Comprehensive testing** of all compliance flows

**Estimated timeline to public launch: 6-8 weeks** (with dedicated team)

**Do not launch publicly without completing these steps.**

---

**Document Prepared By:** Copilot AI  
**Last Updated:** June 11, 2026  
**Status:** DRAFT (Awaiting lawyer review before finalization)

# VIRASAT — Digital Legacy Vault

> A love letter to your family's future.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.local` and fill in your values:
```bash
cp .env.local .env.local
```

Required services (all free tier):
- **MongoDB Atlas** → mongodb.com/atlas → Get connection string
- **Resend** → resend.com → Get API key
- **WhatsApp Business API** → developers.facebook.com → Create app, add WhatsApp
- **Cloudflare R2** → cloudflare.com → Create bucket `virasat-vault`

### 3. Run dev server
```bash
npm run dev
```

Open http://localhost:3000

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx              ← Landing page
│   ├── auth/signup/          ← Signup flow (3 steps)
│   ├── auth/login/           ← Login with master password
│   ├── dashboard/            ← Main dashboard
│   ├── vault/                ← Vault management
│   ├── messages/             ← Final messages
│   ├── will/                 ← Will generator
│   ├── settings/             ← Executor, beneficiaries, check-in
│   ├── checkin/confirm/      ← Check-in confirmation page
│   ├── executor/[token]/     ← Executor portal
│   └── api/                  ← All API routes
├── lib/
│   ├── crypto.ts             ← AES-256-GCM zero-knowledge encryption
│   ├── db.ts                 ← MongoDB connection
│   ├── auth.ts               ← JWT, cookies, password hashing
│   ├── email.ts              ← Resend email service
│   └── whatsapp.ts           ← WhatsApp Business API
└── models/
    ├── User.ts
    ├── Executor.ts
    └── index.ts              ← Beneficiary, VaultItem, Message, CheckIn, ExecutorRequest
```

---

## Cron Jobs

Set up a cron job to hit this endpoint every Sunday at 9AM IST:

```
POST /api/cron/checkin
Authorization: Bearer YOUR_CRON_SECRET
```

Use Vercel Cron, Railway cron, or any external service like cron-job.org (free).

**Vercel cron.json:**
```json
{
  "crons": [
    {
      "path": "/api/cron/checkin",
      "schedule": "30 3 * * 0"
    }
  ]
}
```
(3:30 AM UTC = 9:00 AM IST every Sunday)

---

## Security Model

- User's **master password** is NEVER stored on server
- All vault data is encrypted **in the browser** using AES-256-GCM before being sent
- Server stores only encrypted blobs — completely unreadable without the master password
- If user forgets master password → data permanently inaccessible (by design)
- **Login password** is separate — used only for authentication, not encryption

---

## Deployment

### Vercel (Recommended — Free)
```bash
npm i -g vercel
vercel
```
Set all env variables in Vercel dashboard.

### Railway
Push to GitHub → connect to Railway → auto-deploy.

---

## Tech Stack
- **Next.js 14** (App Router)
- **MongoDB + Mongoose**
- **AES-256-GCM** encryption (Web Crypto API)
- **Resend** for emails
- **WhatsApp Business Cloud API**
- **Framer Motion** for animations
- **Tailwind CSS** for styling
- **Cormorant Garamond + Outfit** fonts

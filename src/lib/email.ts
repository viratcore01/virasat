import { Resend } from 'resend'

// Provide a dummy fallback so Vercel builds don't crash when RESEND_API_KEY is undefined during static compilation
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_for_vercel_builds')
const FROM = process.env.FROM_EMAIL || 'noreply@virasat.in'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// ─── EXECUTOR ADDED ──────────────────────────────────────────────────────────

export async function sendExecutorWelcomeEmail(executor: {
  name: string
  email: string
  ownerName: string
}) {
  return resend.emails.send({
    from: FROM,
    to: executor.email,
    subject: `${executor.ownerName} has named you as their Virasat Executor`,
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 40px;">
        <div style="background: #0D1B2A; padding: 30px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: #C9A84C; font-size: 32px; margin: 0; letter-spacing: 4px;">VIRASAT</h1>
          <p style="color: #8BA5BC; margin: 8px 0 0; font-size: 13px; letter-spacing: 2px;">DIGITAL LEGACY VAULT</p>
        </div>
        <p style="color: #2C2C2C; font-size: 17px; line-height: 1.8;">Dear ${executor.name},</p>
        <p style="color: #2C2C2C; font-size: 16px; line-height: 1.8;">
          <strong>${executor.ownerName}</strong> has named you as the trusted Executor of their Virasat digital legacy vault.
        </p>
        <p style="color: #2C2C2C; font-size: 16px; line-height: 1.8;">
          This means that if something were to happen to ${executor.ownerName}, you will be the person who helps their family access everything they've left behind — their financial accounts, important documents, and final messages for loved ones.
        </p>
        <div style="background: #1B2F45; padding: 20px; border-left: 4px solid #C9A84C; margin: 30px 0;">
          <p style="color: #E8D5A3; margin: 0; font-size: 15px; line-height: 1.7;">
            <strong>You don't need to do anything right now.</strong><br>
            We will only contact you if ${executor.ownerName} misses multiple check-ins and we are unable to reach them.
          </p>
        </div>
        <p style="color: #2C2C2C; font-size: 15px; line-height: 1.8; color: #6B7280;">
          This is one of the greatest acts of trust. ${executor.ownerName} trusts you with the most important responsibility — protecting their family's future.
        </p>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #D5CDB8; text-align: center;">
          <p style="color: #9CA3AF; font-size: 12px;">Virasat — A love letter to your family's future</p>
          <p style="color: #9CA3AF; font-size: 12px;">virasat.in</p>
        </div>
      </div>
    `
  })
}

// ─── CHECKIN REMINDER ────────────────────────────────────────────────────────

export async function sendCheckinEmail(user: {
  name: string
  email: string
  token: string
}) {
  const confirmUrl = `${APP_URL}/checkin/confirm?token=${user.token}`
  return resend.emails.send({
    from: FROM,
    to: user.email,
    subject: `Virasat Check-in — Are you okay, ${user.name.split(' ')[0]}?`,
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 40px;">
        <div style="background: #0D1B2A; padding: 30px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: #C9A84C; font-size: 32px; margin: 0; letter-spacing: 4px;">VIRASAT</h1>
        </div>
        <p style="color: #2C2C2C; font-size: 17px;">Hi ${user.name.split(' ')[0]} 👋</p>
        <p style="color: #2C2C2C; font-size: 16px; line-height: 1.8;">Your weekly Virasat check-in. One tap is all it takes.</p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${confirmUrl}" style="background: #C9A84C; color: #0D1B2A; padding: 16px 48px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block; letter-spacing: 1px;">
            ✓ I'm Okay
          </a>
        </div>
        <p style="color: #6B7280; font-size: 14px; text-align: center;">
          Travelling or in hospital? 
          <a href="${APP_URL}/settings/snooze" style="color: #C9A84C;">Snooze check-ins here</a>
        </p>
      </div>
    `
  })
}

// ─── MISS 2 — EMERGENCY CONTACT ──────────────────────────────────────────────

export async function sendEmergencyContactEmail(contact: {
  name: string
  email: string
  ownerName: string
  ownerPhone: string
  appUrl: string
}) {
  return resend.emails.send({
    from: FROM,
    to: contact.email,
    subject: `Please check on ${contact.ownerName} — Virasat`,
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 40px;">
        <div style="background: #0D1B2A; padding: 30px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: #C9A84C; font-size: 32px; margin: 0; letter-spacing: 4px;">VIRASAT</h1>
        </div>
        <p style="color: #2C2C2C; font-size: 17px;">Dear ${contact.name},</p>
        <p style="color: #2C2C2C; font-size: 16px; line-height: 1.8;">
          <strong>${contact.ownerName}</strong> hasn't responded to their Virasat check-ins for 2 weeks. They listed you as an emergency contact.
        </p>
        <p style="color: #2C2C2C; font-size: 16px; line-height: 1.8;">
          Could you please check on them? Their phone number is: <strong>${contact.ownerPhone}</strong>
        </p>
        <p style="color: #2C2C2C; font-size: 16px; line-height: 1.8;">
          If everything is fine, please ask them to log in to <a href="${contact.appUrl}" style="color: #C9A84C;">virasat.in</a> and confirm their check-in.
        </p>
        <div style="background: #FFF8EC; padding: 16px; border-left: 4px solid #C9A84C; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #8B6914;">This is an automated safety check. If ${contact.ownerName} is fine, no further action is needed.</p>
        </div>
      </div>
    `
  })
}

// ─── MISS 3 — EXECUTOR NOTIFICATION ─────────────────────────────────────────

export async function sendExecutorTriggerEmail(executor: {
  name: string
  email: string
  ownerName: string
  token: string
}) {
  const executorUrl = `${APP_URL}/executor/${executor.token}`
  return resend.emails.send({
    from: FROM,
    to: executor.email,
    subject: `URGENT: ${executor.ownerName}'s Virasat vault has been triggered`,
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 40px;">
        <div style="background: #0D1B2A; padding: 30px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: #C9A84C; font-size: 32px; margin: 0; letter-spacing: 4px;">VIRASAT</h1>
        </div>
        <div style="background: #8B2635; padding: 16px; text-align: center; margin-bottom: 24px;">
          <p style="color: white; margin: 0; font-size: 15px; font-weight: bold;">VAULT TRIGGER NOTIFICATION</p>
        </div>
        <p style="color: #2C2C2C; font-size: 17px;">Dear ${executor.name},</p>
        <p style="color: #2C2C2C; font-size: 16px; line-height: 1.8;">
          <strong>${executor.ownerName}</strong> has not responded to 3 consecutive Virasat check-ins. As their trusted Executor, you are being notified.
        </p>
        <p style="color: #2C2C2C; font-size: 16px; line-height: 1.8;">
          Please click below to proceed with verification if <strong>${executor.ownerName} has passed away</strong>, or to mark this as a false alarm.
        </p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${executorUrl}" style="background: #0D1B2A; color: #C9A84C; padding: 16px 48px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block; border: 2px solid #C9A84C;">
            Open Executor Portal →
          </a>
        </div>
        <div style="background: #FFF8EC; padding: 16px; border-left: 4px solid #C9A84C; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #8B6914;">
            <strong>If this is a mistake:</strong> Please ask ${executor.ownerName} to log in to virasat.in immediately. The owner has 48 hours to cancel this request before verification proceeds.
          </p>
        </div>
      </div>
    `
  })
}

// ─── VAULT DELIVERY EMAIL ────────────────────────────────────────────────────

export async function sendVaultDeliveryEmail(beneficiary: {
  name: string
  email: string
  ownerName: string
  items: Array<{ title: string; category: string }>
}) {
  return resend.emails.send({
    from: FROM,
    to: beneficiary.email,
    subject: `${beneficiary.ownerName} left something for you — Virasat`,
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 40px;">
        <div style="background: #0D1B2A; padding: 30px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: #C9A84C; font-size: 32px; margin: 0; letter-spacing: 4px;">VIRASAT</h1>
        </div>
        <p style="color: #2C2C2C; font-size: 17px;">Dear ${beneficiary.name},</p>
        <p style="color: #2C2C2C; font-size: 16px; line-height: 1.8;">
          <strong>${beneficiary.ownerName}</strong> loved you deeply, and planned ahead to make sure you'd be okay. They left the following for you:
        </p>
        <div style="background: white; padding: 20px; margin: 20px 0; border-radius: 4px;">
          ${beneficiary.items.map(item => `
            <div style="padding: 12px 0; border-bottom: 1px solid #E5E0D5;">
              <p style="margin: 0; font-size: 15px; color: #2C2C2C;"><strong>${item.title}</strong></p>
              <p style="margin: 4px 0 0; font-size: 13px; color: #6B7280; text-transform: uppercase; letter-spacing: 1px;">${item.category.replace('_', ' ')}</p>
            </div>
          `).join('')}
        </div>
        <p style="color: #2C2C2C; font-size: 16px; line-height: 1.8;">
          Please contact the Executor to access the full vault details. They have everything you need.
        </p>
      </div>
    `
  })
}

// â”€â”€â”€ FINAL MESSAGE DELIVERY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function sendFinalMessageDeliveryEmail(beneficiary: {
  name: string
  email: string
  ownerName: string
  deliveryUrl: string
  count: number
}) {
  return resend.emails.send({
    from: FROM,
    to: beneficiary.email,
    subject: `${beneficiary.ownerName} left you a final message â€” Virasat`,
    html: `
      <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 40px;">
        <div style="background: #0D1B2A; padding: 30px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: #C9A84C; font-size: 32px; margin: 0; letter-spacing: 4px;">VIRASAT</h1>
        </div>
        <p style="color: #2C2C2C; font-size: 17px;">Dear ${beneficiary.name},</p>
        <p style="color: #2C2C2C; font-size: 16px; line-height: 1.8;">
          ${beneficiary.ownerName} left ${beneficiary.count} final message${beneficiary.count === 1 ? '' : 's'} for you.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${beneficiary.deliveryUrl}" style="background: #C9A84C; color: #0D1B2A; padding: 14px 36px; text-decoration: none; font-size: 15px; font-weight: bold; display: inline-block; letter-spacing: 1px;">
            Open Your Messages
          </a>
        </div>
        <p style="color: #6B7280; font-size: 12px; text-align: center;">
          This link is private. Please do not share it.
        </p>
      </div>
    `
  })
}

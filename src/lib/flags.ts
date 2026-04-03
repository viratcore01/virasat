export const FREE_ONLY_MODE = (process.env.NEXT_PUBLIC_FREE_ONLY ?? 'true') === 'true'

export const RAZORPAY_CONFIGURED = Boolean(
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET &&
  process.env.RAZORPAY_PLAN_ID
)

export const WHATSAPP_CONFIGURED = Boolean(
  process.env.WHATSAPP_TOKEN &&
  process.env.WHATSAPP_PHONE_ID
)

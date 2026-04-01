import type { Metadata } from 'next'
import { Cormorant_Garamond, JetBrains_Mono, Outfit } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import CustomCursor from '@/components/CustomCursor'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-body',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Virasat - Digital Legacy Vault',
  description: "A love letter to your family's future. Protect everything you've built for the people you love.",
  keywords: 'digital will India, inheritance planning, crypto inheritance, family legacy',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cormorant.variable} ${outfit.variable} ${jetbrains.variable}`}
    >
      <body
        suppressHydrationWarning
        className="font-body bg-paper text-ink antialiased"
      >
        <CustomCursor />
        {children}
        <Toaster
          position="bottom-right"
          /* Vercel Redeploy Trigger: Verified correct CustomCursor JSX placement */
          toastOptions={{
            style: {
              background: '#0D1B2A',
              color: '#E8D5A3',
              border: '1px solid #C9A84C',
              fontFamily: 'Outfit, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#C9A84C', secondary: '#0D1B2A' } },
            error: { iconTheme: { primary: '#8B2635', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}

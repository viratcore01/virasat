export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { ok, unauthorized, badRequest, serverError } from '@/lib/api'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not configured')
}

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser()
    if (!user) return unauthorized()

    const body = await req.json()
    const { type, details } = body

    if (!type || !details) return badRequest('Missing type or details')

    let prompt = ''

    switch (type) {
      case 'will':
        prompt = `Generate a comprehensive legal will in India based on these details: ${JSON.stringify(details)}

Include:
- Proper legal structure for Indian law
- Asset distribution
- Executor appointment
- Guardianship for minors
- Digital asset handling
- Professional formatting

Make it legally sound and culturally appropriate for India.`
        break

      case 'message':
        prompt = `Write a heartfelt final message for: ${JSON.stringify(details)}

Make it personal, emotional, and appropriate for the relationship.
Include memories, advice, love, and final wishes.
Keep it under 500 words.`
        break

      case 'executor_letter':
        prompt = `Write a formal letter to an executor explaining their responsibilities: ${JSON.stringify(details)}

Include:
- Legal responsibilities
- Step-by-step process
- Emotional support guidance
- Contact information`
        break

      default:
        return badRequest('Invalid type')
    }

    const payload = {
      contents: [
        {
          parts: [
            { text: `You are a legal expert specializing in Indian inheritance law and estate planning.\n\n${prompt}` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      }
    }

    const geminiRes = await fetchWithBackoff(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      payload
    )

    if (!geminiRes.ok && geminiRes.status === 429) {
      const fallback = await fetchWithBackoff(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        payload
      )

      if (fallback.ok) {
        const geminiData = await fallback.json()
        const generatedContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text
        if (generatedContent) return ok({ content: generatedContent })
        return serverError('AI generation failed')
      }

      const errText = await fallback.text()
      console.error('Gemini fallback error:', fallback.status, errText)
      try {
        const errJson = JSON.parse(errText)
        return serverError(errJson?.error?.message || 'AI generation failed')
      } catch {
        return serverError(`AI generation failed: ${fallback.status}`)
      }
    }

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini API error:', geminiRes.status, errText)
      try {
        const errJson = JSON.parse(errText)
        return serverError(errJson?.error?.message || 'AI generation failed')
      } catch {
        return serverError(`AI generation failed: ${geminiRes.status}`)
      }
    }

    const geminiData = await geminiRes.json()
    const generatedContent = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!generatedContent) return serverError('AI generation failed')

    return ok({ content: generatedContent })

  } catch (err) {
    console.error('AI generation error:', err)
    return serverError(err)
  }
}

async function fetchWithBackoff(url: string, body: any, retries = 2): Promise<Response> {
  const headers = { 'Content-Type': 'application/json' }
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
    if (res.ok || res.status !== 429) return res
    const delay = Math.min(1000 * 2 ** attempt, 4000)
    await new Promise(r => setTimeout(r, delay))
  }
  return fetch(url, { method: 'POST', headers, body: JSON.stringify(body) })
}

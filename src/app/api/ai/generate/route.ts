export const dynamic = 'force-dynamic'
import OpenAI from 'openai'
import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { ok, unauthorized, badRequest, serverError } from '@/lib/api'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a legal expert specializing in Indian inheritance law and estate planning. Provide accurate, compassionate, and legally sound advice.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const generatedContent = completion.choices[0]?.message?.content
    if (!generatedContent) return serverError('AI generation failed')

    return ok({ content: generatedContent })

  } catch (err) {
    console.error('AI generation error:', err)
    return serverError(err)
  }
}
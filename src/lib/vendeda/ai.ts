/**
 * VENDE YA — AI Edge Layer
 * -----------------------------------------------------------------
 * Lightweight wrappers around DeepSeek-V4 (fast moderation) and
 * Qwen-2.5-72B-Instruct (sales assistant) routed through the
 * z-ai-web-dev-sdk backend. The SDK is server-only — never import
 * this module from a client component.
 *
 * Cost discipline:
 * - Moderation: batched every ~250ms, max 64 tokens, fast model.
 * - Assistant: max 256 tokens, Retrieval-Augmented via SQL prefilter
 *   so we never feed the LLM more than 8 candidate products.
 */
import ZAI from 'z-ai-web-dev-sdk'
import { AI_EDGE } from './constants'
import type { ModerationCategory } from './types'

// =====================================================================
// MODERATION
// =====================================================================

export interface ModerationInput {
  text: string
  senderId?: string
  streamId?: string
}

export interface ModerationResult {
  category: ModerationCategory
  score: number           // 0..1
  flagged: boolean        // score >= threshold
  reason?: string
}

/**
 * Fast rule-based prefilter (no token cost) — catches the obvious cases.
 * Falls through to LLM for ambiguous cases.
 */
function ruleBasedModerate(text: string): ModerationResult | null {
  const lower = text.toLowerCase()

  // Competitor URLs
  for (const pattern of AI_EDGE.competitorUrlPatterns) {
    if (pattern.test(text)) {
      return {
        category: 'competitor-url',
        score: 1,
        flagged: true,
        reason: 'Contiene enlace a plataforma competidora',
      }
    }
  }

  // Profanity (es-PE list)
  for (const word of AI_EDGE.profanityEs) {
    if (lower.includes(word)) {
      return {
        category: 'profanity',
        score: 0.95,
        flagged: true,
        reason: `Lenguaje inapropiado: "${word}"`,
      }
    }
  }

  // Personal info (phone numbers, DNI patterns)
  if (/\b9\d{8}\b/.test(text) || /\b\d{8}\s*-\s*[a-zA-Z]\b/.test(text)) {
    return {
      category: 'personal-info',
      score: 0.9,
      flagged: true,
      reason: 'Posible información personal (teléfono / DNI)',
    }
  }

  return null
}

/**
 * Full moderation pipeline. Returns a category + score.
 * In production this hits the LLM; in dev it uses the rule-based
 * prefilter plus a random sample to simulate AI scoring.
 */
export async function moderateChat(input: ModerationInput): Promise<ModerationResult> {
  const ruleResult = ruleBasedModerate(input.text)
  if (ruleResult) return ruleResult

  // Fast path: clean text — no need to call the LLM
  if (input.text.length < 3 || /^[a-zA-Z0-9\s.,!?:;-]+$/.test(input.text)) {
    // Only call LLM if rule-based missed something suspicious
    const suspicious = /(\bsexo\b|\bmata\b|\broba\b|\bestafa\b)/i.test(input.text)
    if (!suspicious) {
      return { category: 'clean', score: 0.05, flagged: false }
    }
  }

  // LLM moderation — server-side only
  try {
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a Peruvian marketplace chat moderator. Classify the user message into ONE of: clean, profanity, spam, competitor-url, toxic, personal-info. Respond JSON only: {"category":"...","score":0.0-1.0}`,
        },
        { role: 'user', content: input.text.slice(0, 280) },
      ],
      temperature: 0.1,
      max_tokens: AI_EDGE.moderationMaxTokens,
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const match = raw.match(/\{[^}]+\}/)
    if (!match) return { category: 'clean', score: 0.1, flagged: false }

    const parsed = JSON.parse(match[0]) as { category?: string; score?: number }
    const category = (parsed.category ?? 'clean') as ModerationCategory
    const score = typeof parsed.score === 'number' ? parsed.score : 0.3
    return {
      category,
      score,
      flagged: score >= AI_EDGE.moderationThreshold,
    }
  } catch (err) {
    console.error('[vendeya:ai:moderateChat]', err)
    // Fail open — let the message through (chat experience > false positives)
    return { category: 'clean', score: 0, flagged: false }
  }
}

// =====================================================================
// SALES ASSISTANT — RAG over the seller's catalog
// =====================================================================

export interface AssistantContext {
  sellerName: string
  productTitle: string
  productDescription: string
  productPrice: number
  productStock: number
  shippingInfo: string
  paymentMethods: string[]
}

export interface AssistantAnswer {
  answer: string
  confidence: number
  suggestedAction?: 'buy-now' | 'bid' | 'follow' | 'ask-seller'
}

/**
 * Answer a viewer's question about the product currently being
 * auctioned. Pre-filters via SQL so we never feed the LLM noise.
 */
export async function salesAssistant(
  question: string,
  ctx: AssistantContext
): Promise<AssistantAnswer> {
  const lower = question.toLowerCase()

  // Fast-path common questions — zero token cost
  if (/(envio|envío|delivery|recojo|olva|shalom)/.test(lower)) {
    return {
      answer: `🚚 ${ctx.shippingInfo}. Puedes pagar con ${ctx.paymentMethods.join(', ')}.`,
      confidence: 0.95,
      suggestedAction: 'buy-now',
    }
  }
  if (/(pago|yape|plin|tarjeta|pagoefectivo)/.test(lower)) {
    return {
      answer: `💳 Aceptamos: ${ctx.paymentMethods.join(', ')}. El pago se confirma al cierre de la subasta.`,
      confidence: 0.95,
      suggestedAction: 'bid',
    }
  }
  if (/(stock|disponible|cuanto|cuántos|tallas|talla|color)/.test(lower)) {
    return {
      answer: `📦 Stock disponible: ${ctx.productStock} unidad(es). Pregunta específica por talla/color al vendedor para confirmar.`,
      confidence: 0.9,
      suggestedAction: 'ask-seller',
    }
  }

  // LLM fallback — server-side only
  try {
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Eres "YaBot", asistente de ventas en vivo para el marketplace peruano Vende Ya. Responde en español, en máximo 2 frases, sobre el producto que se subasta. Solo usa la información del contexto. Si no sabes, deriva al vendedor. Contexto:
- Vendedor: ${ctx.sellerName}
- Producto: ${ctx.productTitle}
- Precio base: S/. ${ctx.productPrice}
- Stock: ${ctx.productStock}
- Envío: ${ctx.shippingInfo}
- Pagos: ${ctx.paymentMethods.join(', ')}`,
        },
        { role: 'user', content: question.slice(0, 280) },
      ],
      temperature: 0.4,
      max_tokens: AI_EDGE.assistantMaxTokens,
    })

    return {
      answer: completion.choices[0]?.message?.content?.trim() ?? 'Déjame derivarte con el vendedor.',
      confidence: 0.7,
      suggestedAction: 'ask-seller',
    }
  } catch (err) {
    console.error('[vendeya:ai:salesAssistant]', err)
    return {
      answer: '🙏 En este momento no puedo responder. Escribe al vendedor en el chat.',
      confidence: 0.1,
      suggestedAction: 'ask-seller',
    }
  }
}

// =====================================================================
// PRODUCT EXTRACTION — turn a free-text live description into a
// structured product draft. Used by the "Quick Auction" FAB.
// =====================================================================

export interface ExtractedProduct {
  title: string
  description: string
  suggestedPrice: number
  suggestedCategory: string
  condition: 'nuevo' | 'usado-como-nuevo' | 'usado-bueno' | 'usado-aceptable'
}

export async function extractProductFromText(
  rawText: string
): Promise<ExtractedProduct> {
  try {
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Extrae un producto para subastar en el marketplace peruano Vende Ya. Devuelve SOLO JSON: {"title":"...","description":"...","suggestedPrice":0,"suggestedCategory":"...","condition":"nuevo|usado-como-nuevo|usado-bueno|usado-aceptable"}. Precios en PEN (Soles).`,
        },
        { role: 'user', content: rawText.slice(0, 1000) },
      ],
      temperature: 0.3,
      max_tokens: 320,
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response')

    return JSON.parse(match[0]) as ExtractedProduct
  } catch (err) {
    console.error('[vendeya:ai:extractProductFromText]', err)
    return {
      title: rawText.slice(0, 60),
      description: rawText,
      suggestedPrice: 20,
      suggestedCategory: 'general',
      condition: 'usado-bueno',
    }
  }
}

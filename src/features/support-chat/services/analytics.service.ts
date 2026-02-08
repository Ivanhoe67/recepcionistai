// @ts-nocheck
import { createClient } from '@/lib/supabase/server'

/**
 * Analytics Service
 *
 * Tracks support chat metrics and common questions.
 * Categorizes questions using simple keyword matching.
 */

const QUESTION_CATEGORIES = {
  billing: ['precio', 'pago', 'factura', 'plan', 'suscripción', 'cobro', 'tarjeta'],
  setup: ['configurar', 'instalar', 'integrar', 'conectar', 'twilio', 'número'],
  features: ['función', 'característica', 'puede', 'cómo', 'feature', 'uso'],
  technical: ['error', 'bug', 'problema', 'falla', 'no funciona', 'ayuda'],
  general: ['general', 'información', 'qué es', 'para qué'],
} as const

type QuestionCategory = keyof typeof QUESTION_CATEGORIES

function categorizeQuestion(question: string): QuestionCategory {
  const lowerQuestion = question.toLowerCase()

  for (const [category, keywords] of Object.entries(QUESTION_CATEGORIES)) {
    if (keywords.some((keyword) => lowerQuestion.includes(keyword))) {
      return category as QuestionCategory
    }
  }

  return 'general'
}

export async function trackQuestion(
  userId: string,
  conversationId: string,
  question: string
): Promise<void> {
  const supabase = await createClient()

  const category = categorizeQuestion(question)

  const { error } = await supabase.from('support_analytics').insert({
    user_id: userId,
    conversation_id: conversationId,
    question,
    category,
  })

  if (error) {
    // Don't throw - analytics should not break the flow
    console.error('Failed to track question:', error)
  }
}

export async function getAnalyticsSummary(userId: string) {
  const supabase = await createClient()

  // Get total questions
  const { count: totalQuestions } = await supabase
    .from('support_analytics')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get category breakdown
  const { data: categoryData } = await supabase
    .from('support_analytics')
    .select('category')
    .eq('user_id', userId)

  const categoryCounts = categoryData?.reduce(
    (acc, { category }) => {
      acc[category] = (acc[category] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Get escalation rate
  const { count: escalatedCount } = await supabase
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const escalationRate =
    totalQuestions && escalatedCount
      ? (escalatedCount / totalQuestions) * 100
      : 0

  return {
    totalQuestions: totalQuestions || 0,
    categoryCounts: categoryCounts || {},
    escalationRate,
  }
}

export async function getCommonQuestions(limit = 10) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('support_analytics')
    .select('question')
    .order('created_at', { ascending: false })
    .limit(limit)

  return data?.map((d) => d.question) || []
}

/**
 * Get all support metrics (admin view)
 */
export async function getAllSupportMetrics() {
  const supabase = await createClient()

  // Get total questions across all users
  const { count: totalQuestions } = await supabase
    .from('support_analytics')
    .select('*', { count: 'exact', head: true })

  // Get category breakdown
  const { data: categoryData } = await supabase
    .from('support_analytics')
    .select('category')

  const categoryCounts = categoryData?.reduce(
    (acc, { category }) => {
      acc[category] = (acc[category] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Get total tickets (escalations)
  const { count: totalTickets } = await supabase
    .from('support_tickets')
    .select('*', { count: 'exact', head: true })

  // Get total conversations
  const { count: totalConversations } = await supabase
    .from('support_conversations')
    .select('*', { count: 'exact', head: true })

  // Calculate escalation rate
  const escalationRate =
    totalQuestions && totalTickets
      ? ((totalTickets / totalQuestions) * 100).toFixed(1)
      : '0.0'

  // Get common questions
  const commonQuestions = await getCommonQuestions(10)

  // Get recent activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { count: recentQuestions } = await supabase
    .from('support_analytics')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString())

  return {
    totalQuestions: totalQuestions || 0,
    totalConversations: totalConversations || 0,
    totalTickets: totalTickets || 0,
    escalationRate,
    categoryCounts: categoryCounts || {},
    commonQuestions,
    recentQuestions: recentQuestions || 0,
  }
}

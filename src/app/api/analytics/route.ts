// @ts-nocheck
// TODO: Regenerar tipos de Supabase para arreglar errores de tipos
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's business
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (businessError) {
      console.error('Business fetch error:', businessError)
      return NextResponse.json({ error: 'Database error fetching business' }, { status: 500 })
    }

    if (!business) {
      return NextResponse.json({ error: 'No business found for this user' }, { status: 404 })
    }

    const businessId = (business as { id: string }).id

    // Fetch data in parallel for efficiency
    const [leadsResponse, callsResponse, appointmentsResponse] = await Promise.all([
      supabase
        .from('leads')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false }),
      supabase
        .from('call_transcripts')
        .select(`
          *,
          leads!inner(business_id)
        `)
        .eq('leads.business_id', businessId),
      supabase
        .from('appointments')
        .select('*')
        .eq('business_id', businessId)
    ])

    if (leadsResponse.error) {
      console.error('Leads fetch error:', leadsResponse.error)
      throw new Error('Failed to fetch leads')
    }

    const allLeads = leadsResponse.data || []
    const allCalls = callsResponse.data || []
    const allAppointments = appointmentsResponse.data || []

    // Calculate date ranges
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Overview metrics
    const totalLeads = allLeads.length
    const leadsLast7Days = allLeads.filter(l => new Date(l.created_at) >= sevenDaysAgo).length
    const leadsLast30Days = allLeads.filter(l => new Date(l.created_at) >= thirtyDaysAgo).length
    const convertedLeads = allLeads.filter(l => l.status === 'converted').length
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0

    // Status distribution
    const statusDistribution = {
      new: allLeads.filter(l => l.status === 'new').length,
      qualified: allLeads.filter(l => l.status === 'qualified').length,
      scheduled: allLeads.filter(l => l.status === 'appointment_scheduled').length,
      converted: convertedLeads,
      lost: allLeads.filter(l => l.status === 'lost').length,
    }

    // Source distribution
    const sourceDistribution = {
      call: allLeads.filter(l => l.source === 'call').length,
      sms: allLeads.filter(l => l.source === 'sms').length,
      whatsapp: allLeads.filter(l => l.source === 'whatsapp').length,
    }

    // Urgency distribution
    const urgencyDistribution = {
      urgent: allLeads.filter(l => l.urgency === 'urgent').length,
      high: allLeads.filter(l => l.urgency === 'high').length,
      medium: allLeads.filter(l => l.urgency === 'medium').length,
      low: allLeads.filter(l => l.urgency === 'low').length,
    }

    // Call metrics
    const callsWithDuration = allCalls.filter((c: any) => c.duration_seconds !== null)
    const avgDuration = callsWithDuration.length > 0
      ? Math.round(callsWithDuration.reduce((sum: number, c: any) => sum + (c.duration_seconds || 0), 0) / callsWithDuration.length)
      : 0

    const callMetrics = {
      totalCalls: allCalls.length,
      avgDuration,
      callsWithTranscripts: allCalls.filter((c: any) => c.transcript !== null).length,
    }

    // Appointment metrics
    const totalAppointments = allAppointments.length
    const completedAppointments = allAppointments.filter((a: any) => a.status === 'completed').length
    const appointmentCompletionRate = totalAppointments > 0
      ? Math.round((completedAppointments / totalAppointments) * 100)
      : 0

    const appointmentMetrics = {
      total: totalAppointments,
      scheduled: allAppointments.filter((a: any) => a.status === 'scheduled').length,
      confirmed: allAppointments.filter((a: any) => a.status === 'confirmed').length,
      completed: completedAppointments,
      cancelled: allAppointments.filter((a: any) => a.status === 'cancelled').length,
      noShow: allAppointments.filter((a: any) => a.status === 'no_show').length,
      completionRate: appointmentCompletionRate,
    }

    // Leads by date (last 30 days)
    const leadsByDate: Record<string, { leadCount: number; callCount: number; smsCount: number; whatsappCount: number }> = {}

    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      leadsByDate[dateStr] = { leadCount: 0, callCount: 0, smsCount: 0, whatsappCount: 0 }
    }

    allLeads.forEach(lead => {
      const dateStr = new Date(lead.created_at).toISOString().split('T')[0]
      if (leadsByDate[dateStr]) {
        if (lead.source === 'call') leadsByDate[dateStr].callCount++
        if (lead.source === 'sms') leadsByDate[dateStr].smsCount++
        if (lead.source === 'whatsapp') leadsByDate[dateStr].whatsappCount++
      }
    })

    const leadsByDateArray = Object.entries(leadsByDate).map(([date, counts]) => ({
      date,
      ...counts,
    }))

    // Case type distribution
    const caseTypeCounts: Record<string, number> = {}
    allLeads.forEach(lead => {
      if (lead.case_type) {
        caseTypeCounts[lead.case_type] = (caseTypeCounts[lead.case_type] || 0) + 1
      }
    })

    const totalWithCaseType = Object.values(caseTypeCounts).reduce((sum, count) => sum + count, 0)
    const caseTypeStats = Object.entries(caseTypeCounts)
      .map(([caseType, count]) => ({
        caseType,
        count,
        percentage: totalWithCaseType > 0 ? Math.round((count / totalWithCaseType) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    // Quality distribution based on real classification from migration 002 if available
    // or fallback to urgency/status logic
    const qualityDistribution = {
      high: 0,
      medium: 0,
      low: 0,
      lost: 0
    }

    allLeads.forEach(l => {
      if (l.status === 'lost') {
        qualityDistribution.lost++
        return
      }

      // Try to use classification from migration 002
      const classification = (l as any).classification
      if (classification && classification.quality) {
        if (classification.quality === 'high') qualityDistribution.high++
        else if (classification.quality === 'medium') qualityDistribution.medium++
        else qualityDistribution.low++
      } else {
        // Fallback logic
        if (l.status === 'converted' || l.urgency === 'urgent') qualityDistribution.high++
        else if (l.status === 'qualified' || l.urgency === 'high') qualityDistribution.medium++
        else qualityDistribution.low++
      }
    })

    // Pain points (case types with issues)
    const painPoints = caseTypeStats.map(ct => {
      const leadsOfType = allLeads.filter(l => l.case_type === ct.caseType)
      const lostCount = leadsOfType.filter(l => l.status === 'lost').length
      const convertedCount = leadsOfType.filter(l => l.status === 'converted').length
      const urgentCount = leadsOfType.filter(l => l.urgency === 'urgent' || l.urgency === 'high').length

      return {
        caseType: ct.caseType,
        sessionCount: ct.count,
        lostRate: ct.count > 0 ? Math.round((lostCount / ct.count) * 100) : 0,
        conversionRate: ct.count > 0 ? Math.round((convertedCount / ct.count) * 100) : 0,
        urgentRate: ct.count > 0 ? Math.round((urgentCount / ct.count) * 100) : 0,
      }
    })

    // Content gaps / areas needing attention
    const contentGaps = painPoints
      .map(pp => {
        const gapScore = pp.sessionCount > 0
          ? Math.round((pp.sessionCount * pp.lostRate) / Math.max(pp.conversionRate, 1))
          : 0

        let recommendation: 'urgent' | 'recommended' | 'monitor' | 'ok'
        if (gapScore >= 50) recommendation = 'urgent'
        else if (gapScore >= 20) recommendation = 'recommended'
        else if (gapScore >= 10) recommendation = 'monitor'
        else recommendation = 'ok'

        return {
          caseType: pp.caseType,
          sessionCount: pp.sessionCount,
          lostRate: pp.lostRate,
          conversionRate: pp.conversionRate,
          gapScore,
          recommendation,
        }
      })
      .sort((a, b) => b.gapScore - a.gapScore)

    return NextResponse.json({
      overview: {
        totalLeads,
        leadsLast7Days,
        leadsLast30Days,
        conversionRate,
        appointmentCompletionRate,
      },
      statusDistribution,
      sourceDistribution,
      urgencyDistribution,
      callMetrics,
      appointmentMetrics,
      leadsByDate: leadsByDateArray,
      caseTypeStats,
      qualityDistribution,
      painPoints,
      contentGaps,
    })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

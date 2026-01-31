import { notFound } from 'next/navigation'
import { getLead } from '@/features/leads/services/leads.service'
import { LeadDetail } from '@/features/leads/components/LeadDetail'

interface LeadPageProps {
  params: Promise<{ id: string }>
}

export default async function LeadPage({ params }: LeadPageProps) {
  const { id } = await params
  const lead = await getLead(id)

  if (!lead) {
    notFound()
  }

  return <LeadDetail lead={lead} />
}

import { getCalls } from '@/features/calls/services/calls.service'
import { CallsTable } from '@/features/calls/components/CallsTable'
import { getTranslations } from 'next-intl/server'

export default async function CallsPage() {
    const t = await getTranslations('Calls')
    const calls = await getCalls()

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
                    {t('title')}
                </h1>
                <p className="text-sky-600/70 mt-1">{t('subtitle')}</p>
            </div>

            <CallsTable initialCalls={calls} />
        </div>
    )
}

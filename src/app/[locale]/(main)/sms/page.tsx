import { getSmsConversations } from '@/features/sms/services/sms.service'
import { SmsGrid } from '@/features/sms/components/SmsGrid'
import { getTranslations } from 'next-intl/server'

export default async function SmsPage() {
    const t = await getTranslations('Sms')
    const conversations = await getSmsConversations()

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
                    {t('title')}
                </h1>
                <p className="text-sky-600/70 mt-1">{t('subtitle')}</p>
            </div>

            <SmsGrid initialConversations={conversations} />
        </div>
    )
}

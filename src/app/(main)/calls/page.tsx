import { getCalls } from '@/features/calls/services/calls.service'
import { CallsTable } from '@/features/calls/components/CallsTable'

export default async function CallsPage() {
    const calls = await getCalls()

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
                    Llamadas
                </h1>
                <p className="text-sky-600/70 mt-1">Registro detallado de llamadas y transcripciones de la IA</p>
            </div>

            <CallsTable initialCalls={calls} />
        </div>
    )
}

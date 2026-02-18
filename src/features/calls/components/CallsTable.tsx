'use client'

import { useState } from 'react'
import { Phone, Clock, FileText, Download, X, Bot, User, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { useTranslations, useLocale } from 'next-intl'
import { CallWithLead } from '../services/calls.service'

interface CallsTableProps {
    initialCalls: CallWithLead[]
}

export function CallsTable({ initialCalls }: CallsTableProps) {
    const t = useTranslations('Calls')
    const tDashboard = useTranslations('Dashboard.recentLeads')
    const tLeads = useTranslations('Leads.detail.call')
    const locale = useLocale()
    const dateLocale = locale === 'es' ? es : enUS

    const [selectedCall, setSelectedCall] = useState<CallWithLead | null>(null)

    return (
        <>
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="glass-table">
                        <thead>
                            <tr>
                                <th>{t('table.contact')}</th>
                                <th>{t('table.date')}</th>
                                <th>{t('table.duration')}</th>
                                <th>{t('table.status')}</th>
                                <th>{tLeads('summary')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialCalls.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-sky-600/50">
                                        {tDashboard('empty')}
                                    </td>
                                </tr>
                            ) : (
                                initialCalls.map((call) => (
                                    <tr key={call.id} className="hover:bg-sky-50/30 transition-colors">
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sky-900">{call.leads.name || tDashboard('noCaseType')}</span>
                                                <span className="text-xs text-sky-600/70">{call.leads.phone}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-sky-900">
                                                <Clock className="h-4 w-4 text-sky-400" />
                                                {call.created_at ? format(new Date(call.created_at as string), "d MMM, HH:mm", { locale: dateLocale }) : '-'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-sky-900">
                                                {call.duration_seconds
                                                    ? `${Math.floor(call.duration_seconds / 60)}:${String(call.duration_seconds % 60).padStart(2, '0')}`
                                                    : '0:00'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`glass-badge ${call.call_status === 'completed' ? 'glass-badge-success' : 'glass-badge-sky'
                                                }`}>
                                                {call.call_status || t('status.unknown', { defaultValue: 'unknown' })}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                {call.recording_url && (
                                                    <a
                                                        href={call.recording_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 hover:bg-sky-100 rounded-lg transition-colors text-sky-500"
                                                        title={t('table.viewTranscript')}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                )}
                                                <button
                                                    onClick={() => setSelectedCall(call)}
                                                    className="p-2 hover:bg-sky-100 rounded-lg transition-colors text-sky-500"
                                                    title={t('table.viewTranscript')}
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transcript Modal */}
            {selectedCall && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-sky-900/40 backdrop-blur-sm animate-fade-in"
                        onClick={() => setSelectedCall(null)}
                    />

                    <div className="relative w-full max-w-4xl max-h-[90vh] glass-card flex flex-col animate-scale-in">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-sky-100 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                                    <Phone className="h-6 w-6 text-sky-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-sky-900">
                                        {tLeads('transcriptTitle')}: {selectedCall.leads.name || selectedCall.leads.phone}
                                    </h2>
                                    <p className="text-sm text-sky-600/70">
                                        {selectedCall.created_at ? format(new Date(selectedCall.created_at as string), "PPp", { locale: dateLocale }) : '-'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedCall(null)}
                                className="p-2 hover:bg-sky-100 rounded-full transition-colors text-sky-400 hover:text-sky-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                            {/* Summary Side */}
                            <div className="w-full md:w-80 p-6 border-b md:border-b-0 md:border-r border-sky-100 bg-sky-50/30 overflow-y-auto">
                                <h3 className="text-sm font-bold text-sky-900 uppercase tracking-wider mb-4">{tLeads('summary')}</h3>
                                {selectedCall.summary ? (
                                    <p className="text-sm text-sky-800 leading-relaxed bg-white/50 p-4 rounded-xl border border-sky-100 italic">
                                        "{selectedCall.summary}"
                                    </p>
                                ) : (
                                    <p className="text-sm text-sky-600/50 italic">{tLeads('noTranscript')}</p>
                                )}

                                <div className="mt-8 space-y-4">
                                    <h3 className="text-sm font-bold text-sky-900 uppercase tracking-wider">{t('table.status')}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/50 p-3 rounded-xl border border-sky-100 text-center">
                                            <p className="text-[10px] text-sky-600 uppercase">{t('table.duration')}</p>
                                            <p className="text-sm font-bold text-sky-900">
                                                {selectedCall.duration_seconds
                                                    ? `${Math.floor(selectedCall.duration_seconds / 60)}m ${selectedCall.duration_seconds % 60}s`
                                                    : '0s'}
                                            </p>
                                        </div>
                                        <div className="bg-white/50 p-3 rounded-xl border border-sky-100 text-center">
                                            <p className="text-[10px] text-sky-600 uppercase">{t('table.status')}</p>
                                            <p className="text-sm font-bold text-sky-900 capitalize">{selectedCall.call_status}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transcript Chat */}
                            <div className="flex-1 flex flex-col overflow-hidden bg-white/40">
                                <div className="p-4 border-b border-sky-100 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-sky-400" />
                                    <span className="text-sm font-semibold text-sky-900">{tLeads('transcriptTitle')}</span>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                    {Array.isArray(selectedCall.transcript) && selectedCall.transcript.length > 0 ? (
                                        (selectedCall.transcript as any[]).map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex gap-4 ${msg.role === 'assistant' || msg.role === 'agent' ? '' : 'flex-row-reverse text-right'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'assistant' || msg.role === 'agent' ? 'bg-sky-500' : 'bg-emerald-500'
                                                    }`}>
                                                    {msg.role === 'assistant' || msg.role === 'agent' ? (
                                                        <Bot className="h-4 w-4 text-white" />
                                                    ) : (
                                                        <User className="h-4 w-4 text-white" />
                                                    )}
                                                </div>
                                                <div className={`max-w-[80%] space-y-1`}>
                                                    <p className="text-[10px] font-bold text-sky-600 uppercase">
                                                        {msg.role === 'assistant' || msg.role === 'agent' ? tLeads('role.agent') : tLeads('role.customer')}
                                                    </p>
                                                    <div className={`p-4 rounded-2xl text-sm ${msg.role === 'assistant' || msg.role === 'agent'
                                                        ? 'bg-sky-100 text-sky-900 rounded-tl-none border border-sky-200'
                                                        : 'bg-emerald-100 text-emerald-900 rounded-tr-none border border-emerald-200'
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : typeof selectedCall.transcript === 'string' ? (
                                        <div className="p-4 bg-sky-50 rounded-xl border border-sky-100 text-sm text-sky-800 whitespace-pre-wrap">
                                            {selectedCall.transcript}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-sky-600/50 space-y-2">
                                            <FileText className="h-12 w-12 opacity-20" />
                                            <p>{tLeads('noTranscript')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        {selectedCall.recording_url && (
                            <div className="p-4 border-t border-sky-100 bg-sky-50/50 flex justify-center">
                                <audio controls className="w-full max-w-2xl h-10 accent-sky-500">
                                    <source src={selectedCall.recording_url} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

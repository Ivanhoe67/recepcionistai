'use client'

import { useState } from 'react'
import { MessageSquare, Clock, User, X, Bot, Send, ArrowRight, Smartphone } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { SmsWithLead } from '../services/sms.service'

interface SmsGridProps {
    initialConversations: SmsWithLead[]
}

export function SmsGrid({ initialConversations }: SmsGridProps) {
    const [selectedConv, setSelectedConv] = useState<SmsWithLead | null>(null)

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {initialConversations.length === 0 ? (
                    <div className="col-span-full glass-card p-12 text-center text-sky-600/50">
                        No hay conversaciones de SMS registradas.
                    </div>
                ) : (
                    initialConversations.map((conv) => {
                        const messages = (conv.messages as any[]) || []
                        const lastMessage = messages[messages.length - 1]
                        const isWhatsApp = conv.leads.phone.startsWith('whatsapp') || (conv as any).source === 'whatsapp'

                        return (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedConv(conv)}
                                className="glass-card p-6 h-full flex flex-col hover:border-sky-300 transition-all group cursor-pointer hover:shadow-lg hover:shadow-sky-500/5 animate-fade-in"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isWhatsApp ? 'bg-green-100' : 'bg-sky-100'
                                            }`}>
                                            <User className={`h-5 w-5 ${isWhatsApp ? 'text-green-500' : 'text-sky-500'}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sky-900 group-hover:text-sky-600 transition-colors">
                                                {conv.leads.name || 'Desconocido'}
                                            </h3>
                                            <div className="flex items-center gap-1">
                                                <Smartphone className="h-3 w-3 text-sky-400" />
                                                <p className="text-xs text-sky-600/70">{conv.leads.phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-sky-600/50">
                                        {conv.last_message_at ? format(new Date(conv.last_message_at as string), "HH:mm") : '-'}
                                    </span>
                                </div>

                                <div className="flex-1 bg-sky-50/50 rounded-xl p-4 mb-4 line-clamp-3 text-sm text-sky-800 italic group-hover:bg-sky-50 transition-colors">
                                    {lastMessage?.content || 'Sin mensajes registrados'}
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                    <span className={`text-xs font-medium flex items-center gap-1 ${isWhatsApp ? 'text-green-600' : 'text-sky-600'
                                        }`}>
                                        <MessageSquare className="h-3 w-3" />
                                        {messages.length} mensajes {isWhatsApp ? '· WhatsApp' : '· SMS'}
                                    </span>
                                    <div className={`p-2 rounded-lg text-white transition-all transform group-hover:translate-x-1 ${isWhatsApp ? 'bg-green-500 group-hover:bg-green-600' : 'bg-sky-500 group-hover:bg-sky-600'
                                        }`}>
                                        <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Chat Modal */}
            {selectedConv && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-sky-900/40 backdrop-blur-sm animate-fade-in"
                        onClick={() => setSelectedConv(null)}
                    />

                    <div className="relative w-full max-w-2xl max-h-[85vh] glass-card flex flex-col animate-scale-in overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-sky-100 flex items-center justify-between bg-white/40">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
                                    <User className="h-6 w-6 text-sky-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-sky-900">
                                        {selectedConv.leads.name || 'Conversación'}
                                    </h2>
                                    <p className="text-sm text-sky-600/70 flex items-center gap-2">
                                        <Smartphone className="h-3 w-3" />
                                        {selectedConv.leads.phone}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedConv(null)}
                                className="p-2 hover:bg-sky-100 rounded-full transition-colors text-sky-400 hover:text-sky-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-sky-50/30">
                            {((selectedConv.messages as any[]) || []).map((msg, idx) => {
                                const isAI = msg.role === 'assistant'
                                return (
                                    <div
                                        key={idx}
                                        className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
                                    >
                                        <div className={`max-w-[85%] space-y-1 ${isAI ? '' : 'flex flex-col items-end'}`}>
                                            <div className={`p-4 rounded-2xl text-sm shadow-sm ${isAI
                                                    ? 'bg-white text-sky-900 rounded-tl-none border border-sky-100'
                                                    : 'bg-sky-500 text-white rounded-tr-none'
                                                }`}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[10px] text-sky-600/50 px-2">
                                                {msg.timestamp ? format(new Date(msg.timestamp), "HH:mm") : ''}
                                                {isAI ? ' · Asistente IA' : ' · Lead'}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Modal Footer - Info Badge */}
                        <div className="p-4 bg-white/60 border-t border-sky-100 flex justify-center">
                            <div className="flex items-center gap-2 text-xs font-medium text-sky-600 bg-sky-100/50 px-4 py-2 rounded-full">
                                <Bot className="h-3 w-3" />
                                Esta conversación es gestionada automáticamente por la IA
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

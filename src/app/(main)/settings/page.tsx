'use client'

import { useEffect, useState } from 'react'
import { Settings, Save, Building2, Phone, Globe, FileText, Bot, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getBusiness, upsertBusiness } from '@/features/business/services/business.service'
import { Business } from '@/lib/database.types'

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [business, setBusiness] = useState<Partial<Business>>({
        name: '',
        phone: '',
        timezone: 'America/New_York',
        assistant_script: '',
        retell_agent_id: '',
    })

    useEffect(() => {
        loadBusiness()
    }, [])

    async function loadBusiness() {
        try {
            const data = await getBusiness()
            if (data) {
                setBusiness(data)
            }
        } catch (error) {
            console.error('Failed to load business:', error)
            toast.error('Error al cargar los datos del negocio')
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        try {
            await upsertBusiness({
                name: business.name || '',
                phone: business.phone,
                timezone: business.timezone || 'America/New_York',
                assistant_script: business.assistant_script,
                retell_agent_id: business.retell_agent_id,
            })
            toast.success('Configuración guardada correctamente')
        } catch (error) {
            console.error('Failed to save business:', error)
            toast.error('Error al guardar la configuración')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-10 h-10 border-3 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
                    Configuración
                </h1>
                <p className="text-sky-600/70 mt-1">
                    Gestiona el perfil y la personalidad de tu asistente virtual
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Business Profile Section */}
                <div className="glass-card p-6 space-y-6">
                    <div className="flex items-center gap-3 border-b border-sky-100 pb-4">
                        <div className="glass-metric-icon bg-gradient-to-br from-sky-400 to-sky-500">
                            <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-sky-900">Perfil del Negocio</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-sky-700 flex items-center gap-2">
                                Nombre del Negocio
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400" />
                                <input
                                    type="text"
                                    required
                                    value={business.name}
                                    onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                                    placeholder="Ej. Clínica Dental Sonrisa"
                                    className="w-full pl-10 pr-4 py-2 bg-white/50 border border-sky-100 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-sky-700 flex items-center gap-2">
                                Teléfono
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400" />
                                <input
                                    type="text"
                                    value={business.phone || ''}
                                    onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                                    placeholder="+1 234 567 890"
                                    className="w-full pl-10 pr-4 py-2 bg-white/50 border border-sky-100 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-sky-700 flex items-center gap-2">
                                Zona Horaria
                            </label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400" />
                                <select
                                    value={business.timezone || 'America/New_York'}
                                    onChange={(e) => setBusiness({ ...business, timezone: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 bg-white/50 border border-sky-100 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all appearance-none"
                                >
                                    <option value="America/New_York">Eastern Time (ET)</option>
                                    <option value="America/Chicago">Central Time (CT)</option>
                                    <option value="America/Denver">Mountain Time (MT)</option>
                                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                                    <option value="Europe/Madrid">Madrid, Spain</option>
                                    <option value="America/Mexico_City">Mexico City</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Configuration Section */}
                <div className="glass-card p-6 space-y-6">
                    <div className="flex items-center gap-3 border-b border-sky-100 pb-4">
                        <div className="glass-metric-icon bg-gradient-to-br from-violet-400 to-violet-500">
                            <Bot className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-sky-900">Configuración de IA</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-sky-700 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Script del Asistente
                            </label>
                            <textarea
                                rows={6}
                                value={business.assistant_script || ''}
                                onChange={(e) => setBusiness({ ...business, assistant_script: e.target.value })}
                                placeholder="Describe cómo quieres que actúe tu asistente, qué servicios ofreces, etc."
                                className="w-full px-4 py-3 bg-white/50 border border-sky-100 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none"
                            />
                            <p className="text-xs text-sky-600/60">
                                Este script define el comportamiento básico y el conocimiento de tu asistente virtual.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-sky-700 flex items-center gap-2">
                                Retell Agent ID
                            </label>
                            <div className="relative">
                                <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-sky-400" />
                                <input
                                    type="text"
                                    value={business.retell_agent_id || ''}
                                    onChange={(e) => setBusiness({ ...business, retell_agent_id: e.target.value })}
                                    placeholder="agent_xxxxxxxxxxxxxxxx"
                                    className="w-full pl-10 pr-4 py-2 bg-white/50 border border-sky-100 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                                />
                            </div>
                            <p className="text-xs text-sky-600/60">
                                ID del agente configurado en su panel de Retell.ai para la integración de voz.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="glass-button px-8 py-3 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/20"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                Guardar Configuración
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

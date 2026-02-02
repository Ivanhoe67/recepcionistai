'use client'

import { useState } from 'react'
import {
  X,
  Save,
  Loader2,
  Building2,
  Phone,
  MessageSquare,
  Bot,
  Settings2,
} from 'lucide-react'
import { updateUserBusiness } from '@/features/admin/services/admin.service'
import { useRouter } from 'next/navigation'

interface EditUserConfigModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    full_name: string
    businesses: any[]
  }
}

export function EditUserConfigModal({ isOpen, onClose, user }: EditUserConfigModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedBusinessId, setSelectedBusinessId] = useState(user.businesses[0]?.id || '')
  
  // Form state for the selected business
  const currentBusiness = user.businesses.find(b => b.id === selectedBusinessId)
  const [formData, setFormData] = useState({
    name: currentBusiness?.name || '',
    phone_number: currentBusiness?.phone_number || '',
    whatsapp_phone: currentBusiness?.whatsapp_phone || '',
    retell_agent_id: currentBusiness?.retell_agent_id || '',
    timezone: currentBusiness?.timezone || 'America/New_York',
  })

  // Update form data when business selection changes
  const handleBusinessChange = (id: string) => {
    setSelectedBusinessId(id)
    const biz = user.businesses.find(b => b.id === id)
    if (biz) {
      setFormData({
        name: biz.name || '',
        phone_number: biz.phone_number || '',
        whatsapp_phone: biz.whatsapp_phone || '',
        retell_agent_id: biz.retell_agent_id || '',
        timezone: biz.timezone || 'America/New_York',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBusinessId) return

    setLoading(true)
    try {
      await updateUserBusiness(selectedBusinessId, formData)
      router.refresh()
      onClose()
    } catch (error) {
      console.error('Error updating business config:', error)
      alert('Error al actualizar la configuración')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Configurar Agentes</h2>
              <p className="text-xs text-gray-500">Editando perfiles de {user.full_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Business Selector */}
            {user.businesses.length > 1 && (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Seleccionar Negocio
                </label>
                <select
                  value={selectedBusinessId}
                  onChange={(e) => handleBusinessChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                >
                  {user.businesses.map((biz) => (
                    <option key={biz.id} value={biz.id}>
                      {biz.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!selectedBusinessId ? (
              <div className="py-10 text-center text-gray-500">
                <Building2 className="mx-auto h-12 w-12 text-gray-200 mb-3" />
                <p>Este usuario no tiene negocios configurados.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {/* General Info */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                    <Building2 className="h-4 w-4" /> Información General
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-gray-600">Nombre del Negocio</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-violet-500 outline-none"
                        placeholder="Ej: Mi Clínica"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold text-gray-600">Zona Horaria</label>
                      <input
                        type="text"
                        value={formData.timezone}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-violet-500 outline-none"
                        placeholder="America/New_York"
                      />
                    </div>
                  </div>
                </div>

                {/* Retell Config */}
                <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
                  <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2">
                    <Bot className="h-4 w-4" /> Agente de Voz (Retell)
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-blue-600">Retell Agent ID</label>
                      <input
                        type="text"
                        value={formData.retell_agent_id}
                        onChange={(e) => setFormData({ ...formData, retell_agent_id: e.target.value })}
                        className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 outline-none"
                        placeholder="agent_..."
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-blue-600">Teléfono Asignado</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-blue-400" />
                        <input
                          type="text"
                          value={formData.phone_number}
                          onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                          className="w-full rounded-lg border border-blue-200 pl-9 pr-3 py-2 text-sm focus:border-blue-500 outline-none"
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Config */}
                <div className="space-y-4 rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
                  <h3 className="text-sm font-bold text-emerald-700 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" /> Agente de WhatsApp
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-emerald-600">WhatsApp Phone</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-emerald-400" />
                        <input
                          type="text"
                          value={formData.whatsapp_phone}
                          onChange={(e) => setFormData({ ...formData, whatsapp_phone: e.target.value })}
                          className="w-full rounded-lg border border-emerald-200 pl-9 pr-3 py-2 text-sm focus:border-emerald-500 outline-none"
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>
                    <div className="rounded-lg bg-emerald-100/50 p-2 text-[10px] text-emerald-700">
                      Asegúrate de que el número esté vinculado correctamente en el panel de Meta/Twilio.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !selectedBusinessId}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

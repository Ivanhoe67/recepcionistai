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
  Plus,
  CheckCircle2,
} from 'lucide-react'
import { createOrUpdateUserBusiness } from '@/features/admin/services/admin.service'
import { useRouter } from 'next/navigation'

interface ConfigureUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    id: string
    full_name: string
    email: string
    businesses: any[]
  }
}

export function ConfigureUserModal({ isOpen, onClose, user }: ConfigureUserModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'select' | 'configure'>('select')
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    user.businesses[0]?.id || null
  )
  
  // Form state
  const currentBusiness = user.businesses.find(b => b.id === selectedBusinessId)
  const [formData, setFormData] = useState({
    name: currentBusiness?.name || '',
    phone_number: currentBusiness?.phone || '',
    whatsapp_phone: currentBusiness?.whatsapp_phone || '',
    retell_agent_id: currentBusiness?.retell_agent_id || '',
    timezone: currentBusiness?.timezone || 'America/Mexico_City',
  })

  // Update form data when business selection changes
  const handleBusinessChange = (id: string | null) => {
    setSelectedBusinessId(id)
    if (id === null) {
      // Creating new business
      setFormData({
        name: '',
        phone_number: '',
        whatsapp_phone: '',
        retell_agent_id: '',
        timezone: 'America/Mexico_City',
      })
    } else {
      const biz = user.businesses.find(b => b.id === id)
      if (biz) {
        setFormData({
          name: biz.name || '',
          phone_number: biz.phone || '',
          whatsapp_phone: biz.whatsapp_phone || '',
          retell_agent_id: biz.retell_agent_id || '',
          timezone: biz.timezone || 'America/Mexico_City',
        })
      }
    }
    setStep('configure')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('El nombre del negocio es obligatorio')
      return
    }

    setLoading(true)
    try {
      await createOrUpdateUserBusiness(user.id, selectedBusinessId, formData)
      alert('✅ Configuración guardada exitosamente')
      router.refresh()
      onClose()
    } catch (error: any) {
      console.error('Error saving business config:', error)
      alert(`❌ Error: ${error.message || 'Error al guardar la configuración'}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg">
              <Settings2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Configurar Perfil Completo</h2>
              <p className="text-sm text-gray-600">
                {user.full_name || user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 'select' && (
          <div className="p-8">
            <h3 className="mb-4 text-lg font-bold text-gray-900">¿Qué deseas configurar?</h3>
            <div className="space-y-3">
              {user.businesses.map((biz) => (
                <button
                  key={biz.id}
                  onClick={() => handleBusinessChange(biz.id)}
                  className="w-full rounded-xl border-2 border-gray-200 bg-white p-4 text-left transition-all hover:border-violet-500 hover:bg-violet-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">{biz.name}</p>
                      <p className="text-sm text-gray-500">Editar negocio existente</p>
                    </div>
                    <Settings2 className="h-5 w-5 text-violet-600" />
                  </div>
                </button>
              ))}
              
              <button
                onClick={() => handleBusinessChange(null)}
                className="w-full rounded-xl border-2 border-dashed border-violet-300 bg-violet-50/50 p-4 text-left transition-all hover:border-violet-500 hover:bg-violet-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-violet-700">Crear Nuevo Negocio</p>
                    <p className="text-sm text-violet-600">Configurar desde cero</p>
                  </div>
                  <Plus className="h-5 w-5 text-violet-600" />
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 'configure' && (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6 rounded-xl bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">
                    {selectedBusinessId ? 'Editando negocio existente' : 'Creando nuevo negocio'}
                  </p>
                  <p className="text-sm text-blue-700">
                    Configura el negocio y los agentes de WhatsApp y Retell para este usuario.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* General Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                  <Building2 className="h-4 w-4" /> Información del Negocio
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-600">
                      Nombre del Negocio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none"
                      placeholder="Ej: Mi Clínica Dental"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-gray-600">Zona Horaria</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none"
                    >
                      <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                      <option value="America/New_York">Nueva York (GMT-5)</option>
                      <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
                      <option value="America/Chicago">Chicago (GMT-6)</option>
                      <option value="America/Bogota">Bogotá (GMT-5)</option>
                      <option value="America/Lima">Lima (GMT-5)</option>
                      <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Agent Configs */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Retell Config */}
                <div className="space-y-4 rounded-xl border-2 border-blue-100 bg-blue-50/30 p-4">
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
                        className="w-full rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white"
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
                          className="w-full rounded-lg border border-blue-200 pl-9 pr-3 py-2 text-sm focus:border-blue-500 outline-none bg-white"
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Config */}
                <div className="space-y-4 rounded-xl border-2 border-emerald-100 bg-emerald-50/30 p-4">
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
                          className="w-full rounded-lg border border-emerald-200 pl-9 pr-3 py-2 text-sm focus:border-emerald-500 outline-none bg-white"
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>
                    <div className="rounded-lg bg-emerald-100/50 p-3 text-xs text-emerald-700">
                      <strong>Tip:</strong> Asegúrate de vincular este número en el panel de Meta/Twilio.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="rounded-xl px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
              >
                ← Volver
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.name.trim()}
                  className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {selectedBusinessId ? 'Guardar Cambios' : 'Crear Negocio'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

import { getAppointments } from '@/features/appointments/services/appointments.service'
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function AppointmentsPage() {
    const appointments = await getAppointments()

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
                    Citas Agendadas
                </h1>
                <p className="text-sky-600/70 mt-1">Gestión de citas confirmadas por el asistente virtual</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {appointments.length === 0 ? (
                    <div className="col-span-full glass-card p-12 text-center text-sky-600/50">
                        No hay citas programadas para estas fechas.
                    </div>
                ) : (
                    appointments.map((apt) => (
                        <div key={apt.id} className="glass-card p-6 flex gap-6 hover:border-sky-300 transition-all group">
                            {/* Date Box */}
                            <div className="flex-shrink-0 w-16 h-20 bg-sky-100 rounded-2xl flex flex-col items-center justify-center group-hover:bg-sky-500 transition-colors">
                                <span className="text-xs font-bold text-sky-500 uppercase group-hover:text-white">
                                    {format(new Date(apt.scheduled_at), "MMM", { locale: es })}
                                </span>
                                <span className="text-2xl font-black text-sky-900 group-hover:text-white">
                                    {format(new Date(apt.scheduled_at), "d")}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-sky-900">{apt.leads.name || 'Cita de Lead'}</h3>
                                        <div className="flex items-center gap-2 text-sm text-sky-600/70">
                                            <Clock className="h-4 w-4" />
                                            {format(new Date(apt.scheduled_at), "HH:mm 'h' - EEEE", { locale: es })}
                                        </div>
                                    </div>
                                    <span className={`glass-badge ${apt.status === 'completed' ? 'glass-badge-success' :
                                            apt.status === 'cancelled' ? 'glass-badge-danger' :
                                                apt.status === 'no_show' ? 'glass-badge-warning' :
                                                    'glass-badge-sky'
                                        }`}>
                                        {apt.status === 'scheduled' ? 'Programada' :
                                            apt.status === 'completed' ? 'Completada' :
                                                apt.status === 'cancelled' ? 'Cancelada' :
                                                    apt.status === 'no_show' ? 'No asistió' :
                                                        apt.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-sky-100">
                                    <div className="flex items-center gap-2 text-xs text-sky-700 font-medium">
                                        <User className="h-3 w-3 text-sky-400" />
                                        {apt.leads.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-sky-700 font-medium">
                                        <Clock className="h-3 w-3 text-sky-400" />
                                        {apt.duration_minutes} min de duración
                                    </div>
                                </div>

                                {apt.notes && (
                                    <p className="text-sm text-sky-600/70 bg-sky-50/50 p-3 rounded-lg border border-sky-100 italic line-clamp-2">
                                        "{apt.notes}"
                                    </p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

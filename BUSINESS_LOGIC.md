# 📋 BUSINESS_LOGIC.md - LeadCapture AI (Asistente Virtual para Paralegales)

> Generado por SaaS Factory | Fecha: 2026-01-22
> Actualizado: Arquitectura con Retell.ai

## 1. Problema de Negocio

**Dolor:** Los paralegales (preparadores de impuestos, preparadores de documentos de inmigración), abogados de inmigración y abogados civiles pierden muchos clientes al no poder responder todas las llamadas o mensajes por SMS/WhatsApp. Esto ocurre diariamente, especialmente fuera del horario laboral y durante citas. Muchas veces ni siquiera saben cuántas llamadas pierden - es una "fuga invisible" de leads.

**Costo actual:**
- Valor promedio por cliente: ~$500
- Leads perdidos: 10-15 por mes
- **Pérdida mensual: $5,000 - $7,500 en oportunidades**

## 2. Solución

**Propuesta de valor:** Un asistente virtual que responde llamadas y mensajes 24/7, califica leads y agenda citas automáticamente para bufetes pequeños y paralegales.

**Flujo principal (Happy Path):**

### Canal VOZ (Retell.ai - Ya activo ✅)
1. **Lead llama** → Retell.ai responde 24/7
2. **Retell.ai califica** → Pregunta tipo de caso, urgencia
3. **Retell.ai agenda** → Accede al calendario y programa cita
4. **Webhook a tu app** → Recibe transcripción + datos del lead + cita

### Canal SMS (A construir)
1. **Lead envía SMS** → Twilio recibe y envía webhook
2. **Tu app procesa** → OpenAI genera respuesta contextual
3. **Califica y agenda** → Si califica, ofrece horarios del calendario
4. **Guarda en CRM** → Lead + conversación + cita

## 3. Usuario Objetivo

**Rol:** Paralegal independiente que prepara documentos de impuestos e inmigración, con 1-3 empleados, que no puede pagar un call center.

**Contexto:**
- Trabaja solo o con equipo muy pequeño
- No tiene recepcionista de tiempo completo
- Pierde leads durante citas o fuera de horario
- Necesita una solución asequible y automatizada

## 4. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        CANALES DE ENTRADA                        │
├─────────────────────────────┬───────────────────────────────────┤
│      📞 LLAMADAS            │           💬 SMS                   │
│      Retell.ai              │      Twilio + OpenAI              │
│   (YA CONFIGURADO ✅)        │      (A CONSTRUIR)                │
│                             │                                   │
│   • Responde 24/7           │   • Responde 24/7                 │
│   • Califica leads          │   • Califica leads                │
│   • Agenda citas            │   • Agenda citas                  │
│   • Genera transcripción    │   • Guarda conversación           │
└──────────────┬──────────────┴──────────────────┬────────────────┘
               │ webhook                          │ webhook
               ▼                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TU APP (Next.js + Supabase)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   📊 DASHBOARD                    👥 CRM                        │
│   • Métricas en tiempo real       • Leads y pipelines           │
│   • Llamadas vs SMS               • Estados (nuevo/calificado/  │
│   • Conversión rate                 convertido/perdido)         │
│   • Citas agendadas               • Historial de contacto       │
│                                                                 │
│   📝 TRANSCRIPCIONES              📅 CALENDARIO                 │
│   • De Retell.ai (voz)            • Sync con Google Calendar    │
│   • De SMS                        • Vista de citas              │
│   • Resumen por IA                • Disponibilidad              │
│                                                                 │
│   🔔 NOTIFICACIONES               📈 REPORTES                   │
│   • Email                         • Semanales                   │
│   • SMS al paralegal              • Mensuales                   │
│   • Push (futuro)                 • Exportación                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 5. Arquitectura de Datos

**Input:**
- Webhooks de Retell.ai (transcripciones, datos de llamada, citas)
- Webhooks de Twilio SMS (mensajes entrantes)
- Configuración del negocio (horarios, servicios, precios)
- Calendario (Google Calendar)

**Output:**
- Respuestas SMS automáticas (via Twilio)
- Notificaciones al paralegal (email, SMS)
- Dashboard con métricas
- Reportes exportables

**Storage (Supabase tables):**

```sql
-- Usuarios del sistema (paralegales)
users
  - id, email, name, phone, created_at

-- Configuración del negocio
businesses
  - id, user_id, name, services[], hours, timezone

-- Leads capturados
leads
  - id, business_id, name, phone, email
  - source (call | sms | whatsapp)
  - status (new | qualified | appointment | converted | lost)
  - case_type, urgency, notes
  - created_at, updated_at

-- Conversaciones (SMS)
sms_conversations
  - id, lead_id, messages[] (jsonb)
  - created_at, updated_at

-- Transcripciones de llamadas (Retell.ai)
call_transcripts
  - id, lead_id, retell_call_id
  - transcript, summary, duration
  - created_at

-- Citas agendadas
appointments
  - id, lead_id, datetime, duration
  - source (retell | sms)
  - google_event_id
  - status (scheduled | completed | cancelled | no_show)

-- Notificaciones enviadas
notifications
  - id, user_id, lead_id, type, channel, sent_at
```

## 6. KPIs de Éxito

**Métricas principales:**
1. Capturar el 90% de los leads que antes se perdían
2. Reducir llamadas perdidas de 15/mes a menos de 3
3. Agendar automáticamente 10+ citas al mes sin intervención humana

**Métricas secundarias:**
- Tiempo promedio de respuesta SMS (objetivo: <1 minuto)
- Tasa de calificación de leads
- Tasa de conversión lead → cita
- Tasa de no-show en citas

## 7. Especificación Técnica

### Integraciones Externas

| Servicio | Propósito | Estado |
|----------|-----------|--------|
| Retell.ai | Llamadas de voz + IA | ✅ Activo |
| Twilio | Número + SMS | ✅ Cuenta creada |
| OpenAI | IA para SMS | ✅ API Key |
| Google Calendar | Calendario | ⏳ Por integrar |
| Supabase | DB + Auth | ✅ Cuenta creada |

### Webhooks a Implementar

**Retell.ai → Tu App:**
```
POST /api/webhooks/retell
- call_ended: transcripción + datos del lead
- appointment_booked: datos de la cita
```

**Twilio → Tu App:**
```
POST /api/webhooks/twilio/sms
- Mensaje entrante del lead
- Tu app responde con TwiML o API
```

### Features a Implementar (Feature-First)

```
src/features/
├── auth/              # Autenticación Email/Password (Supabase)
├── onboarding/        # Wizard configuración inicial
├── leads/             # CRM - Gestión de leads y pipelines
├── calls/             # Recepción webhooks Retell.ai + transcripciones
├── sms/               # Chat SMS con IA (Twilio + OpenAI)
├── calendar/          # Integración Google Calendar
├── appointments/      # Gestión de citas
├── dashboard/         # Métricas y analytics
├── notifications/     # Alertas al paralegal
└── reports/           # Reportes semanales/mensuales
```

### MVP v1.0 - Scope Completo

| # | Feature | Prioridad | Complejidad |
|---|---------|-----------|-------------|
| 1 | Auth (Supabase) | Alta | Baja |
| 2 | Webhook Retell.ai | Alta | Media |
| 3 | CRM Leads | Alta | Media |
| 4 | Dashboard básico | Alta | Media |
| 5 | SMS IA (Twilio + OpenAI) | Alta | Alta |
| 6 | Google Calendar | Media | Media |
| 7 | Notificaciones email | Media | Baja |
| 8 | Transcripciones view | Media | Baja |
| 9 | Reportes | Baja | Media |

### Stack Confirmado

- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind 3.4 + shadcn/ui
- **Backend:** Supabase (Auth + Database + Edge Functions)
- **AI Voz:** Retell.ai (ya configurado)
- **AI SMS:** OpenAI API (GPT-4o)
- **SMS:** Twilio
- **Calendario:** Google Calendar API
- **Validación:** Zod
- **State:** Zustand
- **MCPs:** Next.js DevTools + Playwright + Supabase

### Próximos Pasos

1. [ ] Configurar Supabase (tablas + RLS)
2. [ ] Implementar Auth
3. [ ] Crear endpoint webhook para Retell.ai
4. [ ] Implementar CRM básico (leads + estados)
5. [ ] Crear dashboard con métricas
6. [ ] Integrar Twilio SMS + OpenAI
7. [ ] Integrar Google Calendar
8. [ ] Sistema de notificaciones
9. [ ] Vista de transcripciones
10. [ ] Testing E2E con Playwright
11. [ ] Deploy en Vercel

---

## 8. Consideraciones Adicionales

### Costos de Operación (Estimado mensual)
- **Retell.ai:** Según plan (voice minutes)
- **Twilio SMS:** ~$0.0079/mensaje × ~500 msgs = ~$4
- **OpenAI GPT-4o:** ~$0.01/request × ~500 = ~$5
- **Supabase:** Free tier o $25/mes Pro
- **Vercel:** Free tier o $20/mes Pro

### Seguridad
- RLS en todas las tablas (multi-tenant ready)
- Validar webhooks con signatures (Retell + Twilio)
- No exponer API keys en frontend
- Rate limiting en endpoints públicos

---

*"La voz ya está capturada. Ahora construyamos el cerebro que la procesa."*

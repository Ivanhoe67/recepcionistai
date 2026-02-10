# 🚀 Support Chat - Guía Rápida de Activación

## ⚡ 5 Pasos para Activar el Chat de Soporte

### 1️⃣ Aplicar Migración de Base de Datos

```bash
cd "d:\SaaS Factory Proyectos\recepcionistai"
supabase db push
```

Si no tienes Supabase CLI instalado:
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_ID
supabase db push
```

**Alternativa**: Copia y pega el contenido de `supabase/migrations/009_support_chat_schema.sql` en Supabase Dashboard → SQL Editor.

---

### 2️⃣ Regenerar Types de Supabase

```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
```

O si usas local:
```bash
npx supabase gen types typescript --local > src/lib/supabase/types.ts
```

---

### 3️⃣ Agregar API Keys

Copia `.env.local.example` a `.env.local` y agrega:

```bash
# Obtener en https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-xxxxxx

# Obtener en https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-xxxxxx
```

**Nota**: OpenRouter da $5 de crédito gratis. OpenAI requiere tarjeta pero el costo es mínimo (<$1/mes).

---

### 4️⃣ (Opcional) Agregar Documentación Inicial

Ejecuta en Supabase SQL Editor:

```sql
INSERT INTO support_resources (title, content, category) VALUES
(
  'Cómo funciona RecepcionistAI',
  'RecepcionistAI es un asistente virtual que responde SMS automáticamente 24/7. Captura leads, califica clientes, y ayuda a agendar citas. Funciona con Twilio para SMS y Retell.ai para llamadas.',
  'general'
),
(
  'Configuración de Twilio',
  'Para configurar Twilio: 1. Crea una cuenta en twilio.com. 2. Compra un número de teléfono. 3. En RecepcionistAI, ve a Settings. 4. Ingresa Account SID, Auth Token, y tu número. 5. Configura el webhook.',
  'setup'
),
(
  'Planes y Precios',
  'Ofrecemos 3 planes: Starter ($49/mes, 500 SMS), Professional ($149/mes, 2000 SMS), Business ($299/mes, 5000 SMS). Todos incluyen AI Agent 24/7, Analytics completo, y soporte multi-negocio.',
  'billing'
);
```

---

### 5️⃣ Reiniciar Servidor y Probar

```bash
# Detener servidor actual (Ctrl+C)
npm run dev
```

Luego:
1. Abre http://localhost:3000/dashboard
2. Busca el botón flotante en esquina inferior derecha
3. Clic para abrir chat
4. Escribe "¿Qué es RecepcionistAI?"
5. ¡Deberías recibir respuesta del AI!

---

## ✅ Checklist de Verificación

- [ ] Migración aplicada (supabase db push)
- [ ] Types regenerados
- [ ] API keys agregadas a .env.local
- [ ] Servidor reiniciado
- [ ] Widget aparece en dashboard
- [ ] Chat responde preguntas
- [ ] Botón "Hablar con Humano" funciona
- [ ] Analytics dashboard muestra datos

---

## 🐛 Troubleshooting

### "Unauthorized" al abrir chat
→ Verifica que estás logged in en la app

### "Internal server error" al enviar mensaje
→ Verifica que `OPENROUTER_API_KEY` está en `.env.local`

### Widget no aparece
→ Limpia cache: `rm -rf .next` y `npm run dev`

### TypeScript errors
→ Regenera types: `supabase gen types typescript...`

---

## 📚 Documentación Completa

Ver `SUPPORT_CHAT_IMPLEMENTATION.md` para:
- Arquitectura detallada
- Todas las features
- Costos estimados
- Roadmap futuro
- Tips de uso

---

## 🎯 Siguiente Paso

Una vez activado, revisa las métricas en:
`http://localhost:3000/admin/support-analytics`

(Necesitas ser admin - verifica `is_admin` en tu user)

---

**¿Todo listo?** ¡A sorprender a tus usuarios con soporte AI 24/7! 🚀

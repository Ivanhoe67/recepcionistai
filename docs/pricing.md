# Precios y límites – Lead Capture AI

> **Alcance:** Lanzamiento con ~5 clientes. Estos precios y límites se pueden cambiar más adelante cuando se definan los precios finales (ej. $199 WhatsApp, $299 Voz, $499 bundle).

---

## Tabla de precios (lanzamiento)

| Plan      | Precio   | Mensajes incluidos | Minutos incluidos | Sobreuso mensaje | Sobreuso minuto |
|-----------|----------|--------------------|-------------------|------------------|------------------|
| **Basic** | $49/mes  | **800**            | —                 | **$0.04**        | —                |
| **Pro**   | $149/mes | —                  | **250**           | —                | **$0.25**        |
| **Premium** | $249/mes | **800**          | **350**           | **$0.04**        | **$0.25**        |

- **Basic:** solo WhatsApp (+ CRM, transcripciones, métricas).
- **Pro:** solo Voz Retell (+ CRM, transcripciones, métricas).
- **Premium:** WhatsApp + Voz (+ CRM unificado, métricas, transcripciones de ambos canales).

Los límites son **por mes** (ciclo de facturación). El sobreuso se cobra por unidad extra una vez superado el incluido.

---

## Límites de producto (lanzamiento)

- 1 negocio / 1 ubicación por plan (más ubicaciones = add-on o plan superior).
- 1 número/canal por plan (1 WhatsApp en Basic/Premium, 1 línea de voz en Pro/Premium).
- Leads: Basic 100/mes, Pro 200/mes, Premium sin límite (según `max_leads_monthly` en BD).

---

## Para implementación (Stripe + backend)

### Valores de sobreuso (usar en Stripe metered billing o facturación manual)

| Concepto              | Valor (USD) | En centavos (BD) |
|-----------------------|-------------|-------------------|
| Por mensaje extra     | $0.04       | 4                 |
| Por minuto extra voz  | $0.25       | 25                |

- En base de datos: `subscription_plans.overage_per_message_cents` y `subscription_plans.overage_per_minute_cents` (ver migración `007_pricing_limits_and_overage.sql`).
- Uso actual: `subscription_usage.messages_used`, `subscription_usage.voice_minutes_used`.
- Límites por plan: `subscription_plans.max_messages_monthly`, `subscription_plans.max_voice_minutes_monthly`.

### Flujo sugerido cuando se implemente cobro de sobreuso

1. **Cada mes (o al cierre de periodo):** calcular  
   `messages_over = max(0, messages_used - max_messages_monthly)`  
   y  
   `minutes_over = max(0, voice_minutes_used - max_voice_minutes_monthly)`.
2. **Monto sobreuso:**  
   `overage_usd = (messages_over * overage_per_message_cents + minutes_over * overage_per_minute_cents) / 100`.
3. Cobrar vía **Stripe** (invoice item recurrente o metered usage según cómo se configure Stripe).

---

## Costes de referencia (para margen)

| Insumo     | Coste aprox. |
|------------|----------------|
| Voz (Retell) | ~$0.09–0.12/min |
| WhatsApp   | ~$0.01–0.02/msg |

Con los límites y sobreuso de la tabla, el coste variable del uso incluido queda en ~20–25% del precio del plan; el sobreuso está a ~2–2.5× coste para mantener margen.

---

## Cambios futuros (precios finales)

Cuando se pasen a los precios objetivo (ej. $199 / $299 / $499):

1. Actualizar precios en Stripe (Products/Prices) y en `subscription_plans` (price_monthly, price_yearly).
2. Ajustar si aplica límites y sobreuso en `subscription_plans` y en este doc.
3. Definir política para clientes de lanzamiento (mantener precio/límites o migrar con aviso).

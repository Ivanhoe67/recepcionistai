---
name: debug-exhaustivo
description: Protocolo de debugging exhaustivo. Verifica TODAS las posibles causas de un error y prueba las correcciones antes de pedir al usuario que pruebe. Evita iteraciones innecesarias.
---

# Debug Exhaustivo

## Purpose

Este skill asegura que cuando se reporta un error, Claude verifica TODAS las posibles causas y prueba las correcciones antes de pedir al usuario que pruebe de nuevo. Evita el ciclo frustrante de "prueba -> falla -> prueba -> falla".

## When to Use

Activa este skill cuando:
- El usuario reporta un error o bug
- Algo no funciona como se esperaba
- Hay que diagnosticar y corregir un problema
- Después de hacer cambios que podrían fallar

## Checklist de Debugging (OBLIGATORIO)

### 1. Variables de Entorno
```
□ Verificar que existen en Vercel/producción
□ Verificar que NO tienen caracteres \n al final
□ Verificar que los valores son correctos
□ Usar printf en vez de echo para evitar newlines
```

### 2. APIs Externas
```
□ Probar la API directamente con curl ANTES de desplegar
□ Verificar formato de request (headers, body)
□ Verificar formato de response
□ Verificar manejo de errores
```

### 3. Código
```
□ Verificar parsing de datos (fechas, números, strings)
□ Verificar manejo de timezones
□ Verificar try/catch en operaciones críticas
□ Agregar logging detallado
```

### 4. Despliegue
```
□ Verificar que los cambios se guardaron
□ Verificar que el deploy fue exitoso
□ Verificar que las env vars están actualizadas
```

### 5. ANTES de pedir al usuario que pruebe
```
□ Hacer una prueba manual completa del flujo
□ Verificar que la prueba fue exitosa
□ Si la prueba falla, investigar más ANTES de pedir ayuda
□ Limpiar datos de prueba
```

## Comandos Útiles

### Verificar env vars en Vercel (sin \n)
```bash
npx vercel env pull .env.check --environment production --yes
cat .env.check | findstr VARIABLE_NAME
# Buscar comillas con \n adentro = problema
```

### Corregir env var con \n
```bash
npx vercel env rm VARIABLE_NAME production --yes
printf "valor_sin_newline" | npx vercel env add VARIABLE_NAME production
```

### Probar API directamente
```bash
curl -s -X POST "URL" -H "Header: value" -d '{"json": "body"}'
```

## Regla de Oro

> **NUNCA pidas al usuario que pruebe hasta que TÚ hayas verificado que funciona.**

Si no puedes probar algo directamente, al menos:
1. Verifica todas las variables de entorno
2. Verifica el código tiene manejo de errores
3. Agrega logging detallado
4. Revisa los logs después del primer intento fallido

## Anti-Patrones a Evitar

- ❌ Desplegar y pedir que prueben sin verificar
- ❌ Asumir que las env vars están correctas
- ❌ Ignorar caracteres invisibles (\n, espacios)
- ❌ No probar APIs directamente cuando es posible
- ❌ Múltiples iteraciones de "prueba -> falla"

## Ejemplo de Flujo Correcto

1. Usuario reporta: "El booking no funciona"
2. Claude verifica env vars → Encuentra \n en CAL_TIMEZONE
3. Claude corrige env vars con printf
4. Claude prueba API directamente → Funciona
5. Claude despliega
6. Claude prueba el flujo completo → Funciona
7. Claude limpia datos de prueba
8. **Ahora sí** pide al usuario que pruebe

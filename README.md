# Ceuta decide · escucha ciudadana

Consulta ciudadana anónima. Web estática + dos funciones de Vercel + Supabase.

## Qué hay

| Archivo | Qué es |
|---|---|
| `index.html`, `estilos.css`, `app.js` | La web: portada, cuestionario, gracias, resultados y método |
| `preguntas.js` | El cuestionario v2 (33 preguntas). Lo usan la web y el servidor |
| `agregar.js` | Cálculo de resultados públicos. Nunca enseña grupos de menos de 15 |
| `api/enviar.js` | Recibe respuestas. No lee IP, cookies ni navegador |
| `api/resultados.js` | Devuelve solo agregados |
| `lib/db.js` | Conexión con Supabase desde el servidor |
| `supabase/esquema.sql` | Tablas en esquema privado + tres funciones protegidas por clave |

## Variables de entorno en Vercel

- `SUPABASE_URL` · dirección del proyecto
- `SUPABASE_KEY` · clave publicable
- `CD_CLAVE` · clave secreta que también está en `privado.ajustes`
- `RESULTADOS` · `completos` para publicar todo. Cualquier otro valor: solo participación

## Antes de abrir

- [ ] `BARRIOS` en `preguntas.js` con la lista cerrada
- [ ] `CONFIG` en `app.js`: promotor, correo y canal de WhatsApp
- [ ] Dominio propio en Vercel
- [ ] Una respuesta de prueba enviada y borrada

Vista de ejemplo de resultados con datos inventados: `/#resultados/ejemplo`

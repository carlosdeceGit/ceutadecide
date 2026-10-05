# Ceuta decide · escucha ciudadana

Consulta ciudadana anónima. Web estática + dos funciones de Vercel + Supabase.

## Qué hay

| Archivo | Qué es |
|---|---|
| `index.html`, `estilos.css`, `app.js` | La web: portada, cuestionario, gracias, resultados y método |
| `preguntas.js` | El cuestionario v2 (33 preguntas). Lo usan la web y el servidor |
| `agregar.js` | Cálculo de resultados públicos. Nunca enseña grupos de menos de 15 |
| `api/enviar.js` | Recibe respuestas. No lee IP, cookies ni navegador |
| `api/resultados.js` | Público: solo el número de participantes mientras `RESULTADOS` no sea `completos` |
| `api/admin.js` | Panel de administración: resultados completos y textos libres, con contraseña |
| `lib/db.js` | Conexión con Supabase desde el servidor |
| `supabase/esquema.sql` | Tablas en esquema privado + tres funciones protegidas por clave |

## Variables de entorno en Vercel

- `SUPABASE_URL` · dirección del proyecto
- `SUPABASE_KEY` · clave publicable
- `CD_CLAVE` · clave secreta que también está en `privado.ajustes`
- `ADMIN_CLAVE` · contraseña del panel de administración (`/#admin`)
- `RESULTADOS` · `completos` para publicar todo. Cualquier otro valor: los resultados solo se ven en el panel

## Antes de abrir

- [ ] `BARRIOS` en `preguntas.js` con la lista cerrada
- [ ] `CONFIG` en `app.js`: promotor, correo y canal de WhatsApp
- [ ] Dominio propio en Vercel
- [ ] Una respuesta de prueba enviada y borrada

Vista de ejemplo de resultados con datos inventados: `/#resultados/ejemplo`

## Despliegue actual (5 oct 2026)

- Producción: https://ceutadecide.vercel.app (región cdg1, París).
- Desplegado por API, sin GitHub. Imágenes, fuentes, `app.js` y `estilos.css` se sirven desde el bucket público `web` de Supabase a través de reescrituras de Vercel (el navegador nunca habla con Supabase).
- Si se conecta el repo de GitHub, los archivos del repo tienen prioridad sobre las reescrituras. En ese caso hay que dar de alta las variables de entorno, porque `lib/db.js` del repo no lleva claves.

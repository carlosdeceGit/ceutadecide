# Ceuta Decide · contexto para Claude Code

Encuesta ciudadana **anónima** para Ceuta, de cara a las Elecciones Generales del 29 de noviembre de 2026 y las elecciones en Ceuta del 23 de mayo de 2027. La promueve Por Ceuta (porceuta.es) junto a Ceuta Nos Une y el Foro Ciudadano de Apoyo a Ceuta y Melilla. No pertenece a ninguna entidad política. Contacto: hola@porceuta.es.

## Estado a 5 de octubre de 2026

- **En producción:** https://ceutadecide.vercel.app (proyecto Vercel `ceutadecide`, equipo `carlos-7014s-projects`).
- **Cómo se desplegó:** por la API de Vercel, sin GitHub. Por eso aquella versión sirve imágenes, fuentes, `app.js` y `estilos.css` desde el bucket `web` de Supabase mediante reescrituras, y lleva las claves como valor por defecto en el código del servidor.
- **Este repositorio:** es la versión limpia. Sin reescrituras, sin claves en el código y con todos los archivos dentro. Incluye además un bloque nuevo, "Quiénes somos y para qué sirve esto", que todavía no está en producción.
- **GitHub:** repo `carlosdeceGit/ceutadecide`, vacío hasta ahora.
- **Supabase:** proyecto `erzalqrqeigprnbslfka` (UE, Irlanda). El esquema de `supabase/esquema.sql` ya está aplicado y la clave del servidor ya está dada de alta.

## Tareas pendientes, en este orden

1. Subir este repo a `github.com/carlosdeceGit/ceutadecide`, rama `main`.
2. Conectar el proyecto de Vercel `ceutadecide` a ese repo, en Settings → Git.
3. Crear en Vercel las variables de entorno de `.env.local` para Production y Preview. Marca `CD_CLAVE` y `ADMIN_CLAVE` como Sensitive. **Nunca subas `.env.local` a GitHub.**
4. Desplegar desde `main` y comprobar:
   - `/` carga, imágenes y fuentes incluidas.
   - `/api/resultados` devuelve `{"n":…,"modo":"cerrado"}`.
   - Una respuesta de prueba completa llega a la base de datos.
   - `/#admin` entra con `ADMIN_CLAVE` y rechaza una contraseña incorrecta.
   - Después, borrar la respuesta de prueba.
5. Ejecutar `supabase/limpieza.sql`: borra la prueba técnica del 5 de octubre y la política temporal de Storage.
6. Con todo funcionando desde GitHub, vaciar y borrar el bucket `web` de Supabase, que ya no hace falta.
7. Dominio propio, si se compra: Vercel → Settings → Domains.

## Arquitectura

| Archivo | Qué hace |
|---|---|
| `index.html`, `estilos.css`, `app.js` | La web: portada, inicio, cuestionario por pasos, gracias, método con ficha técnica, resultados y panel de admin (`#admin`) |
| `preguntas.js` | El cuestionario (39 preguntas, 7 bloques, una bifurcación en la 11). La web y el servidor validan con el mismo archivo |
| `agregar.js` | Calcula los resultados. No devuelve nunca filas sueltas ni grupos de menos de 15 |
| `api/enviar.js` | Recibe las respuestas. Valida, borra teléfonos, correos y DNI de los textos, y marca como `rapida` lo contestado en menos de 120 segundos |
| `api/resultados.js` | Público. Solo devuelve el número de participantes mientras `RESULTADOS` no valga `completos`. Tiene la veda electoral automática |
| `api/admin.js` | Resultados completos y textos libres, solo con `ADMIN_CLAVE` |
| `lib/db.js` | Llama a Supabase desde el servidor, nunca desde el navegador |
| `supabase/esquema.sql` | Esquema `privado` (no expuesto) y funciones `cd_*` protegidas por clave |

## Reglas que no se pueden romper

- **No se recoge ningún dato personal.** Nada de nombre, teléfono, correo ni IP. Tampoco cookies, analítica, píxeles, CDNs externos ni Google Fonts. Todo se sirve desde el propio dominio.
- **El navegador no habla nunca con Supabase.** Todo pasa por `/api/*`.
- **Los textos libres van en otra tabla**, sin nada que los una a una respuesta.
- **Mínimo de 15 respuestas** para publicar cualquier grupo o cruce, y 30 en total.
- **Veda electoral (art. 69 de la LOREG):** no se publica opinión del 24 al 29 de noviembre de 2026 ni del 18 al 23 de mayo de 2027. Ya está programado en `api/resultados.js`.
- **Ficha técnica:** cualquier resultado que se publique lleva la de la página de método.
- **Lenguaje de la web:** sencillo y cercano, sin tono de IA ni de marketing.

## Pruebas en local

No hay paso de compilación. Para probar con la base de datos de verdad:

```
npx vercel dev
```

Usa las variables de `.env.local`. Antes de publicar, recorre la encuesta entera por las dos ramas de la pregunta 11, en móvil (390 px) y escritorio, en tema claro y oscuro.

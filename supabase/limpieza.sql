-- Ejecutar una vez, en el editor SQL de Supabase.
-- 1) Borra la respuesta de prueba técnica del 5 de octubre de 2026.
delete from privado.textos where texto ilike 'prueba técnica%';
delete from privado.respuestas where segundos = 5 and calidad = 'rapida';
-- 2) Quita la política temporal usada para subir imágenes al bucket «web».
drop policy if exists "subida_temporal_web" on storage.objects;
-- 3) Cuando la web se despliegue desde GitHub, el bucket «web» ya no hace falta.
--    Se puede vaciar y borrar desde el panel de Storage.

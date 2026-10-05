-- Ceuta decide · esquema de base de datos
-- Las tablas viven en un esquema que la API pública no expone.
-- Solo se entra por tres funciones, y las tres exigen la clave del servidor.

create schema if not exists privado;
revoke all on schema privado from public, anon, authenticated;

-- Respuestas cerradas. Sin IP, sin navegador, hora redondeada a la hora.
create table if not exists privado.respuestas (
  id        uuid primary key default gen_random_uuid(),
  hora      timestamptz not null default date_trunc('hour', now()),
  version   text not null,
  datos     jsonb not null,
  segundos  integer,
  calidad   text not null default 'normal'
);

-- Textos libres, separados: no hay columna que los una a una respuesta.
create table if not exists privado.textos (
  id          uuid primary key default gen_random_uuid(),
  dia         date not null default current_date,
  pregunta    text not null,
  texto       text not null,
  citable     boolean,
  barrio      text,                      -- solo en la pregunta 19 (sitio concreto)
  revisado    boolean not null default false,
  publicable  boolean not null default false
);

create table if not exists privado.ajustes (clave text not null);

alter table privado.respuestas enable row level security;
alter table privado.textos     enable row level security;
alter table privado.ajustes    enable row level security;

create or replace function privado.clave_ok(p text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from privado.ajustes where clave = p);
$$;

create or replace function public.cd_enviar(
  p_clave text, p_datos jsonb, p_textos jsonb, p_segundos integer, p_calidad text, p_version text
) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  if not privado.clave_ok(p_clave) then raise exception 'no autorizado'; end if;
  insert into privado.respuestas (version, datos, segundos, calidad)
  values (p_version, p_datos, p_segundos, coalesce(p_calidad, 'normal'));
  insert into privado.textos (pregunta, texto, citable, barrio)
  select t->>'pregunta', left(t->>'texto', 600), (t->>'citable')::boolean, t->>'barrio'
  from jsonb_array_elements(coalesce(p_textos, '[]'::jsonb)) as t
  where coalesce(t->>'texto', '') <> '';
  return true;
end $$;

create or replace function public.cd_datos(p_clave text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not privado.clave_ok(p_clave) then raise exception 'no autorizado'; end if;
  return jsonb_build_object('filas',
    coalesce((select jsonb_agg(datos || jsonb_build_object('_c', calidad)) from privado.respuestas), '[]'::jsonb));
end $$;

-- Palabras de la pregunta 1 que repiten al menos cinco personas.
create or replace function public.cd_palabras(p_clave text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not privado.clave_ok(p_clave) then raise exception 'no autorizado'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('w', w, 'n', c) order by c desc)
    from (select lower(texto) w, count(*) c from privado.textos
          where pregunta = 'p1' group by 1 having count(*) >= 5) s
  ), '[]'::jsonb);
end $$;

revoke all on function public.cd_enviar, public.cd_datos, public.cd_palabras from public;
grant execute on function public.cd_enviar, public.cd_datos, public.cd_palabras to anon;
revoke all on function privado.clave_ok from public, anon, authenticated;

-- Textos libres para el panel de administración (lectura y moderación).
create or replace function public.cd_textos(p_clave text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  if not privado.clave_ok(p_clave) then raise exception 'no autorizado'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('pregunta', pregunta, 'texto', texto, 'citable', citable,
                     'barrio', barrio, 'dia', dia) order by dia desc, pregunta)
    from privado.textos where pregunta <> 'p1'
  ), '[]'::jsonb);
end $$;
revoke all on function public.cd_textos from public;
grant execute on function public.cd_textos to anon;

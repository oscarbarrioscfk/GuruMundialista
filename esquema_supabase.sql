-- =====================================================================
-- POLLA MUNDIAL 2026 — Esquema con dos niveles + Seguridad (RLS)
-- Cómo usar: Supabase → SQL Editor → New query → pegar todo → Run
-- =====================================================================
--
-- MODELO: una fila por persona Y por nivel.
--   - nivel = 'fan'    -> "Fan de la Sele" (predicción corta, Fase 2)
--   - nivel = 'fiebre' -> "Fiebre del Mundial" (predicción completa)
-- Una persona que juega ambos niveles tendrá DOS filas (mismo nickname).
-- Esto hace el guardado "solo-inserción": nadie edita filas -> mucho más seguro.
--
-- ⚠️ Si ya tienes una tabla 'predicciones' con datos de prueba, primero
--    elimínala o renómbrala (esto BORRA datos, hazlo solo si son de prueba):
--      drop table if exists public.predicciones;
-- =====================================================================


-- 1) TABLA --------------------------------------------------------------
create table if not exists public.predicciones (
  id           bigint generated always as identity primary key,
  usuario_real text        not null,
  nickname     text        not null,
  nivel        text        not null check (nivel in ('fan', 'fiebre')),
  payload      jsonb       not null,                 -- la predicción completa
  puntos       integer     not null default 0,       -- lo calcula el admin (Fase 4)
  created_at   timestamptz not null default now(),
  -- Un nickname es único DENTRO de cada nivel.
  -- (Para el ranking absoluto, usa el MISMO nickname en ambos niveles.)
  unique (nickname, nivel)
);


-- 2) LIMPIAR PERMISOS POR DEFECTO --------------------------------------
-- Supabase concede permisos amplios al rol anónimo en tablas nuevas.
-- Los quitamos para conceder solo lo estrictamente necesario.
revoke all on public.predicciones from anon;


-- 3) PERMISOS MÍNIMOS PARA EL ROL ANÓNIMO ------------------------------
-- LECTURA: solo las columnas necesarias para rankings y login.
--   OJO: NO incluye 'payload' -> nadie puede copiar las predicciones ajenas.
grant select (id, usuario_real, nickname, nivel, puntos, created_at)
  on public.predicciones to anon;

-- INSERCIÓN: solo estas columnas.
--   Al NO conceder 'puntos', el usuario no puede inflar su propio puntaje:
--   'puntos' siempre entra como 0 (su valor por defecto).
grant insert (usuario_real, nickname, nivel, payload)
  on public.predicciones to anon;


-- 4) ACTIVAR ROW LEVEL SECURITY ----------------------------------------
alter table public.predicciones enable row level security;


-- 5) POLÍTICAS ----------------------------------------------------------
-- Lectura pública (limitada a las columnas concedidas arriba).
create policy "lectura_publica"
  on public.predicciones
  for select
  to anon
  using (true);

-- Inserción de la propia predicción.
create policy "insertar_prediccion"
  on public.predicciones
  for insert
  to anon
  with check (true);

-- NO creamos políticas de UPDATE ni DELETE.
-- Con RLS activo y sin políticas para esas operaciones, quedan PROHIBIDAS
-- para el rol anónimo. El scoring (Fase 4) lo harás con la 'service_role'
-- key (solo en el panel de administración, NUNCA en el navegador público),
-- que omite RLS de forma segura.


-- =====================================================================
-- NOTA SOBRE LÍMITES DE ESTE MODELO (sin login real):
-- Como no hay autenticación, no se puede impedir al 100% que alguien
-- escriba el nombre real o el nickname de otra persona. La unicidad por
-- nivel evita duplicados y el resto del diseño evita los riesgos graves
-- (borrar, editar o inflar puntajes ajenos). Para una polla entre un
-- grupo conocido (Colombia Programa) esto es suficiente y seguro.
-- =====================================================================

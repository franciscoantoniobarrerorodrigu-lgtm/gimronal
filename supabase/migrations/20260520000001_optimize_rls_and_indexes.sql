-- ====================================================================
-- OPTIMIZACIÓN DE SEGURIDAD Y RENDIMIENTO
-- Descripción: Añade índices a las claves foráneas de gimnasio_id 
-- y reescribe las políticas de RLS para evitar llamadas recursivas a funciones PL/pgSQL.
-- ====================================================================

-- 1. Crear índices en columnas foreign key críticas para evitar Sequential Scans
CREATE INDEX IF NOT EXISTS idx_clientes_gimnasio_id ON public.clientes(gimnasio_id);
CREATE INDEX IF NOT EXISTS idx_planes_gimnasio_id ON public.planes(gimnasio_id);
CREATE INDEX IF NOT EXISTS idx_perfiles_gimnasio_id ON public.perfiles(gimnasio_id);

-- 2. Actualizar las políticas para eliminar la llamada a la función PL/pgSQL
-- y usar comparaciones de JWT rápidas y subconsultas no correlacionadas
-- que Postgres puede ejecutar una sola vez (One-Time Filters).

-- Tabla: clientes
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.clientes;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.clientes
FOR ALL TO authenticated
USING (
  -- Superadmin tiene acceso a todo (verificación de JWT sin consultar base de datos)
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR 
  -- Admin / Entrenador (busca su gym_id en el JWT, si no está hace fallback de una sola vez)
  gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR 
  gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- Tabla: planes
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.planes;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.planes
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR 
  gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR 
  gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- Tabla: perfiles
-- Evitamos la autoreferencia en perfiles haciendo check solo contra el JWT del usuario autenticado,
-- lo cual además es ultra rápido y seguro.
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.perfiles;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.perfiles
FOR ALL TO authenticated
USING (
  id = auth.uid()
  OR coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') IN ('admin', 'entrenador')
    AND gimnasio_id = (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid
  )
)
WITH CHECK (
  id = auth.uid()
  OR coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') IN ('admin', 'entrenador')
    AND gimnasio_id = (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid
  )
);

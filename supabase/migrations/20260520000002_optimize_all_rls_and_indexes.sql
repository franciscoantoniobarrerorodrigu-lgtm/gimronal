-- ====================================================================
-- OPTIMIZACIÓN GLOBAL DE SEGURIDAD Y RENDIMIENTO DE BASE DE DATOS
-- Descripción: Añade índices a las claves foráneas de gimnasio_id en las tablas restantes
-- y reescribe todas las políticas de RLS de las tablas de negocio para evitar
-- subconsultas repetitivas N+1 usando el token JWT de Supabase.
-- ====================================================================

-- 1. Crear índices en columnas fk críticas para evitar Sequential Scans
CREATE INDEX IF NOT EXISTS idx_membresias_gimnasio_id ON public.membresias(gimnasio_id);
CREATE INDEX IF NOT EXISTS idx_pagos_gimnasio_id ON public.pagos(gimnasio_id);
CREATE INDEX IF NOT EXISTS idx_exoneraciones_gimnasio_id ON public.exoneraciones(gimnasio_id);
CREATE INDEX IF NOT EXISTS idx_medidas_gimnasio_id ON public.medidas(gimnasio_id);
CREATE INDEX IF NOT EXISTS idx_notas_medicas_gimnasio_id ON public.notas_medicas(gimnasio_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_gimnasio_id ON public.movimientos_caja(gimnasio_id);

-- 2. Asistencia
DROP POLICY IF EXISTS "Asistencia: gym access" ON public.asistencia;
DROP POLICY IF EXISTS "gym_or_saas_access" ON public.asistencia;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.asistencia
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 3. Productos
DROP POLICY IF EXISTS "Productos: gym access" ON public.productos;
DROP POLICY IF EXISTS "gym_or_saas_access" ON public.productos;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.productos
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 4. Ventas
DROP POLICY IF EXISTS "Ventas: gym access" ON public.ventas;
DROP POLICY IF EXISTS "gym_or_saas_access" ON public.ventas;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.ventas
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 5. Cajas
DROP POLICY IF EXISTS "Cajas: gym access" ON public.cajas;
DROP POLICY IF EXISTS "gym_or_saas_access" ON public.cajas;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.cajas
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 6. Pagos
DROP POLICY IF EXISTS "Pagos: gym access via cliente" ON public.pagos;
DROP POLICY IF EXISTS "gym_or_saas_access" ON public.pagos;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.pagos
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 7. Membresias
DROP POLICY IF EXISTS "Membresias: gym access via cliente" ON public.membresias;
DROP POLICY IF EXISTS "gym_or_saas_access" ON public.membresias;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.membresias
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 8. Medidas
DROP POLICY IF EXISTS "Medidas: gym access via cliente" ON public.medidas;
DROP POLICY IF EXISTS "gym_or_saas_access" ON public.medidas;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.medidas
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 9. Clases
DROP POLICY IF EXISTS "Clases: gym access" ON public.clases;
DROP POLICY IF EXISTS "gym_or_saas_access" ON public.clases;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.clases
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 10. Inscripciones Clases
DROP POLICY IF EXISTS "Inscripciones: gym access via clase" ON public.inscripciones_clases;
DROP POLICY IF EXISTS "gym_or_saas_access" ON public.inscripciones_clases;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.inscripciones_clases
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 11. Movimientos Caja
DROP POLICY IF EXISTS "gym_or_saas_access" ON public.movimientos_caja;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.movimientos_caja
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 12. Notas Médicas
DROP POLICY IF EXISTS "gym_or_saas_access" ON public.notas_medicas;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.notas_medicas
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 13. Entrenadores
DROP POLICY IF EXISTS "gym_or_saas_access" ON public.entrenadores;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.entrenadores
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 14. Exoneraciones
DROP POLICY IF EXISTS "gym_or_saas_access" ON public.exoneraciones;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.exoneraciones
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 15. Historial Ajustes Días
DROP POLICY IF EXISTS "gym_or_saas_access" ON public.historial_ajustes_dias;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.historial_ajustes_dias
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 16. Gimnasios (clave primaria 'id' en lugar de 'gimnasio_id')
DROP POLICY IF EXISTS "Gimnasios: access own gym" ON public.gimnasios;
DROP POLICY IF EXISTS "gym_or_saas_read" ON public.gimnasios;
DROP POLICY IF EXISTS "gym_or_saas_write" ON public.gimnasios;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.gimnasios
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

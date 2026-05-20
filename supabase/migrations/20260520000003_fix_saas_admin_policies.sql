-- ====================================================================
-- CORRECCIÓN DE POLÍTICAS DE RLS PARA SAAS ADMIN
-- Descripción: Permite a usuarios que tienen is_saas_admin = true en perfiles
-- acceder a todos los gimnasios y datos del sistema (bypass de aislamiento).
-- ====================================================================

-- 1. Clientes
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.clientes;
DROP POLICY IF EXISTS "gym_or_saas_access" ON public.clientes;
DROP POLICY IF EXISTS "Clientes: staff access by gym" ON public.clientes;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.clientes
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 2. Planes
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.planes;
DROP POLICY IF EXISTS "gym_or_saas_access" ON public.planes;
DROP POLICY IF EXISTS "Planes: gym access" ON public.planes;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.planes
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 3. Perfiles
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.perfiles;
DROP POLICY IF EXISTS "Perfiles: gym access" ON public.perfiles;
DROP POLICY IF EXISTS "SaaS Superadmin access" ON public.perfiles;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.perfiles
FOR ALL TO authenticated
USING (
  id = auth.uid()
  OR coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') IN ('admin', 'entrenador')
    AND gimnasio_id = (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid
  )
)
WITH CHECK (
  id = auth.uid()
  OR coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') IN ('admin', 'entrenador')
    AND gimnasio_id = (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid
  )
);

-- 4. Asistencia
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.asistencia;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.asistencia
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 5. Productos
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.productos;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.productos
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 6. Ventas
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.ventas;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.ventas
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 7. Cajas
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.cajas;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.cajas
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 8. Pagos
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.pagos;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.pagos
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 9. Membresias
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.membresias;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.membresias
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 10. Medidas
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.medidas;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.medidas
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 11. Clases
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.clases;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.clases
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 12. Inscripciones Clases
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.inscripciones_clases;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.inscripciones_clases
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 13. Movimientos Caja
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.movimientos_caja;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.movimientos_caja
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 14. Notas Médicas
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.notas_medicas;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.notas_medicas
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 15. Entrenadores
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.entrenadores;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.entrenadores
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 16. Exoneraciones
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.exoneraciones;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.exoneraciones
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 17. Historial Ajustes Días
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.historial_ajustes_dias;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.historial_ajustes_dias
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

-- 18. Gimnasios (clave primaria 'id' en lugar de 'gimnasio_id')
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.gimnasios;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.gimnasios
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR EXISTS (SELECT 1 FROM public.perfiles p WHERE p.id = auth.uid() AND p.is_saas_admin = true)
  OR id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    (SELECT p.gimnasio_id FROM public.perfiles p WHERE p.id = auth.uid())
  )
);

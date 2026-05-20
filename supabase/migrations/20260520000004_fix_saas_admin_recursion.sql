-- ====================================================================
-- SOLUCIÓN DE RECURSIÓN INFINITA EN POLÍTICAS RLS
-- Descripción: Redefine las funciones helper como STABLE SECURITY DEFINER
-- para consultar perfiles sin activar RLS y evitar recursión infinita,
-- manteniendo la máxima velocidad y permitiendo el acceso a SaaS Admins.
-- ====================================================================

-- 1. Redefinir check_is_saas_admin como STABLE SECURITY DEFINER (ejecuta como superusuario, sin RLS)
CREATE OR REPLACE FUNCTION public.check_is_saas_admin()
RETURNS boolean AS $$
BEGIN
  RETURN COALESCE(
    (SELECT is_saas_admin FROM public.perfiles WHERE id = auth.uid() LIMIT 1),
    false
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Redefinir get_my_gym_id como STABLE SECURITY DEFINER (ejecuta como superusuario, sin RLS)
CREATE OR REPLACE FUNCTION public.get_my_gym_id()
RETURNS uuid AS $$
  SELECT gimnasio_id FROM public.perfiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Clientes
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.clientes;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.clientes
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
);

-- 4. Planes
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.planes;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.planes
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
);

-- 5. Perfiles
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.perfiles;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.perfiles
FOR ALL TO authenticated
USING (
  id = auth.uid()
  OR coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') IN ('admin', 'entrenador')
    AND gimnasio_id = coalesce(
      (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
      get_my_gym_id()
    )
  )
)
WITH CHECK (
  id = auth.uid()
  OR coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') IN ('admin', 'entrenador')
    AND gimnasio_id = coalesce(
      (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
      get_my_gym_id()
    )
  )
);

-- 6. Asistencia
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.asistencia;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.asistencia
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
);

-- 7. Productos
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.productos;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.productos
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
);

-- 8. Ventas
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.ventas;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.ventas
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
);

-- 9. Cajas
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.cajas;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.cajas
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
);

-- 10. Pagos
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.pagos;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.pagos
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
);

-- 11. Membresias
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.membresias;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.membresias
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
);

-- 12. Medidas
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.medidas;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.medidas
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
);

-- 13. Clases
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.clases;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.clases
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
);

-- 14. Inscripciones Clases
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.inscripciones_clases;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.inscripciones_clases
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
);

-- 15. Movimientos Caja
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.movimientos_caja;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.movimientos_caja
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
);

-- 16. Notas Médicas
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.notas_medicas;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.notas_medicas
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
);

-- 17. Entrenadores
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.entrenadores;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.entrenadores
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
);

-- 18. Exoneraciones
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.exoneraciones;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.exoneraciones
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
);

-- 19. Historial Ajustes Días
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.historial_ajustes_dias;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.historial_ajustes_dias
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR gimnasio_id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
);

-- 20. Gimnasios (clave primaria 'id' en lugar de 'gimnasio_id')
DROP POLICY IF EXISTS "Aislamiento SaaS por Gimnasio" ON public.gimnasios;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON public.gimnasios
FOR ALL TO authenticated
USING (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
)
WITH CHECK (
  coalesce(auth.jwt() -> 'user_metadata' ->> 'rol', '') = 'superadmin'
  OR check_is_saas_admin()
  OR id = coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'gimnasio_id')::uuid,
    get_my_gym_id()
  )
);

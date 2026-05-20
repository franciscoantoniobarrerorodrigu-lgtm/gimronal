-- ====================================================================
-- MIGRACIÓN DE SEGURIDAD: Aislamiento de Inquilinos (Tenant Isolation)
-- Descripción: Protege los datos asegurando que un administrador solo 
-- pueda ver la información de su propio gimnasio.
-- ====================================================================

-- 1. Crear función segura para verificar acceso al gimnasio
CREATE OR REPLACE FUNCTION public.has_access_to_gym(target_gym_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_role public.user_role;
  v_user_gym_id UUID;
BEGIN
  -- Obtener el rol y el ID del gimnasio al que pertenece el usuario autenticado
  SELECT rol, gimnasio_id INTO v_user_role, v_user_gym_id
  FROM public.perfiles
  WHERE id = auth.uid();

  -- Si es superadmin (dueño del SaaS), puede ver todos los gimnasios
  IF v_user_role = 'superadmin' THEN
    RETURN TRUE;
  END IF;

  -- Si es admin o entrenador, solo puede ver datos que coincidan con su propio gimnasio
  IF v_user_role IN ('admin', 'entrenador') AND target_gym_id = v_user_gym_id THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Aplicar la política estricta a las tablas principales que tienen 'gimnasio_id'

-- Tabla: clientes
DROP POLICY IF EXISTS "Admins tienen acceso total" ON clientes;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON clientes
FOR ALL TO authenticated
USING (public.has_access_to_gym(gimnasio_id))
WITH CHECK (public.has_access_to_gym(gimnasio_id));

-- Tabla: planes
DROP POLICY IF EXISTS "Admins tienen acceso total" ON planes;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON planes
FOR ALL TO authenticated
USING (public.has_access_to_gym(gimnasio_id))
WITH CHECK (public.has_access_to_gym(gimnasio_id));

-- Tabla: sedes
DROP POLICY IF EXISTS "Admins tienen acceso total" ON sedes;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON sedes
FOR ALL TO authenticated
USING (public.has_access_to_gym(gimnasio_id))
WITH CHECK (public.has_access_to_gym(gimnasio_id));

-- Tabla: empresas_convenio
DROP POLICY IF EXISTS "Admins tienen acceso total" ON empresas_convenio;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON empresas_convenio
FOR ALL TO authenticated
USING (public.has_access_to_gym(gimnasio_id))
WITH CHECK (public.has_access_to_gym(gimnasio_id));


-- 3. Para la tabla 'perfiles' en sí misma, los admins solo pueden ver los perfiles de su propio gimnasio
DROP POLICY IF EXISTS "Admins tienen acceso total" ON perfiles;
CREATE POLICY "Aislamiento SaaS por Gimnasio" ON perfiles
FOR ALL TO authenticated
USING (public.has_access_to_gym(gimnasio_id))
WITH CHECK (public.has_access_to_gym(gimnasio_id));

-- Nota Importante: Para las tablas secundarias (como 'membresias', 'pagos', 'asistencia') 
-- que no tienen 'gimnasio_id' directo, la mejor práctica en SaaS es heredar el acceso 
-- a través de la tabla principal (ej. clientes) o agregar la columna 'gimnasio_id' a todas las tablas.
-- Como paso inicial, esto asegura la barrera principal.

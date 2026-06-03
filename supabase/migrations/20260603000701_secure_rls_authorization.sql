-- Harden authorization by removing all RLS dependence on user-editable
-- auth.user_metadata claims. Authorization now comes from public.perfiles.

CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.current_user_is_saas_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.perfiles p
    WHERE p.id = (select auth.uid())
      AND coalesce(p.activo, true) = true
      AND (
        coalesce(p.is_saas_admin, false) = true
        OR p.rol::text = 'superadmin'
      )
  );
$$;

CREATE OR REPLACE FUNCTION private.current_user_gym_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT p.gimnasio_id
  FROM public.perfiles p
  WHERE p.id = (select auth.uid())
    AND coalesce(p.activo, true) = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION private.current_user_has_role(allowed_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.perfiles p
    WHERE p.id = (select auth.uid())
      AND coalesce(p.activo, true) = true
      AND (
        coalesce(p.is_saas_admin, false) = true
        OR p.rol::text = ANY(allowed_roles)
      )
  );
$$;

CREATE OR REPLACE FUNCTION private.current_user_has_gym_access(target_gym_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.perfiles p
    WHERE p.id = (select auth.uid())
      AND coalesce(p.activo, true) = true
      AND (
        coalesce(p.is_saas_admin, false) = true
        OR p.rol::text = 'superadmin'
        OR (
          p.rol::text IN ('admin', 'entrenador')
          AND target_gym_id IS NOT NULL
          AND p.gimnasio_id = target_gym_id
        )
      )
  );
$$;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA private FROM PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA private TO authenticated;

-- Compatibility wrappers kept in public without SECURITY DEFINER exposure.
CREATE OR REPLACE FUNCTION public.check_is_saas_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public, private, pg_temp
AS $$
  SELECT private.current_user_is_saas_admin();
$$;

CREATE OR REPLACE FUNCTION public.get_my_gym_id()
RETURNS uuid
LANGUAGE sql
STABLE
SET search_path = public, private, pg_temp
AS $$
  SELECT private.current_user_gym_id();
$$;

CREATE OR REPLACE FUNCTION public.has_access_to_gym(target_gym_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public, private, pg_temp
AS $$
  SELECT private.current_user_has_gym_access(target_gym_id);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public, private, pg_temp
AS $$
  SELECT private.current_user_has_role(ARRAY['admin', 'superadmin']);
$$;

REVOKE ALL ON FUNCTION public.check_is_saas_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_gym_id() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_access_to_gym(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_is_saas_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_gym_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_access_to_gym(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- New signups must not be able to choose authorization fields.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  display_name text := COALESCE(new.raw_user_meta_data->>'nombre', new.raw_user_meta_data->>'name', 'Usuario');
  display_last_name text := COALESCE(new.raw_user_meta_data->>'apellido', 'Nuevo');
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'perfiles'
      AND column_name = 'apellido'
  ) THEN
    EXECUTE '
      INSERT INTO public.perfiles (id, nombre, apellido, email, rol)
      VALUES ($1, $2, $3, $4, ''cliente'')
      ON CONFLICT (id) DO UPDATE
      SET email = EXCLUDED.email,
          nombre = COALESCE(public.perfiles.nombre, EXCLUDED.nombre)
    '
    USING new.id, display_name, display_last_name, new.email;
  ELSE
    INSERT INTO public.perfiles (id, nombre, email, rol)
    VALUES (new.id, display_name, new.email, 'cliente')
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        nombre = COALESCE(public.perfiles.nombre, EXCLUDED.nombre);
  END IF;

  RETURN new;
END;
$$;

DO $$
DECLARE
  tbl text;
  policy_name text;
  gym_tables text[] := ARRAY[
    'asistencia',
    'cajas',
    'clases',
    'clientes',
    'entrenadores',
    'exoneraciones',
    'historial_ajustes_dias',
    'inscripciones_clases',
    'medidas',
    'membresias',
    'movimientos_caja',
    'notas_medicas',
    'notificaciones',
    'pagos',
    'planes',
    'planes_nutricionales',
    'productos',
    'ventas'
  ];
  old_policies text[] := ARRAY[
    'Aislamiento SaaS por Gimnasio',
    'Admins tienen acceso total',
    'SaaS Superadmin access',
    'gym_or_saas_access',
    'Clientes: staff access by gym',
    'Planes: gym access',
    'Perfiles: gym access',
    'Superadmin full access',
    'SaaS Superadmin full access',
    'Los usuarios pueden ver su propio perfil',
    'gym members can access own gym rows',
    'gym members can read own gym',
    'saas admins can manage gym',
    'users can read permitted profiles',
    'saas admins can manage profiles',
    'saas admins can manage serials'
  ];
BEGIN
  FOREACH tbl IN ARRAY gym_tables LOOP
    IF to_regclass(format('public.%I', tbl)) IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);

      FOREACH policy_name IN ARRAY old_policies LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, tbl);
      END LOOP;

      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (private.current_user_has_gym_access(gimnasio_id)) WITH CHECK (private.current_user_has_gym_access(gimnasio_id))',
        'gym members can access own gym rows',
        tbl
      );
    END IF;
  END LOOP;
END $$;

DO $$
DECLARE
  policy_name text;
  old_policies text[] := ARRAY[
    'Aislamiento SaaS por Gimnasio',
    'Admins tienen acceso total',
    'SaaS Superadmin access',
    'Superadmin full access',
    'SaaS Superadmin full access',
    'Los usuarios pueden ver su propio perfil',
    'gym members can access own gym rows',
    'gym members can read own gym',
    'saas admins can manage gym',
    'users can read permitted profiles',
    'saas admins can manage profiles',
    'saas admins can manage serials'
  ];
BEGIN
  IF to_regclass('public.gimnasios') IS NOT NULL THEN
    ALTER TABLE public.gimnasios ENABLE ROW LEVEL SECURITY;

    FOREACH policy_name IN ARRAY old_policies LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.gimnasios', policy_name);
    END LOOP;

    CREATE POLICY "gym members can read own gym"
    ON public.gimnasios
    FOR SELECT TO authenticated
    USING (private.current_user_has_gym_access(id));

    CREATE POLICY "saas admins can manage gym"
    ON public.gimnasios
    FOR ALL TO authenticated
    USING (private.current_user_is_saas_admin())
    WITH CHECK (private.current_user_is_saas_admin());
  END IF;

  IF to_regclass('public.perfiles') IS NOT NULL THEN
    ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

    FOREACH policy_name IN ARRAY old_policies LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.perfiles', policy_name);
    END LOOP;

    CREATE POLICY "users can read permitted profiles"
    ON public.perfiles
    FOR SELECT TO authenticated
    USING (
      id = (select auth.uid())
      OR private.current_user_is_saas_admin()
      OR (
        private.current_user_has_role(ARRAY['admin', 'entrenador'])
        AND gimnasio_id = private.current_user_gym_id()
      )
    );

    CREATE POLICY "saas admins can manage profiles"
    ON public.perfiles
    FOR ALL TO authenticated
    USING (private.current_user_is_saas_admin())
    WITH CHECK (private.current_user_is_saas_admin());
  END IF;

  IF to_regclass('public.seriales') IS NOT NULL THEN
    ALTER TABLE public.seriales ENABLE ROW LEVEL SECURITY;

    FOREACH policy_name IN ARRAY old_policies LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.seriales', policy_name);
    END LOOP;

    CREATE POLICY "saas admins can manage serials"
    ON public.seriales
    FOR ALL TO authenticated
    USING (private.current_user_is_saas_admin())
    WITH CHECK (private.current_user_is_saas_admin());
  END IF;
END $$;

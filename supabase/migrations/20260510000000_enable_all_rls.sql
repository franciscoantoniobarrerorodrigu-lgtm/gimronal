-- Habilitar RLS explícitamente (por si no lo estaba)
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE membresias ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE cajas ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_caja ENABLE ROW LEVEL SECURITY;
ALTER TABLE exoneraciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;
ALTER TABLE clases ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrenadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_ajustes_dias ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_medicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE medidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gimnasios ENABLE ROW LEVEL SECURITY;

-- 1. Política para que los usuarios puedan leer su propio perfil
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON perfiles;
CREATE POLICY "Los usuarios pueden ver su propio perfil" 
ON perfiles FOR SELECT 
USING (auth.uid() = id);

-- 2. Políticas globales para administradores
-- (Asumiendo que el rol está en la tabla perfiles)
-- Como no podemos hacer JOIN directo en una política sin causar recursión infinita en perfiles,
-- creamos una función helper de seguridad.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM perfiles 
    WHERE id = auth.uid() 
    AND rol IN ('admin', 'superadmin')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Aplicar la política de acceso total a admins en todas las tablas
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS "Admins tienen acceso total" ON %I;
      CREATE POLICY "Admins tienen acceso total" ON %I 
      FOR ALL TO authenticated 
      USING (public.is_admin()) 
      WITH CHECK (public.is_admin());
    ', table_name, table_name);
  END LOOP;
END;
$$;

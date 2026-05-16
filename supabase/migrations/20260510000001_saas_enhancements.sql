-- SaaS Enhancements Migration
-- 1. Add is_saas_admin to perfiles to distinguish global admins
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS is_saas_admin BOOLEAN DEFAULT false;

-- 2. Update existing superadmins to be saas admins
UPDATE perfiles SET is_saas_admin = true WHERE rol = 'superadmin';

-- 3. Enhance RLS for gimnasios
-- Superadmin should be able to see and manage ALL gimnasios
DROP POLICY IF EXISTS "Superadmin full access" ON gimnasios;
CREATE POLICY "SaaS Superadmin full access" ON gimnasios
    FOR ALL
    USING (
        auth.uid() IN (SELECT id FROM perfiles WHERE is_saas_admin = true)
    )
    WITH CHECK (
        auth.uid() IN (SELECT id FROM perfiles WHERE is_saas_admin = true)
    );

-- 4. Enable RLS on all tables and add SaaS Superadmin policy
-- (Already mostly enabled, but adding the policy for all tables)

DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "SaaS Superadmin access" ON %I', t);
        EXECUTE format('CREATE POLICY "SaaS Superadmin access" ON %I FOR ALL USING (
            (SELECT is_saas_admin FROM perfiles WHERE id = auth.uid()) = true
        )', t);
    END LOOP;
END $$;

-- 5. Helper function to find gimnasio_id by name (case insensitive)
CREATE OR REPLACE FUNCTION find_gimnasio_by_name(gym_name TEXT)
RETURNS UUID AS $$
    SELECT id FROM gimnasios WHERE lower(nombre) = lower(gym_name) LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

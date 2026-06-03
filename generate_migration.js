const fs = require('fs');
const path = require('path');

const srcFile = path.join(__dirname, 'supabase', 'migrations', '20260520000004_fix_saas_admin_recursion.sql');
const destFile = path.join(__dirname, 'supabase', 'migrations', '20260529000000_performance_optimizations.sql');

let content = fs.readFileSync(srcFile, 'utf8');

// Replace auth.uid() with (select auth.uid()) but only if it's not already wrapped
content = content.replace(/auth\.uid\(\)/g, '(select auth.uid())');
content = content.replace(/\(select \(select auth\.uid\(\)\)\)/g, '(select auth.uid())');

content = content.replace(/auth\.jwt\(\)/g, '(select auth.jwt())');
content = content.replace(/\(select \(select auth\.jwt\(\)\)\)/g, '(select auth.jwt())');

// Add Indexes
const indexes = `
-- Adding missing foreign key indexes for performance
CREATE INDEX IF NOT EXISTS idx_historial_ajustes_gimnasio_id ON public.historial_ajustes_dias (gimnasio_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_clases_gimnasio_id ON public.inscripciones_clases (gimnasio_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_cliente_id ON public.notificaciones (cliente_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_gimnasio_id ON public.notificaciones (gimnasio_id);
CREATE INDEX IF NOT EXISTS idx_pagos_venta_id ON public.pagos (venta_id);
CREATE INDEX IF NOT EXISTS idx_planes_nutricionales_cliente_id ON public.planes_nutricionales (cliente_id);
CREATE INDEX IF NOT EXISTS idx_planes_nutricionales_entrenador_id ON public.planes_nutricionales (entrenador_id);
CREATE INDEX IF NOT EXISTS idx_planes_nutricionales_gimnasio_id ON public.planes_nutricionales (gimnasio_id);
CREATE INDEX IF NOT EXISTS idx_seriales_usado_por_gimnasio_id ON public.seriales (usado_por_gimnasio_id);

-- Removing unused indexes
DROP INDEX IF EXISTS public.idx_medidas_gimnasio_id;
DROP INDEX IF EXISTS public.idx_membresias_gimnasio_id;
DROP INDEX IF EXISTS public.idx_exoneraciones_gimnasio_id;
DROP INDEX IF EXISTS public.idx_productos_sku;
DROP INDEX IF EXISTS public.idx_clientes_nombre;
DROP INDEX IF EXISTS public.idx_entrenadores_gimnasio_id;
DROP INDEX IF EXISTS public.idx_asistencia_registrado_por;
DROP INDEX IF EXISTS public.idx_historial_ajustes_registrado_por;
DROP INDEX IF EXISTS public.idx_cajas_usuario_id_apertura;
DROP INDEX IF EXISTS public.idx_cajas_usuario_id_cierre;
DROP INDEX IF EXISTS public.idx_medidas_medido_por;
DROP INDEX IF EXISTS public.idx_membresias_plan_id;
DROP INDEX IF EXISTS public.idx_movimientos_caja_pago_id;
DROP INDEX IF EXISTS public.idx_movimientos_caja_venta_id;
DROP INDEX IF EXISTS public.idx_perfiles_gimnasio_id;
DROP INDEX IF EXISTS public.idx_ventas_producto_id;
DROP INDEX IF EXISTS public.idx_ventas_vendido_por;
`;

fs.writeFileSync(destFile, `-- Performance Optimizations\n\n${content}\n\n${indexes}`);
console.log('Migration generated successfully!');

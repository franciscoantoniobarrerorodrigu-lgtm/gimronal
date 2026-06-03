-- New gyms, plans and products must not start with DIAN/IVA behavior enabled.
-- Existing explicit true values are preserved so paid/intentional activations stay on.

ALTER TABLE public.gimnasios
ADD COLUMN IF NOT EXISTS modulo_dian_activo boolean DEFAULT false;

ALTER TABLE public.gimnasios
ALTER COLUMN modulo_dian_activo SET DEFAULT false;

UPDATE public.gimnasios
SET modulo_dian_activo = false
WHERE modulo_dian_activo IS NULL;

ALTER TABLE public.planes
ADD COLUMN IF NOT EXISTS aplica_iva boolean DEFAULT false;

ALTER TABLE public.planes
ADD COLUMN IF NOT EXISTS iva_porcentaje numeric DEFAULT 0;

ALTER TABLE public.planes
ALTER COLUMN aplica_iva SET DEFAULT false;

ALTER TABLE public.planes
ALTER COLUMN iva_porcentaje SET DEFAULT 0;

UPDATE public.planes
SET aplica_iva = false
WHERE aplica_iva IS NULL;

UPDATE public.planes
SET iva_porcentaje = 0
WHERE iva_porcentaje IS NULL OR aplica_iva IS NOT TRUE;

ALTER TABLE public.productos
ADD COLUMN IF NOT EXISTS aplica_iva boolean DEFAULT false;

ALTER TABLE public.productos
ADD COLUMN IF NOT EXISTS iva_porcentaje numeric DEFAULT 0;

ALTER TABLE public.productos
ALTER COLUMN aplica_iva SET DEFAULT false;

ALTER TABLE public.productos
ALTER COLUMN iva_porcentaje SET DEFAULT 0;

UPDATE public.productos
SET aplica_iva = false
WHERE aplica_iva IS NULL;

UPDATE public.productos
SET iva_porcentaje = 0
WHERE iva_porcentaje IS NULL OR aplica_iva IS NOT TRUE;

-- Agregar campo de tope de facturación electrónica a la tabla gimnasios
ALTER TABLE gimnasios 
ADD COLUMN IF NOT EXISTS tope_factura_electronica NUMERIC DEFAULT 235325;

-- Agregar campos para almacenar la respuesta de Factus en los pagos
ALTER TABLE pagos 
ADD COLUMN IF NOT EXISTS factus_id TEXT,
ADD COLUMN IF NOT EXISTS factus_cufe TEXT,
ADD COLUMN IF NOT EXISTS factus_url TEXT,
ADD COLUMN IF NOT EXISTS factus_status TEXT;

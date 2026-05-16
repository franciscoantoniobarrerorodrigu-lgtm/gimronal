-- GymControl Initial Schema
-- Colombia Context: CC, CE, NIT, COP

-- ENUMS
CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'entrenador', 'cliente');
CREATE TYPE membership_status AS ENUM ('activa', 'vencida', 'congelada', 'cancelada');
CREATE TYPE doc_type AS ENUM ('CC', 'CE', 'PA', 'TI', 'NUIP');
CREATE TYPE gender_type AS ENUM ('masculino', 'femenino', 'otro', 'prefiero_no_decir');
CREATE TYPE objective_type AS ENUM ('bajar_peso', 'ganar_musculo', 'mejorar_resistencia', 'rehabilitacion', 'recreacion', 'competir');

-- 1. GIMNASIOS
CREATE TABLE gimnasios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  nit TEXT UNIQUE NOT NULL,
  direccion TEXT,
  telefono TEXT,
  correo TEXT,
  logo_url TEXT,
  ciudad TEXT,
  configuracion_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SEDES
CREATE TABLE sedes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gimnasio_id UUID REFERENCES gimnasios(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  direccion TEXT,
  ciudad TEXT,
  telefono TEXT,
  horario_json JSONB DEFAULT '{}',
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. PERFILES (Extiende Supabase Auth)
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gimnasio_id UUID REFERENCES gimnasios(id),
  sede_id UUID REFERENCES sedes(id),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT NOT NULL,
  rol user_role NOT NULL DEFAULT 'cliente',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CLIENTES (Datos detallados)
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  perfil_id UUID REFERENCES perfiles(id),
  gimnasio_id UUID REFERENCES gimnasios(id),
  numero_cliente SERIAL,
  tipo_documento doc_type NOT NULL,
  numero_documento TEXT UNIQUE NOT NULL,
  primer_nombre TEXT NOT NULL,
  segundo_nombre TEXT,
  primer_apellido TEXT NOT NULL,
  segundo_apellido TEXT,
  fecha_nacimiento DATE NOT NULL,
  genero gender_type,
  celular TEXT NOT NULL,
  correo TEXT NOT NULL,
  departamento TEXT,
  ciudad TEXT,
  barrio TEXT,
  foto_url TEXT,
  objetivo_fitness objective_type,
  contacto_emergencia_nombre TEXT,
  contacto_emergencia_telefono TEXT,
  acepta_politica_datos BOOLEAN NOT NULL DEFAULT false,
  fecha_aceptacion_politica TIMESTAMPTZ,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PLANES
CREATE TABLE planes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gimnasio_id UUID REFERENCES gimnasios(id),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(12,2) NOT NULL, -- COP
  duracion_dias INTEGER NOT NULL,
  incluye_clases_grupales BOOLEAN DEFAULT true,
  max_clases_por_mes INTEGER,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. MEMBRESIAS
CREATE TABLE membresias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES planes(id),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado membership_status DEFAULT 'activa',
  dias_congelados INTEGER DEFAULT 0,
  fecha_congelamiento TIMESTAMPTZ,
  motivo_congelamiento TEXT,
  registrado_por UUID REFERENCES perfiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. PAGOS
CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id),
  membresia_id UUID REFERENCES membresias(id),
  sede_id UUID REFERENCES sedes(id),
  fecha TIMESTAMPTZ DEFAULT now(),
  valor DECIMAL(12,2) NOT NULL,
  metodo_pago TEXT NOT NULL, -- Efectivo, Nequi, etc.
  referencia_pago TEXT,
  concepto TEXT,
  saldo_pendiente DECIMAL(12,2) DEFAULT 0,
  registrado_por UUID REFERENCES perfiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. ASISTENCIA
CREATE TABLE asistencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id),
  sede_id UUID REFERENCES sedes(id),
  fecha_entrada TIMESTAMPTZ DEFAULT now(),
  fecha_salida TIMESTAMPTZ,
  metodo_registro TEXT DEFAULT 'manual', -- qr, manual, barras
  registrado_por UUID REFERENCES perfiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. CLASES
CREATE TABLE clases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sede_id UUID REFERENCES sedes(id),
  entrenador_id UUID REFERENCES perfiles(id),
  nombre TEXT NOT NULL,
  categoria TEXT,
  nivel TEXT,
  sala TEXT,
  cupo_maximo INTEGER,
  duracion_minutos INTEGER,
  dias_semana_json JSONB DEFAULT '[]',
  hora_inicio TIME,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. INSCRIPCIONES CLASES
CREATE TABLE inscripciones_clases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clase_id UUID REFERENCES clases(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id),
  fecha_inscripcion TIMESTAMPTZ DEFAULT now(),
  activa BOOLEAN DEFAULT true
);

-- 11. ASISTENCIA CLASES
CREATE TABLE asistencia_clases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clase_id UUID REFERENCES clases(id),
  cliente_id UUID REFERENCES clientes(id),
  fecha_sesion DATE NOT NULL,
  presente BOOLEAN DEFAULT true,
  registrado_por UUID REFERENCES perfiles(id)
);

-- 12. VALORACIONES FISICAS
CREATE TABLE valoraciones_fisicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id),
  entrenador_id UUID REFERENCES perfiles(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  peso DECIMAL(5,2),
  estatura INTEGER,
  imc DECIMAL(4,2),
  porcentaje_grasa DECIMAL(4,2),
  masa_muscular DECIMAL(5,2),
  porcentaje_agua DECIMAL(4,2),
  medida_cintura DECIMAL(5,2),
  medida_cadera DECIMAL(5,2),
  medida_pecho DECIMAL(5,2),
  medida_brazo_der DECIMAL(5,2),
  medida_brazo_izq DECIMAL(5,2),
  medida_muslo_der DECIMAL(5,2),
  medida_muslo_izq DECIMAL(5,2),
  medida_pantorrilla DECIMAL(5,2),
  tension_arterial TEXT,
  frecuencia_cardiaca INTEGER,
  condicion_general INTEGER,
  observaciones TEXT,
  fotos_json JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 13. PLANES NUTRICIONALES
CREATE TABLE planes_nutricionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id),
  entrenador_id UUID REFERENCES perfiles(id),
  calorias_diarias INTEGER,
  proteinas_g INTEGER,
  carbohidratos_g INTEGER,
  grasas_g INTEGER,
  numero_comidas INTEGER,
  horario_comidas JSONB,
  alimentos_recomendados TEXT,
  alimentos_evitar TEXT,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. PRODUCTOS
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sede_id UUID REFERENCES sedes(id),
  nombre TEXT NOT NULL,
  categoria TEXT,
  precio_compra DECIMAL(12,2),
  precio_venta DECIMAL(12,2),
  stock_actual INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 5,
  proveedor TEXT,
  codigo_barras TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. VENTAS PRODUCTOS
CREATE TABLE ventas_productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sede_id UUID REFERENCES sedes(id),
  cliente_id UUID REFERENCES clientes(id),
  producto_id UUID REFERENCES productos(id),
  cantidad INTEGER NOT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  fecha TIMESTAMPTZ DEFAULT now(),
  registrado_por UUID REFERENCES perfiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. EMPRESAS CONVENIO
CREATE TABLE empresas_convenio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gimnasio_id UUID REFERENCES gimnasios(id),
  nombre TEXT NOT NULL,
  nit TEXT UNIQUE NOT NULL,
  contacto_nombre TEXT,
  contacto_telefono TEXT,
  contacto_correo TEXT,
  descuento_porcentaje DECIMAL(5,2),
  max_empleados INTEGER,
  vigencia_inicio DATE,
  vigencia_fin DATE,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. NOTIFICACIONES
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id),
  tipo TEXT, -- vencimiento, cumpleanos, pago, etc.
  mensaje TEXT,
  canal TEXT DEFAULT 'whatsapp',
  estado_envio TEXT DEFAULT 'pendiente',
  fecha_envio TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 18. LOG AUDITORIA
CREATE TABLE log_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES perfiles(id),
  accion TEXT NOT NULL,
  tabla_afectada TEXT,
  registro_id UUID,
  datos_anteriores_json JSONB,
  datos_nuevos_json JSONB,
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 19. VEHICULOS CLIENTES
CREATE TABLE vehiculos_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- moto, carro
  placa TEXT NOT NULL,
  color TEXT,
  marca TEXT,
  modelo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES (Básicas)
ALTER TABLE gimnasios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sedes ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE planes ENABLE ROW LEVEL SECURITY;
ALTER TABLE membresias ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencia ENABLE ROW LEVEL SECURITY;

-- Nota: Las políticas específicas se definirán según el rol (superadmin ve todo, cliente ve lo suyo)
-- Superadmin Policy
CREATE POLICY "Superadmin full access" ON gimnasios FOR ALL USING (auth.uid() IN (SELECT id FROM perfiles WHERE rol = 'superadmin'));
-- (Repetir para otras tablas según sea necesario)

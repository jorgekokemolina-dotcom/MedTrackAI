-- ==============================================================================
-- ESQUEMA DE BASE DE DATOS MEDTRACK-AI (SUPABASE / POSTGRESQL PORTABLE)
-- Ver copia principal en supabase/schema.sql
-- ==============================================================================

-- ⚠️ ADVERTENCIA LEGAL Y ÉTICA:
-- Este sistema no debe recibir datos de pacientes reales hasta contar con:
-- (1) convenio firmado con el centro de salud piloto,
-- (2) aprobación del comité de ética,
-- (3) DUA (acuerdo de uso de datos) vigente, y
-- (4) una revisión de seguridad externa del cifrado y control de acceso.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rut_hash TEXT NOT NULL UNIQUE,
  rol TEXT NOT NULL CHECK (rol IN ('medico', 'paciente', 'autoridad')),
  nombre_cifrado BYTEA NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  rut_hash TEXT NOT NULL UNIQUE,
  datos_identificables_cifrados BYTEA NOT NULL,
  fecha_nacimiento DATE,
  sexo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS atenciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  centro_salud TEXT,
  fecha TIMESTAMPTZ NOT NULL,
  motivo_cifrado BYTEA,
  medico_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS laboratorio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  atencion_id UUID REFERENCES atenciones(id) ON DELETE SET NULL,
  tipo_examen TEXT NOT NULL,
  valor NUMERIC,
  unidad TEXT,
  fecha TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  dosis TEXT,
  fecha_inicio DATE,
  fecha_termino DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diagnosticos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  codigo_cie10 TEXT,
  descripcion_cifrada BYTEA,
  fecha DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS imagenes_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo TEXT,
  url_storage TEXT,
  fecha DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  accion TEXT NOT NULL,
  tabla_afectada TEXT NOT NULL,
  registro_id UUID,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_origen TEXT
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE atenciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagenes_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

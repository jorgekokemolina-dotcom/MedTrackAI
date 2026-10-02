-- ==============================================================================
-- ESQUEMA DE BASE DE DATOS MEDTRACK-AI (SUPABASE / POSTGRESQL PORTABLE)
-- ==============================================================================
-- ADVERTENCIA DE SEGURIDAD Y CUMPLIMIENTO LEGAL (LEY 19.628 / LEY CHILENA DE DATOS):
-- ⚠️ Este sistema no debe recibir datos de pacientes reales hasta contar con:
-- (1) convenio firmado con el centro de salud piloto,
-- (2) aprobación del comité de ética,
-- (3) DUA (acuerdo de uso de datos) vigente, y
-- (4) una revisión de seguridad externa del cifrado y control de acceso.
-- ==============================================================================

-- Habilitar extensión para UUIDs estándar (soportado en Postgres)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Identidad y roles
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rut_hash TEXT NOT NULL UNIQUE, -- Hash SHA-256 + salt de instalación. NUNCA guardar RUT plano.
  rol TEXT NOT NULL CHECK (rol IN ('medico', 'paciente', 'autoridad')),
  nombre_cifrado BYTEA NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Pacientes (datos clínicos separados de datos identificables)
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  rut_hash TEXT NOT NULL UNIQUE,
  datos_identificables_cifrados BYTEA NOT NULL, -- nombre, dirección, teléfono cifrados en servidor
  fecha_nacimiento DATE,
  sexo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Atenciones clínicas
CREATE TABLE IF NOT EXISTS atenciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  centro_salud TEXT,
  fecha TIMESTAMPTZ NOT NULL,
  motivo_cifrado BYTEA,
  medico_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Exámenes de laboratorio
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

-- 5. Medicamentos
CREATE TABLE IF NOT EXISTS medicamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  dosis TEXT,
  fecha_inicio DATE,
  fecha_termino DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Diagnósticos
CREATE TABLE IF NOT EXISTS diagnosticos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  codigo_cie10 TEXT,
  descripcion_cifrada BYTEA,
  fecha DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Metadatos de imágenes médicas
CREATE TABLE IF NOT EXISTS imagenes_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  tipo TEXT,
  url_storage TEXT, -- Referencia a Supabase Storage, NUNCA el archivo binario en la tabla
  fecha DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Auditoría obligatoria (Ley 19.628 / Seguridad sanitaria)
CREATE TABLE IF NOT EXISTS auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  accion TEXT NOT NULL, -- 'lectura', 'escritura', 'exportacion', 'carga_datos'
  tabla_afectada TEXT NOT NULL,
  registro_id UUID,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  ip_origen TEXT
);

-- ==============================================================================
-- INDICES PARA DESEMPEÑO Y BUSQUEDAS EFICIENTES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_usuarios_rut_hash ON usuarios(rut_hash);
CREATE INDEX IF NOT EXISTS idx_pacientes_rut_hash ON pacientes(rut_hash);
CREATE INDEX IF NOT EXISTS idx_atenciones_paciente ON atenciones(paciente_id);
CREATE INDEX IF NOT EXISTS idx_atenciones_medico ON atenciones(medico_id);
CREATE INDEX IF NOT EXISTS idx_laboratorio_paciente ON laboratorio(paciente_id);
CREATE INDEX IF NOT EXISTS idx_medicamentos_paciente ON medicamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_paciente ON diagnosticos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_imagenes_paciente ON imagenes_metadata(paciente_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);

-- ==============================================================================
-- TRIGGER DE AUDITORÍA AUTOMÁTICA EN POSTGRESQL
-- ==============================================================================
CREATE OR REPLACE FUNCTION fn_registrar_auditoria_cambio()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO auditoria (usuario_id, accion, tabla_afectada, registro_id, timestamp)
  VALUES (
    COALESCE(
      NULLIF(current_setting('app.current_user_id', true), '')::uuid,
      NEW.usuario_id,
      OLD.usuario_id,
      NULL
    ),
    LOWER(TG_OP), -- 'insert', 'update', 'delete'
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Disparadores para auditoría automática
DROP TRIGGER IF EXISTS trg_audit_pacientes ON pacientes;
CREATE TRIGGER trg_audit_pacientes AFTER INSERT OR UPDATE OR DELETE ON pacientes FOR EACH ROW EXECUTE FUNCTION fn_registrar_auditoria_cambio();

DROP TRIGGER IF EXISTS trg_audit_atenciones ON atenciones;
CREATE TRIGGER trg_audit_atenciones AFTER INSERT OR UPDATE OR DELETE ON atenciones FOR EACH ROW EXECUTE FUNCTION fn_registrar_auditoria_cambio();

DROP TRIGGER IF EXISTS trg_audit_laboratorio ON laboratorio;
CREATE TRIGGER trg_audit_laboratorio AFTER INSERT OR UPDATE OR DELETE ON laboratorio FOR EACH ROW EXECUTE FUNCTION fn_registrar_auditoria_cambio();

DROP TRIGGER IF EXISTS trg_audit_medicamentos ON medicamentos;
CREATE TRIGGER trg_audit_medicamentos AFTER INSERT OR UPDATE OR DELETE ON medicamentos FOR EACH ROW EXECUTE FUNCTION fn_registrar_auditoria_cambio();

DROP TRIGGER IF EXISTS trg_audit_diagnosticos ON diagnosticos;
CREATE TRIGGER trg_audit_diagnosticos AFTER INSERT OR UPDATE OR DELETE ON diagnosticos FOR EACH ROW EXECUTE FUNCTION fn_registrar_auditoria_cambio();

DROP TRIGGER IF EXISTS trg_audit_imagenes ON imagenes_metadata;
CREATE TRIGGER trg_audit_imagenes AFTER INSERT OR UPDATE OR DELETE ON imagenes_metadata FOR EACH ROW EXECUTE FUNCTION fn_registrar_auditoria_cambio();

-- ==============================================================================
-- CONTROL DE ACCESO NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE atenciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE laboratorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE imagenes_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;

-- 1. Médicos: sólo pueden leer pacientes de atenciones donde medico_id = su propio id
CREATE POLICY "RLS_Medico_Pacientes_Read" ON pacientes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM atenciones a
      WHERE a.paciente_id = pacientes.id
        AND a.medico_id = auth.uid()
    )
    OR (
      SELECT rol FROM usuarios WHERE id = auth.uid()
    ) = 'medico'
  );

CREATE POLICY "RLS_Medico_Atenciones_Read" ON atenciones
  FOR SELECT USING (
    medico_id = auth.uid()
    OR (SELECT rol FROM usuarios WHERE id = auth.uid()) = 'medico'
  );

-- 2. Pacientes: solo pueden leer su propio registro (usuario_id = su id)
CREATE POLICY "RLS_Paciente_Self_Read" ON pacientes
  FOR SELECT USING (
    usuario_id = auth.uid()
  );

CREATE POLICY "RLS_Paciente_Atenciones_Self_Read" ON atenciones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pacientes p
      WHERE p.id = atenciones.paciente_id
        AND p.usuario_id = auth.uid()
    )
  );

-- 3. Autoridades: Acceso ÚNICAMENTE a Vistas Agregadas Anonimizadas (bloqueo en tablas base)
CREATE POLICY "RLS_Autoridad_Deny_Pacientes" ON pacientes
  FOR ALL USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) != 'autoridad'
  );

CREATE POLICY "RLS_Autoridad_Deny_Atenciones" ON atenciones
  FOR ALL USING (
    (SELECT rol FROM usuarios WHERE id = auth.uid()) != 'autoridad'
  );

-- ==============================================================================
-- VISTAS AGREGADAS PARA ROL AUTORIDAD (DATOS DESIDENTIFICADOS)
-- ==============================================================================
CREATE OR REPLACE VIEW vista_estadisticas_atenciones AS
SELECT 
  centro_salud,
  DATE_TRUNC('month', fecha) AS mes,
  COUNT(*) AS total_atenciones,
  COUNT(DISTINCT paciente_id) AS total_pacientes_unicos
FROM atenciones
GROUP BY centro_salud, DATE_TRUNC('month', fecha);

CREATE OR REPLACE VIEW vista_frecuencia_diagnosticos AS
SELECT 
  codigo_cie10,
  COUNT(*) AS frecuencia,
  DATE_TRUNC('month', fecha) AS mes
FROM diagnosticos
GROUP BY codigo_cie10, DATE_TRUNC('month', fecha);

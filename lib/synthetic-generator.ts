/**
 * ==============================================================================
 * GENERADOR DE DATASET SINTÉTICO FICTICIO DE PACIENTES (~10.000 PACIENTES)
 * ==============================================================================
 * ⚠️ NINGÚN DATO ES REAL. Todos los nombres, RUTs, fechas y valores son
 * generados puramente mediante algoritmos determinísticos y aleatorios.
 * ==============================================================================
 */

interface SyntheticPatient {
  id: string;
  rut: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  sexo: 'M' | 'F';
  direccion: string;
  comuna: string;
  region: string;
  telefono: string;
  email: string;
  prevision: 'FONASA' | 'ISAPRE';
  centroSalud: string;
}

interface SyntheticAttencion {
  patientRut: string;
  centroSalud: string;
  fecha: string;
  motivo: string;
  medicoNombre: string;
}

interface SyntheticLab {
  patientRut: string;
  tipoExamen: string;
  valor: number;
  unidad: string;
  fecha: string;
}

interface SyntheticMedication {
  patientRut: string;
  nombre: string;
  dosis: string;
  fechaInicio: string;
}

interface SyntheticDiagnosis {
  patientRut: string;
  codigoCie10: string;
  descripcion: string;
  fecha: string;
}

const NOMBRES_M = ['Juan', 'Carlos', 'José', 'Luis', 'Pedro', 'Manuel', 'Jorge', 'Francisco', 'David', 'Diego', 'Gonzalo', 'Rodrigo', 'Felipe', 'Matías', 'Sebastián', 'Nicolás', 'Cristian', 'Esteban', 'Claudio', 'Héctor'];
const NOMBRES_F = ['Maria', 'Ana', 'Carmen', 'Patricia', 'Claudia', 'Camila', 'Daniela', 'Francisca', 'Javiera', 'Carolina', 'Andrea', 'Paula', 'Valentina', 'Sofia', 'Isabel', 'Lucia', 'Constanza', 'Pia', 'Romina', 'Karin'];
const APELLIDOS = ['González', 'Muñoz', 'Rojas', 'Díaz', 'Pérez', 'Soto', 'Contreras', 'Silva', 'Martínez', 'Sepúlveda', 'Morales', 'Rodríguez', 'López', 'Fuentes', 'Hernández', 'Torres', 'Araya', 'Flores', 'Espinoza', 'Valenzuela', 'Castillo', 'Tapia', 'Reyes', 'Gutiérrez', 'Castro', 'Pizarro', 'Álvarez', 'Vásquez', 'Sánchez', 'Fernández'];

const CENTROS_SALUD = ['Hospital Barros Luco', 'Hospital San Borja Arriarán', 'Hospital del Salvador', 'Hospital San José', 'Hospital Sótero del Río', 'CESFAM Las Condes', 'CESFAM Central Santiago', 'Hospital Regional de Concepción', 'Hospital Gustavo Fricke', 'Hospital Base de Valdivia'];
const COMUNAS = ['Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'Maipú', 'Puente Alto', 'La Florida', 'Concepción', 'Viña del Mar', 'Valparaíso', 'Temuco', 'Antofagasta'];

const DIAGNOSTICOS_CIE10 = [
  { code: 'I10', desc: 'Hipertensión esencial (primaria)' },
  { code: 'E11', desc: 'Diabetes mellitus tipo 2' },
  { code: 'E78.5', desc: 'Hiperlipidemia, no especificada' },
  { code: 'J45', desc: 'Asma bronquial' },
  { code: 'M17', desc: 'Gonartrosis [artrosis de la rodilla]' },
  { code: 'K21', desc: 'Enfermedad por reflujo gastroesofágico' },
  { code: 'F41.1', desc: 'Trastorno de ansiedad generalizada' },
  { code: 'F32.9', desc: 'Episodio depresivo, no especificado' },
  { code: 'N39.0', desc: 'Infección de vías urinarias, sitio no especificado' },
  { code: 'J06.9', desc: 'Infección aguda de las vías respiratorias superiores' },
];

const MEDICAMENTOS = [
  { name: 'Losartán', dosis: '50 mg cada 12 hrs' },
  { name: 'Enalapril', dosis: '10 mg cada 12 hrs' },
  { name: 'Metformina', dosis: '850 mg cada 12 hrs con comidas' },
  { name: 'Atorvastatina', dosis: '20 mg en la noche' },
  { name: 'Omeprazol', dosis: '20 mg en ayunas' },
  { name: 'Paracetamol', dosis: '500 mg cada 8 hrs según dolor' },
  { name: 'Salbutamol', dosis: '2 puff cada 6 hrs' },
  { name: 'Aspirina (Ácido Acetilsalicílico)', dosis: '100 mg al día' },
];

const EXAMENES_LAB = [
  { tipo: 'Glicemia en ayunas', unit: 'mg/dL', min: 70, max: 180 },
  { tipo: 'Hemoglobina Glicosilada (HbA1c)', unit: '%', min: 4.5, max: 11.5 },
  { tipo: 'Colesterol Total', unit: 'mg/dL', min: 140, max: 280 },
  { tipo: 'Triglicéridos', unit: 'mg/dL', min: 80, max: 350 },
  { tipo: 'Creatinina sérica', unit: 'mg/dL', min: 0.6, max: 2.2 },
  { tipo: 'Hemograma completo - Leucocitos', unit: 'x10^3/µL', min: 4.0, max: 14.0 },
  { tipo: 'Presión Arterial Sistólica', unit: 'mmHg', min: 100, max: 170 },
];

/**
 * Función para calcular el dígito verificador del RUT chileno.
 */
function calcularDV(rutNum: number): string {
  let m = 0, s = 1;
  for (; rutNum; rutNum = Math.floor(rutNum / 10)) {
    s = (s + (rutNum % 10) * (9 - (m++ % 6))) % 11;
  }
  return s ? (s - 1).toString() : 'K';
}

/**
 * Genera un conjunto de N pacientes sintéticos.
 */
export function generateSyntheticDataset(count: number = 10000) {
  const patients: SyntheticPatient[] = [];
  const atenciones: SyntheticAttencion[] = [];
  const laboratorios: SyntheticLab[] = [];
  const medicamentos: SyntheticMedication[] = [];
  const diagnosticos: SyntheticDiagnosis[] = [];

  const baseRutNum = 12000000;

  for (let i = 0; i < count; i++) {
    const rutNum = baseRutNum + i * 3 + (i % 7);
    const dv = calcularDV(rutNum);
    const rutFormatted = `${rutNum}-${dv}`;

    const sexo: 'M' | 'F' = i % 2 === 0 ? 'M' : 'F';
    const nombre = sexo === 'M' ? NOMBRES_M[i % NOMBRES_M.length] : NOMBRES_F[i % NOMBRES_F.length];
    const apPaterno = APELLIDOS[i % APELLIDOS.length];
    const apMaterno = APELLIDOS[(i * 3) % APELLIDOS.length];
    const nombreCompleto = `${nombre} ${apPaterno} ${apMaterno}`;

    const year = 1945 + (i % 60);
    const month = String((i % 12) + 1).padStart(2, '0');
    const day = String((i % 28) + 1).padStart(2, '0');
    const fechaNacimiento = `${year}-${month}-${day}`;

    const comuna = COMUNAS[i % COMUNAS.length];
    const direccion = `Av. Los Alerces #${100 + (i % 900)}, ${comuna}`;
    const centroSalud = CENTROS_SALUD[i % CENTROS_SALUD.length];

    patients.push({
      id: `syn-pat-${i + 1}`,
      rut: rutFormatted,
      nombre,
      apellidoPaterno: apPaterno,
      apellidoMaterno: apMaterno,
      nombreCompleto,
      fechaNacimiento,
      sexo,
      direccion,
      comuna,
      region: 'Región Metropolitana',
      telefono: `+569${80000000 + (i % 10000000)}`,
      email: `paciente.sintetico.${i + 1}@medtrack.cl`,
      prevision: i % 3 === 0 ? 'ISAPRE' : 'FONASA',
      centroSalud,
    });

    // Generar atenciones sintéticas asociadas
    if (i % 2 === 0) {
      atenciones.push({
        patientRut: rutFormatted,
        centroSalud,
        fecha: `2026-0${(i % 9) + 1}-15T10:30:00Z`,
        motivo: 'Control médico periódico preventivo GES',
        medicoNombre: `Dr. ${APELLIDOS[(i * 5) % APELLIDOS.length]}`,
      });
    }

    // Generar diagnósticos sintéticos
    if (i % 3 === 0) {
      const diag = DIAGNOSTICOS_CIE10[i % DIAGNOSTICOS_CIE10.length];
      diagnosticos.push({
        patientRut: rutFormatted,
        codigoCie10: diag.code,
        descripcion: diag.desc,
        fecha: `2026-0${(i % 9) + 1}-10`,
      });
    }

    // Generar exámenes de lab
    if (i % 4 === 0) {
      const exam = EXAMENES_LAB[i % EXAMENES_LAB.length];
      const val = +(exam.min + (i % (exam.max - exam.min))).toFixed(1);
      laboratorios.push({
        patientRut: rutFormatted,
        tipoExamen: exam.tipo,
        valor: val,
        unidad: exam.unit,
        fecha: `2026-0${(i % 9) + 1}-12T08:00:00Z`,
      });
    }

    // Generar medicamentos sintéticos
    if (i % 5 === 0) {
      const med = MEDICAMENTOS[i % MEDICAMENTOS.length];
      medicamentos.push({
        patientRut: rutFormatted,
        nombre: med.name,
        dosis: med.dosis,
        fechaInicio: `2026-0${(i % 9) + 1}-01`,
      });
    }
  }

  return {
    patients,
    atenciones,
    laboratorios,
    medicamentos,
    diagnosticos,
  };
}

// Semáforo status calculator
export type SemaforoStatus = 'verde' | 'ambar' | 'rojo';

export interface SemaforoConfig {
  value: number;
  greenMin?: number;
  greenMax?: number;
  redMin?: number;
  redMax?: number;
  invertido?: boolean; // true = lower is better (e.g., IAAS rate)
}

export function getSemaforo(config: SemaforoConfig): SemaforoStatus {
  const { value, greenMin, greenMax, redMin, redMax, invertido } = config;

  if (invertido) {
    if (greenMax !== undefined && value <= greenMax) return 'verde';
    if (redMin !== undefined && value >= redMin) return 'rojo';
    return 'ambar';
  } else {
    if (greenMin !== undefined && value >= greenMin) return 'verde';
    if (redMax !== undefined && value <= redMax) return 'rojo';
    return 'ambar';
  }
}

export function getSemaforoColors(status: SemaforoStatus) {
  return {
    verde: { text: '#16A34A', bg: '#DCFCE7', border: '#16A34A20' },
    ambar: { text: '#D97706', bg: '#FEF3C7', border: '#D9770620' },
    rojo: { text: '#DC2626', bg: '#FEE2E2', border: '#DC262620' },
  }[status];
}

// KPI formatting
export function formatNumber(n: number): string {
  if (n == null || isNaN(n)) return '-';
  return new Intl.NumberFormat('es-CL').format(n);
}

export function formatPercent(n: number): string {
  if (n == null || isNaN(n)) return '-';
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 }).format(n) + '%';
}

export function formatDays(n: number): string {
  if (n == null || isNaN(n)) return '-';
  return `${new Intl.NumberFormat('es-CL').format(n)} d`;
}

export function formatCurrency(n: number): string {
  if (n == null || isNaN(n)) return '-';
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
}

// Period filtering
export type Periodo = 'mes' | 'trimestre' | 'anual' | 'personalizado';

export function getMonthsForPeriod(periodo: Periodo, mesActual: string = '2025-12'): string[] {
  const allMonths = [
    '2025-01', '2025-02', '2025-03', '2025-04', 
    '2025-05', '2025-06', '2025-07', '2025-08',
    '2025-09', '2025-10', '2025-11', '2025-12'
  ];
  
  const currentIndex = allMonths.indexOf(mesActual);
  if (currentIndex === -1) return [mesActual];

  switch (periodo) {
    case 'mes':
      return [mesActual];
    case 'trimestre':
      const startIndex = Math.max(0, currentIndex - 2);
      return allMonths.slice(startIndex, currentIndex + 1);
    case 'anual':
      return allMonths.slice(0, currentIndex + 1);
    case 'personalizado':
      return allMonths; 
    default:
      return [mesActual];
  }
}

export function getLatestMonth(datos_mensuales: any[]): any {
  if (!datos_mensuales || datos_mensuales.length === 0) return null;
  return datos_mensuales[datos_mensuales.length - 1];
}

export function getMonthLabel(mes: string): string {
  if (!mes) return '';
  const [year, monthStr] = mes.split('-');
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const mIndex = parseInt(monthStr, 10) - 1;
  if (mIndex >= 0 && mIndex < 12) {
    return `${months[mIndex]} ${year}`;
  }
  return mes;
}

// Tooltip info definitions for each KPI
export const KPI_TOOLTIPS: Record<string, { definicion: string; fuente: string; formula?: string }> = {
  cumplimiento_ges: {
    definicion: 'Porcentaje de garantías GES cumplidas dentro del plazo legal establecido',
    fuente: 'Estándar: MINSAL — Ley GES / Decreto GES vigente',
    formula: '(Garantías cumplidas en plazo / Total garantías activas) × 100'
  },
  ioc: {
    definicion: 'Índice de Ocupación de Camas. Mide el uso promedio de camas disponibles',
    fuente: 'Estándar: MINSAL COMGES 2026 — Rango óptimo 80-85%',
    formula: '(Días-cama ocupados / Días-cama disponibles) × 100'
  },
  tasa_iaas: {
    definicion: 'Tasa de Infecciones Asociadas a la Atención de Salud por 1.000 días-cama',
    fuente: 'Estándar: MINSAL Programa Nacional de IAAS — Meta: <3,5‰',
    formula: '(Nº infecciones / Días-cama) × 1.000'
  },
  reingreso_30_dias: {
    definicion: 'Porcentaje de pacientes que reingresan al hospital por la misma causa dentro de 30 días post alta',
    fuente: 'Estándar: MINSAL — Indicador de Calidad Asistencial (<10%)'
  },
  ausentismo_licencia: {
    definicion: 'Porcentaje de ausentismo del personal debido a licencias médicas',
    fuente: 'Estándar: MINSAL — RRHH (<7%)'
  },
  ficha_digital_pct: {
    definicion: 'Porcentaje de atenciones registradas íntegramente en la plataforma MedTrack AI',
    fuente: 'Proyecto Piloto MedTrack AI'
  },
  lista_espera_no_ges: {
    definicion: 'Cantidad total de pacientes esperando consulta de especialidad o cirugía (No GES)',
    fuente: 'Registro Nacional de Lista de Espera (RNLE)'
  },
  mediana_espera_consulta_dias: {
    definicion: 'Mediana de días de espera para una consulta nueva de especialidad médica',
    fuente: 'SIGTE MINSAL'
  },
  rendimiento_box: {
    definicion: 'Número de atenciones médicas realizadas por hora en un box de consulta',
    fuente: 'Estándar: MINSAL (Meta >6 atenciones/hora)'
  },
  iod: {
    definicion: 'Índice de Ocupación de Pabellones. Mide el uso efectivo del tiempo de quirófano',
    fuente: 'Estándar: MINSAL (>80%)'
  },
  ausentismo_pacientes: {
    definicion: 'Porcentaje de pacientes que no asisten a su hora programada (NSP)',
    fuente: 'Indicador de Eficiencia Operativa (<15%)'
  },
  espera_urgencia_min: {
    definicion: 'Tiempo promedio de espera en la Unidad de Emergencia antes de la atención médica (Triage C3/C4)',
    fuente: 'Estándar: Triage Urgencias'
  },
  tasa_resolucion_aps: {
    definicion: 'Porcentaje de problemas de salud resueltos en Atención Primaria sin derivar a nivel secundario',
    fuente: 'Metas Sanitarias APS (>75%)'
  },
  control_hba1c: {
    definicion: 'Pacientes diabéticos bajo control con Hemoglobina Glicosilada < 7%',
    fuente: 'Metas Sanitarias APS'
  },
  control_hipertensos: {
    definicion: 'Pacientes hipertensos con presión arterial bajo 140/90 mmHg',
    fuente: 'Metas Sanitarias APS'
  },
  mortalidad_bruta: {
    definicion: 'Tasa de mortalidad general intrahospitalaria',
    fuente: 'Estadísticas DEIS'
  },
  rotacion_camas: {
    definicion: 'Número de pacientes que ocupan una misma cama durante un período',
    fuente: 'Indicador de Eficiencia Hospitalaria'
  },
  promedio_estancia_dias: {
    definicion: 'Promedio de días que un paciente permanece hospitalizado (Estada)',
    fuente: 'Estándar MINSAL'
  },
  intervalo_sustitucion: {
    definicion: 'Tiempo promedio que permanece desocupada una cama entre el egreso de un paciente y el ingreso de otro',
    fuente: 'Indicador de Eficiencia Hospitalaria (Óptimo <1 día)'
  }
};

// Trend calculation
export function calcTrend(current: number, previous: number): { direction: 'up' | 'down' | 'flat'; pct: number } {
  if (previous === 0 || previous == null || current == null) return { direction: 'flat', pct: 0 };
  const pct = ((current - previous) / previous) * 100;
  return {
    direction: pct > 0.5 ? 'up' : pct < -0.5 ? 'down' : 'flat',
    pct: Math.abs(Math.round(pct * 10) / 10)
  };
}

// Heatmap color interpolation
export function heatmapColor(value: number, min: number, max: number): string {
  if (value == null) return '#E2E8F0';
  const safeMax = max > min ? max : min + 1;
  const ratio = Math.max(0, Math.min(1, (value - min) / (safeMax - min)));
  const r = Math.round(220 * (1 - ratio) + 22 * ratio);
  const g = Math.round(38 * (1 - ratio) + 163 * ratio);
  const b = Math.round(38 * (1 - ratio) + 74 * ratio);
  return `rgb(${r}, ${g}, ${b})`;
}

"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowUp, ArrowDown, Info } from 'lucide-react';
import centroData from '@/data/estadisticas-centro.json';
import redData from '@/data/estadisticas-red.json';
import { 
  getSemaforo, 
  getSemaforoColors, 
  calcTrend, 
  formatNumber, 
  formatPercent,
  KPI_TOOLTIPS
} from '../helpers';

interface SectionProps {
  rol: 'director' | 'autoridad';
  establecimientoId: string;
  periodo: 'mes' | 'trimestre' | 'anual';
  mesActual: string;
}

export default function ResumenEjecutivo({ rol, establecimientoId, periodo, mesActual }: SectionProps) {
  const kpis = [
    { key: 'cumplimiento_ges', label: 'Cumplimiento GES (%)', value: 97.8, standard: '≥95%', prev: 95.2, isHospital: false },
    { key: 'lista_espera_no_ges', label: 'Pacientes lista no GES', value: 2847, standard: 'Reducción', prev: 2950, isHospital: false },
    { key: 'mediana_espera_consulta_dias', label: 'Mediana espera consulta (días)', value: 218, standard: '<240', prev: 225, isHospital: false },
    { key: 'ioc', label: 'Tasa ocupación camas (%)', value: 82.4, standard: '80-85%', prev: 83.1, isHospital: true },
    { key: 'tasa_iaas', label: 'Tasa IAAS (‰)', value: 3.2, standard: '<3.5‰', prev: 3.4, isHospital: true },
    { key: 'reingreso_30_dias', label: 'Reingreso 30 días (%)', value: 8.7, standard: '<10%', prev: 9.1, isHospital: true },
    { key: 'ausentismo_licencia', label: 'Ausentismo (%)', value: 6.2, standard: '<7%', prev: 6.8, isHospital: false },
    { key: 'ficha_digital_pct', label: 'Cobertura ficha digital (%)', value: 34, standard: 'Meta 100%', prev: 31, isHospital: false },
  ];

  const getColorLogic = (key: string, value: number) => {
    switch (key) {
      case 'cumplimiento_ges': return value >= 95 ? 'verde' : value >= 90 ? 'ámbar' : 'rojo';
      case 'lista_espera_no_ges': return 'ámbar';
      case 'mediana_espera_consulta_dias': return value < 240 ? 'verde' : value <= 300 ? 'ámbar' : 'rojo';
      case 'ioc': return (value >= 80 && value <= 85) ? 'verde' : ((value >= 75 && value < 80) || (value > 85 && value <= 90)) ? 'ámbar' : 'rojo';
      case 'tasa_iaas': return value < 3.5 ? 'verde' : value <= 4.5 ? 'ámbar' : 'rojo';
      case 'reingreso_30_dias': return value < 10 ? 'verde' : value <= 12 ? 'ámbar' : 'rojo';
      case 'ausentismo_licencia': return value < 7 ? 'verde' : value <= 9 ? 'ámbar' : 'rojo';
      case 'ficha_digital_pct': return value > 50 ? 'verde' : value >= 20 ? 'ámbar' : 'rojo';
      default: return 'verde';
    }
  };

  const getSemaforoStyles = (color: string) => {
    if (color === 'verde') return { bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]', badge: 'bg-[#16A34A] text-white' };
    if (color === 'ámbar') return { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', badge: 'bg-[#D97706] text-white' };
    if (color === 'rojo') return { bg: 'bg-[#FEE2E2]', text: 'text-[#DC2626]', badge: 'bg-[#DC2626] text-white' };
    return { bg: 'bg-gray-100', text: 'text-gray-500', badge: 'bg-gray-400 text-white' };
  };

  const isCesfam = establecimientoId.toLowerCase().includes('cesfam');

  let greenCount = 0;
  let amberCount = 0;
  let redCount = 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const isNA = isCesfam && kpi.isHospital;
          const status = isNA ? 'na' : getColorLogic(kpi.key, kpi.value);
          if (status === 'verde') greenCount++;
          if (status === 'ámbar') amberCount++;
          if (status === 'rojo') redCount++;

          const styles = isNA ? { bg: 'bg-gray-100', text: 'text-gray-400', badge: 'bg-gray-300 text-gray-600' } : getSemaforoStyles(status);
          const diff = kpi.value - kpi.prev;
          const isImprovement = (kpi.key === 'cumplimiento_ges' || kpi.key === 'ficha_digital_pct') ? diff > 0 : diff < 0;

          return (
            <Card key={kpi.key} className={`rounded-2xl relative ${isNA ? 'opacity-60' : ''}`}>
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-slate-500 line-clamp-2">{kpi.label}</span>
                  <div className="relative group">
                    <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
                    <div className="absolute right-0 top-6 w-48 p-2 bg-white border border-slate-200 rounded shadow-lg text-xs hidden group-hover:block z-10">
                      Definición de {kpi.label} (Estándar: {kpi.standard})
                    </div>
                  </div>
                </div>
                <div className="flex items-baseline gap-2 my-2">
                  <span className={`text-3xl font-bold ${isNA ? 'text-gray-400' : 'text-slate-800'}`}>
                    {isNA ? 'N/A' : kpi.value}
                  </span>
                  {!isNA && (
                    <Badge variant="outline" className={`flex items-center gap-0.5 text-xs px-1 ${isImprovement ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50'}`}>
                      {diff > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                      {Math.abs(diff).toFixed(1)}
                    </Badge>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Estándar: {kpi.standard}</span>
                  <Badge className={`rounded-xl text-[10px] uppercase font-bold px-2 py-0.5 ${styles.badge} hover:${styles.badge}`}>
                    {isNA ? 'N/A' : status}
                  </Badge>
                </div>
                {!isNA && (
                  <Progress value={Math.min(100, (kpi.value / (kpi.key === 'cumplimiento_ges' ? 100 : kpi.value * 1.5)) * 100)} className="h-1.5 mt-3" />
                )}
                {rol === 'autoridad' && !isNA && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                    <span>Promedio Red:</span>
                    <span className="font-medium text-slate-700">{kpi.value + 1.2}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Semáforo de Estado General</h4>
        <div className="flex h-3 rounded-full overflow-hidden w-full">
          {greenCount > 0 && <div style={{ flex: greenCount }} className="bg-[#16A34A]" />}
          {amberCount > 0 && <div style={{ flex: amberCount }} className="bg-[#D97706]" />}
          {redCount > 0 && <div style={{ flex: redCount }} className="bg-[#DC2626]" />}
        </div>
        <div className="flex justify-between mt-2 text-xs font-medium text-slate-600">
          <span className="text-[#16A34A]">{greenCount} en verde</span>
          <span className="text-[#D97706]">{amberCount} en atención</span>
          <span className="text-[#DC2626]">{redCount} en alerta</span>
        </div>
      </div>
    </div>
  );
}

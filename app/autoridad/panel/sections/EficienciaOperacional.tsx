"use client";

import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SectionProps {
  rol: 'director' | 'autoridad';
  establecimientoId: string;
  periodo: 'mes' | 'trimestre' | 'anual';
  mesActual: string;
}

function GaugeChart({ value, min = 0, max = 100, label, unit }: { value: number, min?: number, max?: number, label: string, unit: string }) {
  const isGreen = value >= 80 && value <= 85;
  const isAmber = (value >= 75 && value < 80) || (value > 85 && value <= 90);
  const isRed = value < 75 || value > 90;
  
  const color = isGreen ? '#16A34A' : isAmber ? '#F59E0B' : '#DC2626';
  const percentage = (value - min) / (max - min);
  const angle = percentage * 180;
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <svg viewBox="0 0 200 120" className="w-full max-w-[200px]">
        {/* Background arc */}
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#E2E8F0" strokeWidth="20" strokeLinecap="round" />
        {/* Value arc */}
        <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={color} strokeWidth="20" strokeLinecap="round" strokeDasharray="251.2" strokeDashoffset={251.2 - (angle / 180) * 251.2} className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="-mt-10 flex flex-col items-center">
        <span className="text-3xl font-bold" style={{ color }}>{value}{unit}</span>
        <span className="text-xs text-slate-500 mt-1">{label}</span>
      </div>
    </div>
  );
}

export default function EficienciaOperacional({ rol, establecimientoId, periodo, mesActual }: SectionProps) {
  const isCesfam = establecimientoId.toLowerCase().includes('cesfam');

  const tooltipStyle = { borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px rgba(0,0,0,0.07)" };

  const weeklyIoc = [
    { week: 'Sem 1', ioc: 81 }, { week: 'Sem 2', ioc: 83 }, { week: 'Sem 3', ioc: 85 }, { week: 'Sem 4', ioc: 84 },
    { week: 'Sem 5', ioc: 86 }, { week: 'Sem 6', ioc: 88 }, { week: 'Sem 7', ioc: 89 }, { week: 'Sem 8', ioc: 87 },
    { week: 'Sem 9', ioc: 85 }, { week: 'Sem 10', ioc: 84 }, { week: 'Sem 11', ioc: 82 }, { week: 'Sem 12', ioc: 82.4 }
  ];

  return (
    <div className="space-y-8">
      {!isCesfam && (
        <section>
          <h3 className="text-lg font-bold text-slate-800 mb-4">Gestión de Camas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Card className="rounded-2xl">
              <CardContent className="p-2">
                <GaugeChart value={82.4} label="Tasa Ocupación (IOC)" unit="%" />
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <p className="text-sm text-slate-500 font-medium">Rotación de Camas</p>
                <p className="text-4xl font-bold text-slate-800 mt-2">6.2</p>
                <p className="text-xs text-slate-500 mt-2">egresos / cama</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <p className="text-sm text-slate-500 font-medium">Promedio Días Estada (PDIE)</p>
                <p className="text-4xl font-bold text-slate-800 mt-2">4.8</p>
                <p className="text-xs text-slate-500 mt-2">días</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <p className="text-sm text-slate-500 font-medium">Intervalo Sustitución</p>
                <p className="text-4xl font-bold text-slate-800 mt-2">0.9</p>
                <p className="text-xs text-slate-500 mt-2">días</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="rounded-2xl p-4">
              <CardTitle className="text-sm font-semibold mb-4 text-slate-700">Evolución Semanal IOC</CardTitle>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyIoc} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis domain={[70, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="ioc" stroke="#0EA5C4" strokeWidth={2} dot={{ r: 2, fill: '#0EA5C4' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card className="rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold text-slate-700">PDIE por Servicio Clínico</CardTitle>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Servicio</TableHead>
                    <TableHead className="text-right">PDIE (días)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { srv: 'Medicina', val: 5.2 },
                    { srv: 'Cirugía', val: 3.8 },
                    { srv: 'Pediatría', val: 3.5 },
                    { srv: 'Obstetricia', val: 2.8 },
                    { srv: 'Psiquiatría', val: 8.1 },
                  ].map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-sm">{row.srv}</TableCell>
                      <TableCell className="text-right text-sm">{row.val}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </section>
      )}

      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Gestión Ambulatoria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-l-4 border-l-[#D97706]">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500 font-medium">Rendimiento Box</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">5.8</p>
              <p className="text-xs text-slate-400 mt-1">Estándar: ≥6.0</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-l-4 border-l-[#D97706]">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500 font-medium">Índice Ocupación (IOD)</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">78%</p>
              <p className="text-xs text-slate-400 mt-1">Estándar: ≥80%</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-l-4 border-l-[#DC2626]">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500 font-medium">Ausentismo Pacientes</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">18.3%</p>
              <p className="text-xs text-slate-400 mt-1">Alerta: &gt;15%</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-l-4 border-l-[#16A34A]">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500 font-medium">Espera en Urgencia</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">42 <span className="text-lg font-normal text-slate-500">min</span></p>
              <p className="text-xs text-slate-400 mt-1">Estándar: &lt;60 min</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import centroData from '@/data/estadisticas-centro.json';
import redData from '@/data/estadisticas-red.json';
import { formatNumber } from '../helpers';

interface SectionProps {
  rol: 'director' | 'autoridad';
  establecimientoId: string;
  periodo: 'mes' | 'trimestre' | 'anual';
  mesActual: string;
}

export default function AccesoEspera({ rol, establecimientoId, periodo, mesActual }: SectionProps) {
  const gesHistory = [
    { month: 'Ene', value: 92 }, { month: 'Feb', value: 94 }, { month: 'Mar', value: 96 },
    { month: 'Abr', value: 95 }, { month: 'May', value: 97 }, { month: 'Jun', value: 98 },
    { month: 'Jul', value: 97.5 }, { month: 'Ago', value: 96 }, { month: 'Sep', value: 97 },
    { month: 'Oct', value: 98.2 }, { month: 'Nov', value: 97.1 }, { month: 'Dic', value: 97.8 }
  ];

  const noGesHistory = [
    { month: 'Jul', value: 2400 }, { month: 'Ago', value: 2510 }, { month: 'Sep', value: 2605 },
    { month: 'Oct', value: 2715 }, { month: 'Nov', value: 2780 }, { month: 'Dic', value: 2847 }
  ];

  const tooltipStyle = { borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px rgba(0,0,0,0.07)" };

  return (
    <div className="space-y-8">
      {/* 2.1 — Garantías GES */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Garantías GES</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 font-medium">Garantías GES activas este trimestre</p>
              <p className="text-4xl font-bold text-[#0EA5C4] mt-2">1,245</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 font-medium">% Cumplidas en plazo legal</p>
              <div className="flex items-end gap-3 mt-2">
                <p className="text-4xl font-bold text-[#16A34A]">97.8%</p>
              </div>
              <Progress value={97.8} className="h-2 mt-4 bg-slate-100 [&>div]:bg-[#16A34A]" />
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 font-medium">Garantías retrasadas</p>
              <p className="text-4xl font-bold text-[#DC2626] mt-2">27</p>
              <div className="mt-4 text-xs text-slate-500">
                <p>Top patologías:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Vicios de refracción (12)</li>
                  <li>Cataratas (8)</li>
                  <li>Colecistectomía preventiva (7)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card className="rounded-2xl p-4">
          <CardTitle className="text-sm font-semibold mb-4 text-slate-700">Cumplimiento GES Últimos 12 Meses</CardTitle>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gesHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#F7FAFC' }} />
                <ReferenceLine y={95} stroke="#DC2626" strokeDasharray="5 5" label={{ position: 'top', value: 'Estándar MINSAL 95%', fill: '#DC2626', fontSize: 10 }} />
                <Bar dataKey="value" fill="#0EA5C4" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>

      {/* 2.2 — Lista de espera no GES */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Lista de Espera No GES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Card className="rounded-2xl lg:col-span-2">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 font-medium">Total Lista de Espera No GES</p>
              <p className="text-4xl font-bold text-slate-800 mt-2">2,847</p>
              <div className="flex gap-6 mt-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-500">Consultas Especialidad</p>
                  <p className="text-lg font-semibold text-[#8B5CF6]">1,930</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Cirugías Electivas</p>
                  <p className="text-lg font-semibold text-[#D97706]">917</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl lg:col-span-2">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 font-medium mb-4">Evolución Total Lista (6 meses)</p>
              <div className="h-[100px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={noGesHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={3} dot={{ r: 3, fill: '#F59E0B' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 italic text-right">Tendencia que MedTrack puede ayudar a gestionar</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="rounded-2xl p-4">
            <p className="text-sm text-slate-500 font-medium mb-4">Comparativa Mediana Espera (días)</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Consulta (Local: 218)</span>
                  <span className="text-slate-500">Nacional: 240</span>
                </div>
                <Progress value={(218/240)*100} className="h-2 bg-slate-200 [&>div]:bg-[#16A34A]" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Cirugía (Local: 271)</span>
                  <span className="text-slate-500">Nacional: 294</span>
                </div>
                <Progress value={(271/294)*100} className="h-2 bg-slate-200 [&>div]:bg-[#16A34A]" />
              </div>
            </div>
          </Card>
          <Card className="rounded-2xl p-4">
            <p className="text-sm text-slate-500 font-medium mb-4">Top 5 Especialidades en Espera</p>
            <div className="h-[120px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{name: 'Oftalmología', v: 450}, {name: 'Otorrino', v: 380}, {name: 'Traumato', v: 310}, {name: 'Gastro', v: 290}, {name: 'Derma', v: 210}]} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="v" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </section>

      {/* 2.3 — Resolución en APS */}
      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Resolución en APS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="rounded-2xl p-6">
            <p className="text-sm text-slate-500 font-medium mb-4">Tasa Resolución APS</p>
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-4 bg-slate-100 rounded-full overflow-hidden mt-4">
                <div className="absolute top-0 left-0 h-full bg-[#16A34A]" style={{ width: '72.4%' }} />
                <div className="absolute top-0 left-[75%] h-full w-0.5 bg-slate-800 z-10" />
              </div>
              <div className="flex justify-between w-48 mt-2 text-xs">
                <span className="font-bold text-[#16A34A]">72.4% Actual</span>
                <span className="text-slate-500">Meta {'>'}75%</span>
              </div>
            </div>
          </Card>
          <Card className="rounded-2xl p-6 flex flex-col justify-center">
            <p className="text-sm text-slate-500 font-medium">Derivaciones y Pertinencia</p>
            <div className="flex gap-8 mt-4">
              <div>
                <p className="text-3xl font-bold text-slate-800">1,104</p>
                <p className="text-xs text-slate-500">Derivaciones generadas</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#0EA5C4]">88%</p>
                <p className="text-xs text-slate-500">Tasa de pertinencia</p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

"use client";

import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface SectionProps {
  rol: 'director' | 'autoridad';
  establecimientoId: string;
  periodo: 'mes' | 'trimestre' | 'anual';
  mesActual: string;
}

export default function CalidadSeguridad({ rol, establecimientoId, periodo, mesActual }: SectionProps) {
  const isCesfam = establecimientoId.toLowerCase().includes('cesfam');

  const iaasData = [
    { month: 'Ene', tasa: 2.8 }, { month: 'Feb', tasa: 2.9 }, { month: 'Mar', tasa: 3.1 },
    { month: 'Abr', tasa: 3.0 }, { month: 'May', tasa: 3.2 }, { month: 'Jun', tasa: 3.4 },
    { month: 'Jul', tasa: 3.5 }, { month: 'Ago', tasa: 4.8 }, { month: 'Sep', tasa: 3.9 },
    { month: 'Oct', tasa: 3.5 }, { month: 'Nov', tasa: 3.3 }, { month: 'Dic', tasa: 3.2 }
  ];

  const tooltipStyle = { borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px rgba(0,0,0,0.07)" };

  return (
    <div className="space-y-8">
      {isCesfam && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
          Indicadores hospitalarios no aplican para este tipo de establecimiento.
        </div>
      )}

      {!isCesfam && (
        <>
          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Infecciones Asociadas a la Atención de Salud (IAAS)</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-6">
                  <p className="text-sm text-slate-500 font-medium mb-2">Tasa IAAS Global (‰)</p>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-5xl font-bold text-slate-800">3.2</p>
                    <Badge className="bg-[#16A34A] text-white hover:bg-[#16A34A]">Verde</Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">Referencia: &lt;3.5‰</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl lg:col-span-2 p-4">
                <CardTitle className="text-sm font-semibold mb-4 text-slate-700">Evolución Mensual IAAS (Últimos 12 meses)</CardTitle>
                <div className="h-[150px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={iaasData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis domain={[0, 6]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <ReferenceLine y={3.5} stroke="#DC2626" strokeDasharray="3 3" label={{ position: 'top', value: 'Alerta (3.5‰)', fill: '#DC2626', fontSize: 10 }} />
                      <Line type="monotone" dataKey="tasa" stroke="#8B5CF6" strokeWidth={2} dot={{ r: 3, fill: '#8B5CF6' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
            <Card className="rounded-2xl overflow-hidden mt-4">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Tipo de IAAS</TableHead>
                    <TableHead className="text-right">Tasa Acumulada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell className="font-medium text-sm">ITUC (Infección Tracto Urinario por Catéter)</TableCell><TableCell className="text-right text-sm">1.8‰</TableCell></TableRow>
                  <TableRow><TableCell className="font-medium text-sm">NAV (Neumonía Asociada a Ventilación)</TableCell><TableCell className="text-right text-sm">11.2‰</TableCell></TableRow>
                  <TableRow><TableCell className="font-medium text-sm">BACVC (Bacteriemia por Catéter Venoso Central)</TableCell><TableCell className="text-right text-sm">2.4‰</TableCell></TableRow>
                  <TableRow><TableCell className="font-medium text-sm">ISO (Infección Sitio Operatorio)</TableCell><TableCell className="text-right text-sm">1.1%</TableCell></TableRow>
                </TableBody>
              </Table>
            </Card>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Reingresos y Mortalidad</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="rounded-2xl">
                <CardContent className="p-6">
                  <p className="text-sm text-slate-500 font-medium">Reingreso 30 Días</p>
                  <p className="text-4xl font-bold text-slate-800 mt-2">8.7%</p>
                  <p className="text-xs text-slate-400 mt-1">Ref: &lt;10%</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-6">
                  <p className="text-sm text-slate-500 font-medium">Mortalidad Bruta Hosp.</p>
                  <p className="text-4xl font-bold text-slate-800 mt-2">1.8%</p>
                  <p className="text-xs text-slate-400 mt-1 italic">Requiere ajuste por case-mix para comparabilidad</p>
                </CardContent>
              </Card>
              <Card className="rounded-2xl">
                <CardContent className="p-6">
                  <p className="text-sm text-slate-500 font-medium">Mortalidad Urgencia &lt;24h</p>
                  <p className="text-4xl font-bold text-slate-800 mt-2">0.3%</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <Card className="rounded-2xl p-4">
                <CardTitle className="text-sm font-semibold mb-4 text-slate-700">Reingresos por Servicio Clínico</CardTitle>
                <div className="h-[150px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{name: 'Medicina', v: 12.1}, {name: 'Cirugía', v: 7.5}, {name: 'Pediatría', v: 4.2}, {name: 'Psiquiatría', v: 15.4}]} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={80} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="v" fill="#0EA5C4" radius={[0, 4, 4, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="rounded-2xl bg-[#F0F9FF] border-[#0EA5C4]/20 flex flex-col justify-center p-6">
                <div className="flex gap-4 items-start">
                  <div className="bg-[#0EA5C4] text-white p-2 rounded-xl">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Oportunidad Imhotep</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Imhotep podría reducir esta cifra al garantizar continuidad de información clínica entre el alta y el seguimiento en APS, previniendo descompensaciones tempranas.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </section>
        </>
      )}

      <section>
        <h3 className="text-lg font-bold text-slate-800 mb-4">Seguridad del Paciente</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 font-medium">Eventos Adversos Reportados</p>
              <p className="text-4xl font-bold text-slate-800 mt-2">12</p>
              <p className="text-xs text-slate-400 mt-1">este trimestre</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500 font-medium">Caídas de Pacientes</p>
              <p className="text-4xl font-bold text-slate-800 mt-2">1.4‰</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-6 flex flex-col justify-between">
              <p className="text-sm text-slate-500 font-medium">Úlceras por Presión III-IV</p>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-4xl font-bold text-[#16A34A]">0</p>
                <CheckCircle className="w-8 h-8 text-[#16A34A]" />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

"use client";

import React from 'react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SectionProps {
  rol: 'director' | 'autoridad';
  establecimientoId: string;
  periodo: 'mes' | 'trimestre' | 'anual';
  mesActual: string;
}

export default function ActividadAsistencial({ rol, establecimientoId, periodo, mesActual }: SectionProps) {
  const isCesfam = establecimientoId.toLowerCase().includes('cesfam');

  const volCards = [
    { label: 'Total Atenciones APS', value: '14,230', change: '+2.4%' },
    { label: 'Total Egresos', value: '842', change: '-1.1%', hospitalOnly: true },
    { label: 'Total Cirugías', value: '315', change: '+5.0%', hospitalOnly: true },
    { label: 'Consultas Urgencia', value: '4,102', change: '+8.2%' },
  ];

  const trendData = [
    { month: 'Ene', aps: 12000, urgencia: 3800, hospital: 780, ambulatorio: 1500 },
    { month: 'Feb', aps: 11500, urgencia: 3600, hospital: 750, ambulatorio: 1400 },
    { month: 'Mar', aps: 13500, urgencia: 4200, hospital: 820, ambulatorio: 1700 },
    { month: 'Abr', aps: 13200, urgencia: 4000, hospital: 810, ambulatorio: 1650 },
    { month: 'May', aps: 14100, urgencia: 4300, hospital: 850, ambulatorio: 1800 },
    { month: 'Jun', aps: 14500, urgencia: 4600, hospital: 890, ambulatorio: 1850 },
  ];

  const tooltipStyle = { borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px rgba(0,0,0,0.07)" };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {volCards.filter(c => !c.hospitalOnly || !isCesfam).map((card, i) => (
          <Card key={i} className="rounded-2xl">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <p className="text-sm text-slate-500 font-medium">{card.label}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-3xl font-bold text-slate-800">{card.value}</p>
                <span className={`text-xs font-semibold ${card.change.startsWith('+') ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>{card.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl p-4">
          <CardTitle className="text-sm font-semibold mb-4 text-slate-700">Evolución de Atenciones</CardTitle>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5C4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0EA5C4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUrg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="aps" name="APS" stroke="#0EA5C4" fillOpacity={1} fill="url(#colorAps)" />
                <Area type="monotone" dataKey="urgencia" name="Urgencia" stroke="#F59E0B" fillOpacity={1} fill="url(#colorUrg)" />
                {!isCesfam && <Area type="monotone" dataKey="hospital" name="Hospitalización" stroke="#8B5CF6" fillOpacity={0.3} fill="#8B5CF6" />}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {!isCesfam && (
          <Card className="rounded-2xl p-4">
            <CardTitle className="text-sm font-semibold mb-4 text-slate-700">Comparativa Mensual</CardTitle>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: '#F7FAFC' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="ambulatorio" name="Ambulatorio" fill="#0EA5C4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="hospital" name="Egresos" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      <Card className="rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <CardTitle className="text-sm font-semibold text-slate-700">Productividad por Unidad Clínica</CardTitle>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Unidad</TableHead>
              <TableHead className="text-right">Consultas Realizadas</TableHead>
              <TableHead className="text-right">Meta Mensual</TableHead>
              <TableHead className="text-right">% Cumplimiento</TableHead>
              <TableHead className="text-right">Rend. por Box</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { unit: 'Medicina', cons: 1240, meta: 1300, pct: 95.3, rend: 4.8 },
              { unit: 'Cirugía', cons: 850, meta: 800, pct: 106.2, rend: 3.9 },
              { unit: 'Pediatría', cons: 920, meta: 1000, pct: 92.0, rend: 5.2 },
              { unit: 'Obstetricia', cons: 640, meta: 650, pct: 98.4, rend: 4.1 },
              { unit: 'Psiquiatría', cons: 410, meta: 380, pct: 107.8, rend: 3.2 },
            ].map((row, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{row.unit}</TableCell>
                <TableCell className="text-right">{row.cons}</TableCell>
                <TableCell className="text-right">{row.meta}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className={`bg-opacity-10 ${row.pct >= 100 ? 'text-[#16A34A] border-[#16A34A] bg-[#16A34A]' : row.pct >= 90 ? 'text-[#D97706] border-[#D97706] bg-[#D97706]' : 'text-[#DC2626] border-[#DC2626] bg-[#DC2626]'}`}>
                    {row.pct}%
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{row.rend}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Users, Clock, AlertTriangle } from 'lucide-react'

const ausentismo_estamento = [
  { estamento: 'Médicos', ausentismo: 5.2 },
  { estamento: 'Enfermeras', ausentismo: 6.8 },
  { estamento: 'TENS', ausentismo: 8.1 },
  { estamento: 'Administrativos', ausentismo: 5.5 },
  { estamento: 'Otros', ausentismo: 4.9 },
]

const dotacion = [
  { estamento: 'Médicos (Traumatología)', actual: 4, requerida: 7, diferencia: -3, estado: 'Crítico' },
  { estamento: 'Médicos (Psiquiatría)', actual: 2, requerida: 4, diferencia: -2, estado: 'Crítico' },
  { estamento: 'Enfermeras (UCI)', actual: 24, requerida: 24, diferencia: 0, estado: 'Óptimo' },
  { estamento: 'TENS (Urgencia)', actual: 35, requerida: 32, diferencia: 3, estado: 'Superávit' },
  { estamento: 'Administrativos (SOME)', actual: 12, requerida: 15, diferencia: -3, estado: 'Déficit' },
]

interface SectionProps {
  rol: 'director' | 'autoridad'
  establecimientoId: string
  periodo: 'mes' | 'trimestre' | 'anual'
  mesActual: string
}

export default function RecursosHumanos({ rol, establecimientoId, periodo, mesActual }: SectionProps) {
  const COLORS = ['#0EA5C4', '#16A34A', '#D97706', '#DC2626', '#8B5CF6']

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-slate-600">Ausentismo General</h3>
            <Users className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-slate-800">6.2%</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-2 py-1 bg-[#DCFCE7] text-[#16A34A] rounded-lg text-xs font-medium">Óptimo (Ref &lt;7%)</span>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-slate-600">Horas Capacitación Promedio</h3>
            <Clock className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-slate-800">18 <span className="text-sm font-normal text-slate-500">hrs</span></p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Avance hacia meta (24 hrs/año)</span>
              <span>75%</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        </Card>

        <Card className="p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-slate-600">Tasa Rotación Personal</h3>
            <AlertTriangle className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-slate-800">8.4%</p>
          <div className="mt-2">
            <span className="text-xs text-slate-500">Últimos 12 meses</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Ausentismo por Estamento</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ausentismo_estamento} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="estamento" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px rgba(0,0,0,0.07)" }}
                  formatter={(value: unknown) => [`${value}%`, 'Ausentismo']}
                />
                <Bar dataKey="ausentismo" radius={[4, 4, 0, 0]}>
                  {ausentismo_estamento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Brechas de Dotación por Servicio</h3>
          <p className="text-sm text-slate-500 mb-4">
            Atención: Traumatología y Psiquiatría presentan déficit notable de médicos.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-600 uppercase bg-[#F7FAFC]">
                <tr>
                  <th className="px-4 py-3">Estamento / Servicio</th>
                  <th className="px-4 py-3 text-center">Actual</th>
                  <th className="px-4 py-3 text-center">Requerida</th>
                  <th className="px-4 py-3 text-center">Diferencia</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {dotacion.map((item, index) => (
                  <tr key={index} className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#F7FAFC]">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.estamento}</td>
                    <td className="px-4 py-3 text-center">{item.actual}</td>
                    <td className="px-4 py-3 text-center">{item.requerida}</td>
                    <td className={`px-4 py-3 text-center font-bold ${
                      item.diferencia < 0 ? 'text-[#DC2626]' : item.diferencia > 0 ? 'text-[#16A34A]' : 'text-slate-600'
                    }`}>
                      {item.diferencia > 0 ? '+' : ''}{item.diferencia}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        item.estado === 'Crítico' ? 'bg-[#FEE2E2] text-[#DC2626]' :
                        item.estado === 'Déficit' ? 'bg-[#FEF3C7] text-[#D97706]' :
                        item.estado === 'Óptimo' ? 'bg-[#DCFCE7] text-[#16A34A]' :
                        'bg-[#F0F9FF] text-[#0EA5C4]'
                      }`}>
                        {item.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

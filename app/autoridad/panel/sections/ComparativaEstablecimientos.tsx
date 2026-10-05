'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Lock, Trophy, ArrowUp, Minus } from 'lucide-react'

const establecimientos_data = [
  { id: 'est001', nombre: 'Hospital Base Valdivia', ioc: 82, ges: 94, iaas: 2.1, reingreso: 4.5, medtrack: 68 },
  { id: 'est002', nombre: 'Hospital Panguipulli', ioc: 75, ges: 88, iaas: 3.4, reingreso: 5.2, medtrack: 42 },
  { id: 'est003', nombre: 'CESFAM Angachilla', ioc: 89, ges: 96, iaas: null, reingreso: null, medtrack: 15 },
  { id: 'est004', nombre: 'CESFAM Las Ánimas', ioc: 91, ges: 92, iaas: null, reingreso: null, medtrack: 28 },
  { id: 'est005', nombre: 'Hospital La Unión', ioc: 78, ges: 85, iaas: 4.1, reingreso: 6.8, medtrack: 55 },
]

const heatmap_data = [
  { est: 'H. Base Valdivia', meses: [90, 92, 91, 93, 94, 94, 95, 94, 94, 95, 96, 94] },
  { est: 'H. Panguipulli', meses: [85, 84, 86, 88, 87, 85, 86, 88, 89, 87, 88, 88] },
  { est: 'CESFAM Angachilla', meses: [95, 94, 96, 96, 95, 96, 97, 96, 96, 95, 96, 96] },
  { est: 'CESFAM Las Ánimas', meses: [90, 91, 90, 92, 91, 90, 92, 93, 91, 92, 92, 92] },
  { est: 'H. La Unión', meses: [80, 82, 81, 84, 83, 85, 84, 85, 86, 85, 84, 85] },
]

const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

interface ComparativaProps {
  rol: 'director' | 'autoridad'
  establecimientoId: string
  periodo: 'mes' | 'trimestre' | 'anual'
  mesActual: string
  onSelectEstablecimiento: (id: string) => void
}

function getSemaforoColor(valor: number | null, tipo: 'alto_mejor' | 'bajo_mejor') {
  if (valor === null) return 'text-[#64748B]'
  if (tipo === 'alto_mejor') {
    if (valor >= 90) return 'text-[#16A34A] font-bold bg-[#DCFCE7] px-2 py-1 rounded'
    if (valor >= 80) return 'text-[#D97706] font-bold bg-[#FEF3C7] px-2 py-1 rounded'
    return 'text-[#DC2626] font-bold bg-[#FEE2E2] px-2 py-1 rounded'
  } else {
    if (valor <= 3) return 'text-[#16A34A] font-bold bg-[#DCFCE7] px-2 py-1 rounded'
    if (valor <= 5) return 'text-[#D97706] font-bold bg-[#FEF3C7] px-2 py-1 rounded'
    return 'text-[#DC2626] font-bold bg-[#FEE2E2] px-2 py-1 rounded'
  }
}

function getHeatmapColor(valor: number) {
  if (valor >= 95) return '#16A34A'
  if (valor >= 90) return '#4ADE80'
  if (valor >= 85) return '#FCD34D'
  if (valor >= 80) return '#F87171'
  return '#DC2626'
}

export default function ComparativaEstablecimientos({ rol, establecimientoId, periodo, mesActual, onSelectEstablecimiento }: ComparativaProps) {
  const [kpiSeleccionado, setKpiSeleccionado] = useState('ges')
  
  if (rol === 'director') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <div className="h-16 w-16 bg-[#F7FAFC] rounded-full flex items-center justify-center border border-[#E2E8F0]">
          <Lock className="h-8 w-8 text-[#64748B]" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Acceso Restringido</h2>
        <p className="text-slate-500 max-w-md">
          El módulo de comparativa inter-establecimientos está disponible únicamente para autoridades regionales y del Ministerio de Salud.
        </p>
      </div>
    )
  }

  const chartData = establecimientos_data.map(est => ({
    nombre: est.nombre.replace('Hospital', 'H.').replace('CESFAM', 'C.'),
    valor: (est as any)[kpiSeleccionado] || 0
  }))

  const COLORS = ['#0EA5C4', '#8B5CF6', '#16A34A', '#D97706', '#DC2626']

  return (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl overflow-hidden">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Tabla Central de Comparativa (Red)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-600 uppercase bg-[#F7FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-4 py-3">Establecimiento</th>
                <th className="px-4 py-3 text-center">IOC (%)</th>
                <th className="px-4 py-3 text-center">Cumplimiento GES</th>
                <th className="px-4 py-3 text-center">Tasa IAAS (%)</th>
                <th className="px-4 py-3 text-center">Reingreso 30d (%)</th>
                <th className="px-4 py-3 text-center">Cobertura MedTrack</th>
              </tr>
            </thead>
            <tbody>
              {establecimientos_data.map((est) => (
                <tr 
                  key={est.id} 
                  className={`border-b border-[#E2E8F0] last:border-0 hover:bg-[#F0F9FF] cursor-pointer transition-colors ${establecimientoId === est.id ? 'bg-[#F0F9FF]' : ''}`}
                  onClick={() => onSelectEstablecimiento(est.id)}
                >
                  <td className="px-4 py-4 font-medium text-slate-800 flex items-center gap-2">
                    {est.nombre}
                    {establecimientoId === est.id && <span className="h-2 w-2 rounded-full bg-[#0EA5C4]"></span>}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={getSemaforoColor(est.ioc, 'alto_mejor')}>{est.ioc}%</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={getSemaforoColor(est.ges, 'alto_mejor')}>{est.ges}%</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {est.iaas !== null ? <span className={getSemaforoColor(est.iaas, 'bajo_mejor')}>{est.iaas}%</span> : <span className="text-slate-400">N/A</span>}
                  </td>
                  <td className="px-4 py-4 text-center">
                    {est.reingreso !== null ? <span className={getSemaforoColor(est.reingreso, 'bajo_mejor')}>{est.reingreso}%</span> : <span className="text-slate-400">N/A</span>}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-slate-700 font-medium">{est.medtrack}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 rounded-2xl lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Comparativa por KPI</h3>
            <Select value={kpiSeleccionado} onValueChange={(v) => setKpiSeleccionado(v ?? 'ges')}>
              <SelectTrigger className="w-[200px] rounded-xl border-[#E2E8F0]">
                <SelectValue placeholder="Seleccionar KPI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ges">Cumplimiento GES</SelectItem>
                <SelectItem value="ioc">Índice Operacional (IOC)</SelectItem>
                <SelectItem value="iaas">Tasa IAAS</SelectItem>
                <SelectItem value="reingreso">Reingreso 30 días</SelectItem>
                <SelectItem value="medtrack">Cobertura Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="nombre" tick={{ fill: '#64748B', fontSize: 12 }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px rgba(0,0,0,0.07)" }}
                  cursor={{ fill: '#F7FAFC' }}
                />
                <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Ranking</h3>
          </div>
          <div className="space-y-4">
            {chartData.sort((a, b) => b.valor - a.valor).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAFC] border border-[#E2E8F0]">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    index === 0 ? 'bg-[#FEF3C7] text-[#D97706]' :
                    index === 1 ? 'bg-[#E2E8F0] text-[#64748B]' :
                    index === 2 ? 'bg-[#FFEDD5] text-[#C2410C]' :
                    'bg-[#F1F5F9] text-[#94A3B8]'
                  }`}>
                    {index < 3 ? <Trophy className="h-4 w-4" /> : <span className="font-bold text-sm">{index + 1}</span>}
                  </div>
                  <span className="font-medium text-slate-700 text-sm">{item.nombre}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-800">{item.valor}%</span>
                  {index % 2 === 0 ? <ArrowUp className="h-4 w-4 text-[#16A34A]" /> : <Minus className="h-4 w-4 text-[#64748B]" />}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 rounded-2xl overflow-hidden">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Heatmap: Cumplimiento GES 2025</h3>
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-xs text-center border-collapse">
            <thead>
              <tr>
                <th className="text-left py-2 font-medium text-slate-500 min-w-[140px]">Establecimiento</th>
                {meses.map(mes => <th key={mes} className="py-2 font-medium text-slate-500 w-10">{mes}</th>)}
              </tr>
            </thead>
            <tbody>
              {heatmap_data.map((row, i) => (
                <tr key={i}>
                  <td className="text-left py-2 font-medium text-slate-700">{row.est}</td>
                  {row.meses.map((val, j) => (
                    <td key={j} className="p-1">
                      <div 
                        className="w-full h-8 flex items-center justify-center rounded-md text-white font-medium text-[10px]"
                        style={{ backgroundColor: getHeatmapColor(val) }}
                        title={`${row.est} - ${meses[j]}: ${val}%`}
                      >
                        {val}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-end items-center gap-2 text-xs text-slate-500">
            <span>Menor 80%</span>
            <div className="w-4 h-4 rounded bg-[#DC2626]"></div>
            <div className="w-4 h-4 rounded bg-[#F87171]"></div>
            <div className="w-4 h-4 rounded bg-[#FCD34D]"></div>
            <div className="w-4 h-4 rounded bg-[#4ADE80]"></div>
            <div className="w-4 h-4 rounded bg-[#16A34A]"></div>
            <span>Mayor 95%</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'
import { HeartPulse, Activity, ShieldPlus, Users } from 'lucide-react'

const cronicas_prevalencia = [
  { name: 'Hipertensión', value: 34 },
  { name: 'DM2', value: 18 },
  { name: 'Dislipidemia', value: 15 },
  { name: 'Obesidad', value: 12 },
  { name: 'EPOC', value: 8 },
  { name: 'Otros', value: 13 },
]

const preventivos = [
  { name: 'PAP', actual: 64, meta: 80 },
  { name: 'Mamografía', actual: 57, meta: 70 },
  { name: 'Influenza 65+', actual: 78, meta: 85 },
  { name: 'COVID ref.', actual: 61, meta: 75 },
  { name: 'EMP', actual: 43, meta: 60 },
]

const top_diagnosticos_cie10 = [
  { pos: 1, codigo: 'J00', diag: 'Rinofaringitis aguda (resfriado común)', casos: 12450, pct: 15.2 },
  { pos: 2, codigo: 'I10', diag: 'Hipertensión esencial (primaria)', casos: 9820, pct: 12.0 },
  { pos: 3, codigo: 'E11', diag: 'Diabetes mellitus tipo 2', casos: 8430, pct: 10.3 },
  { pos: 4, codigo: 'J20', diag: 'Bronquitis aguda', casos: 6540, pct: 8.0 },
  { pos: 5, codigo: 'K21', diag: 'Enfermedad del reflujo gastroesofágico', casos: 5120, pct: 6.2 },
  { pos: 6, codigo: 'M54', diag: 'Dorsalgia', casos: 4890, pct: 6.0 },
  { pos: 7, codigo: 'F41', diag: 'Otros trastornos de ansiedad', casos: 4210, pct: 5.1 },
  { pos: 8, codigo: 'N39', diag: 'Otros trastornos del sistema urinario', casos: 3850, pct: 4.7 },
  { pos: 9, codigo: 'J44', diag: 'Otras EPOC', casos: 3100, pct: 3.8 },
  { pos: 10, codigo: 'E66', diag: 'Obesidad', casos: 2890, pct: 3.5 },
]

interface SectionProps {
  rol: 'director' | 'autoridad'
  establecimientoId: string
  periodo: 'mes' | 'trimestre' | 'anual'
  mesActual: string
}

export default function Epidemiologia({ rol, establecimientoId, periodo, mesActual }: SectionProps) {
  const COLORS = ['#0EA5C4', '#16A34A', '#D97706', '#DC2626', '#8B5CF6', '#64748B']

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#F0F9FF] rounded-xl">
              <HeartPulse className="h-5 w-5 text-[#0EA5C4]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-600">Cobertura PSCV</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">71%</p>
          <span className="text-xs text-[#16A34A] font-medium">↑ 2% vs ant.</span>
        </Card>

        <Card className="p-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#F3E8FF] rounded-xl">
              <Users className="h-5 w-5 text-[#8B5CF6]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-600">Salud Mental</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">58%</p>
          <span className="text-xs text-slate-500 font-medium">Pacientes bajo control</span>
        </Card>

        <Card className="p-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#FEF3C7] rounded-xl">
              <Activity className="h-5 w-5 text-[#D97706]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-600">Control HbA1c</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">48%</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#D97706] rounded-lg text-[10px] font-bold uppercase tracking-wider">
              Bajo meta (Ref &gt;60%)
            </span>
          </div>
        </Card>

        <Card className="p-4 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#FEF3C7] rounded-xl">
              <ShieldPlus className="h-5 w-5 text-[#D97706]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-600">Control Hipertensos</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">55%</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-[#FEF3C7] text-[#D97706] rounded-lg text-[10px] font-bold uppercase tracking-wider">
              Bajo meta (Ref &gt;60%)
            </span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Prevalencia Enfermedades Crónicas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cronicas_prevalencia}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {cronicas_prevalencia.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px rgba(0,0,0,0.07)" }}
                  formatter={(value: unknown) => [`${value}%`, 'Prevalencia']}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Programas Preventivos vs Meta MINSAL</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={preventivos}>
                <PolarGrid stroke="#E2E8F0" />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Radar name="Actual" dataKey="actual" stroke="#0EA5C4" fill="#0EA5C4" fillOpacity={0.5} />
                <Radar name="Meta MINSAL" dataKey="meta" stroke="#16A34A" fill="#16A34A" fillOpacity={0.2} strokeDasharray="3 3" />
                <Legend />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px rgba(0,0,0,0.07)" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6 rounded-2xl overflow-hidden">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Top 10 Diagnósticos (Morbilidad Prevalente)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-600 uppercase bg-[#F7FAFC]">
              <tr>
                <th className="px-4 py-3 w-16 text-center">Pos</th>
                <th className="px-4 py-3 w-24">CIE-10</th>
                <th className="px-4 py-3">Diagnóstico</th>
                <th className="px-4 py-3 text-right">Casos</th>
                <th className="px-4 py-3 text-right">% Total</th>
              </tr>
            </thead>
            <tbody>
              {top_diagnosticos_cie10.map((item, index) => (
                <tr key={item.codigo} className={`border-b border-[#E2E8F0] last:border-0 ${index % 2 === 0 ? 'bg-white' : 'bg-[#F7FAFC]'}`}>
                  <td className="px-4 py-3 text-center font-bold text-slate-500">{item.pos}</td>
                  <td className="px-4 py-3 font-mono text-slate-600">{item.codigo}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{item.diag}</td>
                  <td className="px-4 py-3 text-right">{item.casos.toLocaleString('es-CL')}</td>
                  <td className="px-4 py-3 text-right">{item.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

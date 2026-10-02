'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Lock, Brain, FileText, Share2, Network, Clock, CheckCircle2 } from 'lucide-react'

const adopcion_medtrack_mensual = [
  { mes: 'Jul', historias: 850 },
  { mes: 'Ago', historias: 1200 },
  { mes: 'Sep', historias: 1950 },
  { mes: 'Oct', historias: 2800 },
  { mes: 'Nov', historias: 3500 },
  { mes: 'Dic', historias: 4218 },
]

interface SectionProps {
  rol: 'director' | 'autoridad'
  establecimientoId: string
  periodo: 'mes' | 'trimestre' | 'anual'
  mesActual: string
}

export default function ImpactoMedtrack({ rol, establecimientoId, periodo, mesActual }: SectionProps) {
  return (
    <div className="space-y-6 bg-[#F0F9FF] -m-6 p-6 min-h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Share2 className="h-6 w-6 text-[#0EA5C4]" />
          Impacto y Adopción MedTrack AI
        </h2>
        <p className="text-slate-600">Métricas de transformación digital e interoperabilidad clínica.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 rounded-2xl md:col-span-2 border-blue-100 shadow-sm bg-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#0EA5C4]" />
                Ficha Digital Única (Ley 21.668)
              </h3>
              <p className="text-sm text-slate-500">Progreso hacia la meta de 100% de cobertura</p>
            </div>
            <span className="text-3xl font-bold text-[#0EA5C4]">34%</span>
          </div>
          <Progress value={34} className="h-3 mb-2" />
          <p className="text-xs text-slate-500 font-medium">Ley 21.668 — Meta: 100% de cobertura</p>
        </Card>

        <Card className="p-6 rounded-2xl border-blue-100 shadow-sm flex flex-col justify-center bg-white">
          <h3 className="text-sm font-semibold text-slate-600 mb-1 flex items-center gap-2">
            <Network className="h-4 w-4 text-slate-400" />
            Centros Conectados
          </h3>
          <p className="text-3xl font-bold text-slate-800">3 <span className="text-lg font-normal text-slate-500">de 12</span></p>
          <Progress value={25} className="h-2 mt-3" />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl border-green-100 bg-[#F7FAFC]">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">Historias Unificadas</h3>
          <p className="text-2xl font-bold text-slate-800">4.218</p>
          <p className="text-xs text-slate-500 mt-1">Pacientes interoperables</p>
        </Card>
        
        <Card className="p-4 rounded-2xl border-blue-100 bg-[#F7FAFC]">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">Exámenes Duplicados Evitados</h3>
          <p className="text-2xl font-bold text-slate-800">127</p>
          <p className="text-xs text-[#16A34A] font-medium mt-1">Ahorro est: CLP $1.270.000</p>
          <p className="text-[10px] text-slate-400">(a $10.000 por examen prom.)</p>
        </Card>

        <Card className="p-4 rounded-2xl border-blue-100 bg-[#F7FAFC]">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">Tiempo Acceso Historial</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-[#0EA5C4]">8 seg</p>
            <Clock className="h-4 w-4 text-[#0EA5C4] opacity-70" />
          </div>
          <p className="text-xs text-slate-500 mt-1">vs 25-40 min reconstrucción manual antes de MedTrack</p>
        </Card>

        <Card className="p-4 rounded-2xl border-blue-100 bg-[#F7FAFC]">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">Urgencias c/ Medicación Previa</h3>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-[#16A34A]">89%</p>
            <CheckCircle2 className="h-4 w-4 text-[#16A34A] opacity-70" />
          </div>
          <p className="text-xs text-slate-500 mt-1">vs 12% estimado antes de MedTrack</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 rounded-2xl lg:col-span-2 shadow-sm border-[#E2E8F0] bg-white">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Adopción: Crecimiento de Historias Unificadas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={adopcion_medtrack_mensual} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHistorias" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5C4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0EA5C4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="mes" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "1px solid #E2E8F0", boxShadow: "0 4px 6px rgba(0,0,0,0.07)" }}
                />
                <Area type="monotone" dataKey="historias" stroke="#0EA5C4" strokeWidth={3} fillOpacity={1} fill="url(#colorHistorias)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="relative p-6 rounded-2xl shadow-sm border-[#FEF3C7] bg-[#FEF3C7]/30 overflow-hidden">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center">
            <div className="h-12 w-12 bg-[#FEF3C7] rounded-full flex items-center justify-center mb-3">
              <Lock className="h-6 w-6 text-[#D97706]" />
            </div>
            <h4 className="font-bold text-slate-800 mb-2">Módulo en Desarrollo</h4>
            <p className="text-sm text-slate-600">
              Estas métricas estarán disponibles cuando Imhotep, el módulo de IA predictiva, se active. Los valores actuales son el baseline para medir el impacto futuro.
            </p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Brain className="h-5 w-5 text-[#D97706]" />
              Imhotep AI
            </h3>
            <Badge className="bg-[#FEF3C7] text-[#D97706] border-0">Próximamente</Badge>
          </div>

          <div className="space-y-4 blur-[2px] select-none">
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Alertas clínicas emitidas</p>
              <p className="text-xl font-bold text-slate-300">—</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Alertas confirmadas por médico</p>
              <p className="text-xl font-bold text-slate-300">—</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Tiempo promedio de respuesta</p>
              <p className="text-xl font-bold text-slate-300">—</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import Link from 'next/link'
import { Building2, BarChart3, AlertCircle, ArrowLeft } from 'lucide-react'

export default function AutoridadSelection() {
  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio
          </Link>
        </div>

        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
            Centro de Inteligencia Operacional
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Seleccione su perfil de acceso para ingresar al panel de control analítico de MedTrack AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link href="/autoridad/panel?rol=director" className="block group h-full">
            <div className="h-full bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-[#0EA5C4]/30 flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-2xl bg-[#F0F9FF] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Building2 className="h-10 w-10 text-[#0EA5C4]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Director de Establecimiento</h2>
              <p className="text-slate-600 text-base">
                Estadísticas detalladas de tu centro de salud con comparativa a nivel nacional.
              </p>
              <div className="mt-auto pt-8 w-full">
                <span className="inline-flex items-center justify-center px-6 py-3 border border-[#0EA5C4] text-[#0EA5C4] font-medium rounded-xl group-hover:bg-[#0EA5C4] group-hover:text-white transition-colors w-full">
                  Ingresar como Director
                </span>
              </div>
            </div>
          </Link>

          <Link href="/autoridad/panel?rol=autoridad" className="block group h-full">
            <div className="h-full bg-white rounded-3xl p-8 border border-[#E2E8F0] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-[#8B5CF6]/30 flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-2xl bg-[#F3E8FF] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-10 w-10 text-[#8B5CF6]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Autoridad Regional / MINSAL</h2>
              <p className="text-slate-600 text-base">
                Consolidado comparativo entre establecimientos de la red asistencial.
              </p>
              <div className="mt-auto pt-8 w-full">
                <span className="inline-flex items-center justify-center px-6 py-3 border border-[#8B5CF6] text-[#8B5CF6] font-medium rounded-xl group-hover:bg-[#8B5CF6] group-hover:text-white transition-colors w-full">
                  Ingresar como Autoridad
                </span>
              </div>
            </div>
          </Link>
        </div>

        <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl p-4 flex items-start gap-4 text-[#B45309]">
          <AlertCircle className="h-6 w-6 text-[#D97706] flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">
            Este panel muestra estadísticas agregadas y anonimizadas. No contiene datos de pacientes individuales. El acceso está restringido y monitoreado según la Ley 19.628 de Protección de Datos Personales.
          </p>
        </div>
      </div>
    </div>
  )
}

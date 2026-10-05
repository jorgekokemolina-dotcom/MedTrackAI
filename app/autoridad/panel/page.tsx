'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, Clock, Activity, Zap, ShieldCheck, 
  Users, HeartPulse, Sparkles, GitCompare, Download,
  Menu, Building2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import ResumenEjecutivo from './sections/ResumenEjecutivo'
import AccesoEspera from './sections/AccesoEspera'
import ActividadAsistencial from './sections/ActividadAsistencial'
import EficienciaOperacional from './sections/EficienciaOperacional'
import CalidadSeguridad from './sections/CalidadSeguridad'
import RecursosHumanos from './sections/RecursosHumanos'
import Epidemiologia from './sections/Epidemiologia'
import ImpactoMedtrack from './sections/ImpactoMedtrack'
import ComparativaEstablecimientos from './sections/ComparativaEstablecimientos'
import ExportarReportes from './sections/ExportarReportes'

const PlaceholderSection = ({ title }: { title: string }) => (
  <div className="p-8 text-center text-[#64748B] bg-white rounded-2xl border border-[#E2E8F0] h-64 flex items-center justify-center">
    Módulo en construcción: {title}
  </div>
)

const navItems = [
  { id: 'resumen', label: 'Resumen ejecutivo', icon: LayoutDashboard },
  { id: 'acceso', label: 'Acceso y espera', icon: Clock },
  { id: 'actividad', label: 'Actividad asistencial', icon: Activity },
  { id: 'eficiencia', label: 'Eficiencia operacional', icon: Zap },
  { id: 'calidad', label: 'Calidad y seguridad', icon: ShieldCheck },
  { id: 'rrhh', label: 'Recursos humanos', icon: Users },
  { id: 'epidemiologia', label: 'Epidemiología', icon: HeartPulse },
  { id: 'impacto', label: 'Impacto MedTrack', icon: Sparkles },
  { id: 'comparativa', label: 'Comparativa', icon: GitCompare },
  { id: 'exportar', label: 'Exportar / Reportes', icon: Download },
]

function PanelContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [rol, setRol] = useState<'director' | 'autoridad' | null>(null)
  const [activeSection, setActiveSection] = useState('resumen')
  const [establecimientoId, setEstablecimientoId] = useState('est001')
  const [periodo, setPeriodo] = useState<'mes' | 'trimestre' | 'anual'>('mes')
  const [mesActual, setMesActual] = useState('2025-12')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const rolParam = searchParams.get('rol')
    if (rolParam === 'director' || rolParam === 'autoridad') {
      setRol(rolParam)
    } else {
      router.push('/autoridad')
    }
  }, [searchParams, router])

  if (!rol) return null

  const renderActiveSection = () => {
    const props = { rol, establecimientoId, periodo, mesActual }
    switch (activeSection) {
      case 'resumen': return <ResumenEjecutivo {...props} />
      case 'acceso': return <AccesoEspera {...props} />
      case 'actividad': return <ActividadAsistencial {...props} />
      case 'eficiencia': return <EficienciaOperacional {...props} />
      case 'calidad': return <CalidadSeguridad {...props} />
      case 'rrhh': return <RecursosHumanos {...props} />
      case 'epidemiologia': return <Epidemiologia {...props} />
      case 'impacto': return <ImpactoMedtrack {...props} />
      case 'comparativa': 
        return <ComparativaEstablecimientos 
                 {...props} 
                 onSelectEstablecimiento={setEstablecimientoId} 
               />
      case 'exportar': return <ExportarReportes {...props} />
      default: return <PlaceholderSection title={navItems.find(i => i.id === activeSection)?.label || ''} />
    }
  }

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex flex-col md:flex-row print:bg-white">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden print:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-[#E2E8F0] 
        flex flex-col transition-transform duration-300 ease-in-out print:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-[#E2E8F0]">
          <Building2 className="h-6 w-6 text-[#0EA5C4] mr-2" />
          <span className="font-bold text-lg text-slate-800">CIO MedTrack</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isComparativa = item.id === 'comparativa'
            const isDisabled = isComparativa && rol === 'director'
            const isActive = activeSection === item.id
            
            return (
              <button
                key={item.id}
                disabled={isDisabled}
                title={isDisabled ? "Disponible solo para autoridades regionales" : ""}
                onClick={() => {
                  setActiveSection(item.id)
                  setSidebarOpen(false)
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${isDisabled ? 'opacity-50 cursor-not-allowed text-[#94A3B8]' : 
                    isActive ? 'bg-[#F0F9FF] text-[#0EA5C4] border-l-4 border-[#0EA5C4] rounded-l-sm' : 
                    'text-[#64748B] hover:bg-[#F7FAFC] hover:text-slate-800'}
                `}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-[#0EA5C4]' : isDisabled ? 'text-[#94A3B8]' : 'text-[#64748B]'}`} />
                {item.label}
              </button>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-[#E2E8F0]">
          <button 
            onClick={() => router.push('/autoridad')}
            className="w-full py-2 text-sm text-[#64748B] hover:text-slate-800 font-medium transition-colors text-left px-3"
          >
            ← Salir del panel
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto print:h-auto print:overflow-visible">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0] print:hidden">
          <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                className="md:hidden p-2 text-[#64748B] hover:bg-[#F1F5F9] rounded-lg"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="hidden sm:flex items-center gap-3">
                {rol === 'director' ? (
                  <Badge className="bg-[#F0F9FF] text-[#0EA5C4] hover:bg-[#E0F2FE] border-0">
                    Director — Hospital Base Valdivia
                  </Badge>
                ) : (
                  <Badge className="bg-[#F3E8FF] text-[#8B5CF6] hover:bg-[#E9D5FF] border-0">
                    Autoridad Regional — SS Valdivia
                  </Badge>
                )}
                
                {rol === 'autoridad' && (
                  <Select value={establecimientoId} onValueChange={(v) => setEstablecimientoId(v ?? 'est001')}>
                    <SelectTrigger className="w-[220px] h-8 text-xs rounded-xl border-[#E2E8F0]">
                      <SelectValue placeholder="Seleccionar establecimiento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est001">Hospital Base Valdivia</SelectItem>
                      <SelectItem value="est002">Hospital Com. Futrono</SelectItem>
                      <SelectItem value="est003">CESFAM Lago Ranco</SelectItem>
                      <SelectItem value="est004">CESFAM Río Bueno</SelectItem>
                      <SelectItem value="est005">CSR Llifén</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex bg-[#F1F5F9] rounded-lg p-0.5">
                <button 
                  onClick={() => setPeriodo('mes')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${periodo === 'mes' ? 'bg-white shadow-sm text-slate-800' : 'text-[#64748B] hover:text-slate-800'}`}
                >
                  Mes
                </button>
                <button 
                  onClick={() => setPeriodo('trimestre')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${periodo === 'trimestre' ? 'bg-white shadow-sm text-slate-800' : 'text-[#64748B] hover:text-slate-800'}`}
                >
                  Trimestre
                </button>
                <button 
                  onClick={() => setPeriodo('anual')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${periodo === 'anual' ? 'bg-white shadow-sm text-slate-800' : 'text-[#64748B] hover:text-slate-800'}`}
                >
                  Anual
                </button>
              </div>
              
              <Select value={mesActual} onValueChange={(v) => setMesActual(v ?? '2025-12')}>
                <SelectTrigger className="w-[120px] h-8 text-xs rounded-xl border-[#E2E8F0]">
                  <SelectValue placeholder="Mes Ref" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025-12">Dic 2025</SelectItem>
                  <SelectItem value="2025-11">Nov 2025</SelectItem>
                  <SelectItem value="2025-10">Oct 2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        <div className="bg-[#FEF3C7] border-b border-[#FDE68A] px-6 py-2 text-[#B45309] text-xs sm:text-sm font-medium flex items-center print:hidden">
          <span className="mr-2">📊</span>
          Este panel muestra estadísticas agregadas y anonimizadas. No contiene datos de pacientes individuales.
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full print:p-0 print:max-w-none flex-1">
          {renderActiveSection()}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          main, main * {
            visibility: visible;
          }
          main {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />
    </div>
  )
}

export default function AutoridadPanel() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center">Cargando...</div>}>
      <PanelContent />
    </Suspense>
  )
}

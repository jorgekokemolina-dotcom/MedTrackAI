'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, FileSpreadsheet, CalendarClock, Download, CheckCircle2 } from 'lucide-react'

interface SectionProps {
  rol: 'director' | 'autoridad'
  establecimientoId: string
  periodo: 'mes' | 'trimestre' | 'anual'
  mesActual: string
}

export default function ExportarReportes({ rol, establecimientoId, periodo, mesActual }: SectionProps) {
  const [toast, setToast] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  const handleProgramar = (e: React.FormEvent) => {
    e.preventDefault()
    setDialogOpen(false)
    setToast("Reporte programado. Se enviará el primer día hábil de cada mes al correo indicado.")
    setTimeout(() => setToast(null), 5000)
  }

  const generarPDF = async () => {
    setIsGeneratingPdf(true)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()
      
      doc.setFontSize(22)
      doc.setTextColor(14, 165, 196) // #0EA5C4
      doc.text("MedTrack AI", 20, 20)
      
      doc.setFontSize(14)
      doc.setTextColor(30, 41, 59)
      doc.text("Reporte Ejecutivo", 20, 30)
      
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(`Período: ${mesActual} (${periodo})`, 20, 40)
      doc.text(`Rol: ${rol.toUpperCase()}`, 20, 45)
      
      doc.setFontSize(12)
      doc.setTextColor(30, 41, 59)
      doc.text("Resumen de KPIs Principales:", 20, 60)
      
      const kpis = [
        "Cumplimiento GES: 94% (Óptimo)",
        "Índice Operacional (IOC): 82% (Normal)",
        "Tasa Ausentismo: 6.2% (Bajo meta)",
        "Adopción Ficha Digital: 34% (En progreso)",
        "Días Promedio Espera Cx: 145 días"
      ]
      
      kpis.forEach((kpi, idx) => {
        doc.text(`• ${kpi}`, 25, 70 + (idx * 10))
      })
      
      doc.save(`MedTrack_Reporte_${mesActual}.pdf`)
    } catch (error) {
      console.error("Error generating PDF", error)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const exportarExcel = async () => {
    try {
      const XLSX = await import('xlsx')
      const wb = XLSX.utils.book_new()
      
      const ws_data = [
        ["Métrica", "Valor", "Meta", "Estado"],
        ["Cumplimiento GES", "94%", ">90%", "Óptimo"],
        ["IOC", "82%", ">80%", "Normal"],
        ["Ausentismo", "6.2%", "<7%", "Óptimo"],
        ["Rotación", "8.4%", "<10%", "Normal"]
      ]
      
      const ws = XLSX.utils.aoa_to_sheet(ws_data)
      XLSX.utils.book_append_sheet(wb, ws, "Resumen")
      
      XLSX.writeFile(wb, `MedTrack_Datos_${mesActual}.xlsx`)
    } catch (error) {
      console.error("Error generating Excel", error)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {toast && (
        <div className="p-4 bg-[#DCFCE7] border border-[#16A34A] rounded-xl flex items-center gap-3 text-[#16A34A] animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="h-5 w-5 text-[#16A34A]" />
          {toast}
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Exportar y Reportes</h2>
        <p className="text-slate-600">Descargue los datos actuales o programe envíos automáticos.</p>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-[#F1F5F9] text-[#64748B] rounded-lg text-sm font-medium">
          Periodo seleccionado actual: <span className="text-[#0EA5C4] capitalize">{periodo}</span> ({mesActual})
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition-shadow border-[#FEE2E2]">
          <div className="h-16 w-16 bg-[#FEE2E2] rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-[#DC2626]" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Reporte Ejecutivo PDF</h3>
          <p className="text-slate-500 text-sm mb-6 flex-grow">
            Documento formal con gráficos, tablas y resumen de KPIs ideal para presentaciones y comités.
          </p>
          <div className="w-full space-y-3">
            <div className="text-left text-sm text-slate-600 mb-2 font-medium">Secciones a incluir:</div>
            <div className="grid grid-cols-2 gap-2 text-left text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded text-[#0EA5C4]" /> Resumen Ejecutivo</label>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded text-[#0EA5C4]" /> Acceso y Espera</label>
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="rounded text-[#0EA5C4]" /> Calidad y Seg.</label>
              <label className="flex items-center gap-2"><input type="checkbox" className="rounded text-[#0EA5C4]" /> Actividad Asist.</label>
            </div>
            <Button onClick={generarPDF} disabled={isGeneratingPdf} className="w-full mt-4 bg-[#DC2626] hover:bg-[#b91c1c] text-white rounded-xl">
              {isGeneratingPdf ? 'Generando...' : <><Download className="h-4 w-4 mr-2" /> Generar PDF</>}
            </Button>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl flex flex-col items-center text-center hover:shadow-md transition-shadow border-[#DCFCE7]">
          <div className="h-16 w-16 bg-[#DCFCE7] rounded-full flex items-center justify-center mb-4">
            <FileSpreadsheet className="h-8 w-8 text-[#16A34A]" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Datos Crudos Excel</h3>
          <p className="text-slate-500 text-sm mb-6 flex-grow">
            Libro de Excel con múltiples hojas conteniendo todos los datos tabulares para análisis propio.
          </p>
          <div className="w-full mt-auto pt-6">
            <Button onClick={exportarExcel} className="w-full bg-[#16A34A] hover:bg-[#15803d] text-white rounded-xl">
              <Download className="h-4 w-4 mr-2" /> Exportar a Excel
            </Button>
          </div>
        </Card>

        <Card className="p-6 rounded-2xl md:col-span-2 flex flex-col sm:flex-row items-center justify-between bg-[#F0F9FF] border-[#E0F2FE]">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm text-[#0EA5C4]">
              <CalendarClock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Reportes Automáticos</h3>
              <p className="text-sm text-slate-500">Recibe resúmenes periódicos directamente en tu bandeja de entrada.</p>
            </div>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button variant="outline" className="rounded-xl border-[#0EA5C4] text-[#0EA5C4] hover:bg-[#0EA5C4] hover:text-white whitespace-nowrap transition-colors" onClick={() => setDialogOpen(true)}>
                Programar Reporte
            </Button>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle>Programar Reporte</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleProgramar} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Correo Electrónico</label>
                  <Input type="email" placeholder="usuario@salud.cl" required className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Frecuencia</label>
                  <Select defaultValue="mensual">
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensual">Mensual</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Formato</label>
                  <Select defaultValue="pdf">
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Ejecutivo</SelectItem>
                      <SelectItem value="excel">Excel de Datos</SelectItem>
                      <SelectItem value="ambos">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="rounded-xl">Cancelar</Button>
                  <Button type="submit" className="bg-[#0EA5C4] hover:bg-[#0c8ba6] text-white rounded-xl">Guardar</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    </div>
  )
}

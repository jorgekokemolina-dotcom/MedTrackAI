"use client";

import { useMemo, useCallback } from "react";
import {
  FlaskConical,
  Pill,
  QrCode,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ClipboardList,
  Stethoscope,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import patients from "@/data/patients.json";
import labResults from "@/data/lab-results.json";
import medications from "@/data/medications.json";
import timelineEvents from "@/data/timeline-events.json";

const patient = patients[0]; // p001 as logged-in patient

function getStatusInfo(valor: number, rangoMin: number, rangoMax: number) {
  if (valor >= rangoMin && valor <= rangoMax) {
    return { label: "Normal", icon: CheckCircle2, color: "#16A34A", bg: "#DCFCE7" };
  }
  const deviation = valor < rangoMin ? (rangoMin - valor) / rangoMin : (valor - rangoMax) / rangoMax;
  if (deviation > 0.3) {
    return { label: "Fuera de rango", icon: XCircle, color: "#DC2626", bg: "#FEE2E2" };
  }
  return { label: "Revisar con tu médico", icon: AlertTriangle, color: "#F59E0B", bg: "#FEF3C7" };
}

export default function PacientePage() {
  const patientLabs = useMemo(
    () =>
      labResults
        .filter((l) => l.pacienteId === patient.id)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    []
  );
  const patientMeds = useMemo(
    () => medications.filter((m) => m.pacienteId === patient.id && m.estado === "Activo"),
    []
  );
  const patientEvents = useMemo(
    () =>
      timelineEvents
        .filter((e) => e.pacienteId === patient.id)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    []
  );

  const handleDownloadPDF = useCallback(async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(14, 165, 196);
    doc.text("MedTrack AI - Mis Exámenes", 20, 20);
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`Paciente: ${patient.nombre}`, 20, 32);
    doc.text(`RUT: ${patient.rut}`, 20, 39);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString("es-CL")}`, 20, 46);
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 52, 190, 52);

    let y = 60;
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("Fecha", 20, y);
    doc.text("Examen", 50, y);
    doc.text("Valor", 120, y);
    doc.text("Rango", 145, y);
    doc.text("Estado", 175, y);
    y += 8;

    doc.setTextColor(30, 41, 59);
    patientLabs.forEach((l) => {
      if (y > 270) { doc.addPage(); y = 20; }
      const status = l.valor >= l.rangoMin && l.valor <= l.rangoMax ? "Normal" : "Atención";
      doc.setFontSize(8);
      doc.text(new Date(l.fecha).toLocaleDateString("es-CL"), 20, y);
      doc.text(l.examen.substring(0, 35), 50, y);
      doc.text(`${l.valor}`, 120, y);
      doc.text(`${l.rangoMin}-${l.rangoMax} ${l.unidad}`, 138, y);
      doc.text(status, 175, y);
      y += 7;
    });

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("Este documento es una demostración. Datos ficticios.", 20, 285);
    doc.save(`examenes_${patient.rut.replace(/\./g, "")}.pdf`);
  }, [patientLabs]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-[#16A34A] to-[#15803d] rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md">
            {patient.nombre[0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">
              Hola, {patient.nombre.split(" ")[0]}
            </h1>
            <p className="text-sm text-[#64748B]">
              Bienvenido(a) a tu portal de salud
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Mis Exámenes */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2">
              <div className="w-8 h-8 bg-[#DCFCE7] rounded-lg flex items-center justify-center">
                <FlaskConical className="w-4 h-4 text-[#16A34A]" />
              </div>
              Mis Exámenes
            </h2>
            <Button
              onClick={handleDownloadPDF}
              className="bg-[#0EA5C4] hover:bg-[#0d8fa8] text-white rounded-xl text-sm h-9"
            >
              <Download className="w-4 h-4 mr-1" /> Descargar PDF
            </Button>
          </div>
          <div className="space-y-2">
            {patientLabs.map((l) => {
              const status = getStatusInfo(l.valor, l.rangoMin, l.rangoMax);
              return (
                <Card key={l.id} className="border-[#E2E8F0] rounded-xl">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-[#1E293B]">{l.examen}</p>
                      <p className="text-xs text-[#94A3B8]">
                        {new Date(l.fecha).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[#1E293B]">
                        {l.valor} {l.unidad}
                      </span>
                      <Badge className="text-xs font-medium border-0" style={{ backgroundColor: status.bg, color: status.color }}>
                        <status.icon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Mis Medicamentos */}
        <section>
          <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#FEF3C7] rounded-lg flex items-center justify-center">
              <Pill className="w-4 h-4 text-[#F59E0B]" />
            </div>
            Mis Medicamentos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {patientMeds.map((m) => (
              <Card key={m.id} className="border-[#E2E8F0] rounded-xl">
                <CardContent className="p-4">
                  <p className="font-semibold text-sm text-[#1E293B] mb-1">{m.medicamento}</p>
                  <p className="text-xs text-[#64748B]">
                    Tomar <span className="font-medium">{m.dosis}</span> {m.frecuencia.toLowerCase()}
                  </p>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Vía {m.via.toLowerCase()} · Desde {new Date(m.fechaInicio).toLocaleDateString("es-CL")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Compartir Historial */}
        <section>
          <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#F0F9FF] rounded-lg flex items-center justify-center">
              <QrCode className="w-4 h-4 text-[#0EA5C4]" />
            </div>
            Compartir mi Historial
          </h2>
          <Card className="border-[#E2E8F0] rounded-2xl">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
                <QRCodeSVG
                  value={`https://medtrack.demo/compartir/${patient.id}`}
                  size={160}
                  fgColor="#1E293B"
                  bgColor="#FFFFFF"
                  level="M"
                />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-sm text-[#1E293B] font-medium mb-2">
                  Comparte este código con tu médico particular
                </p>
                <p className="text-sm text-[#64748B] mb-3">
                  Tu médico podrá acceder a tu historial de forma temporal y
                  segura escaneando este código QR. El acceso expira
                  automáticamente después de 24 horas.
                </p>
                <Badge className="bg-[#DCFCE7] text-[#166534] border-0 text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Acceso cifrado y temporal
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Timeline Personal */}
        <section>
          <h2 className="text-lg font-bold text-[#1E293B] flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-[#F3E8FF] rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-[#8B5CF6]" />
            </div>
            Mi Historial de Salud
          </h2>
          <Card className="border-[#E2E8F0] rounded-2xl">
            <CardContent className="p-6">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#E2E8F0]" />
                <div className="space-y-6">
                  {patientEvents.map((ev) => {
                    const typeLabels: Record<string, string> = {
                      diagnostico: "Nuevo diagnóstico",
                      consulta: "Visita médica",
                      examen: "Resultado de examen",
                      cambio_medicacion: "Cambio en tu medicación",
                    };
                    const colors: Record<string, string> = {
                      diagnostico: "#DC2626",
                      consulta: "#0EA5C4",
                      examen: "#16A34A",
                      cambio_medicacion: "#F59E0B",
                    };
                    return (
                      <div key={ev.id} className="flex gap-4 ml-0">
                        <div className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white border-2" style={{ borderColor: colors[ev.tipo] || "#64748B" }}>
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[ev.tipo] || "#64748B" }} />
                        </div>
                        <div className="flex-1 pb-2">
                          <p className="text-xs font-medium" style={{ color: colors[ev.tipo] || "#64748B" }}>
                            {typeLabels[ev.tipo] || ev.tipo}
                          </p>
                          <p className="font-semibold text-sm text-[#1E293B]">{ev.titulo}</p>
                          <p className="text-xs text-[#64748B] mt-0.5">{ev.descripcion}</p>
                          <p className="text-xs text-[#94A3B8] mt-1">
                            {new Date(ev.fecha).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })} · {ev.profesional}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Heart,
  Thermometer,
  Droplets,
  Weight,
  Ruler,
  Activity,
  Phone,
  MapPin,
  Shield,
  Lock,
  Brain,
  Stethoscope,
  ClipboardList,
  FlaskConical,
  Pill,
  AlertTriangle,
  ImageIcon,
  Calendar,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import labResults from "@/data/lab-results.json";
import medications from "@/data/medications.json";
import timelineEvents from "@/data/timeline-events.json";
import medicalImages from "@/data/medical-images.json";

function getLabStatus(valor: number, rangoMin: number, rangoMax: number) {
  if (valor >= rangoMin && valor <= rangoMax) {
    return { label: "Normal", color: "bg-[#DCFCE7] text-[#166534]" };
  }
  const deviation =
    valor < rangoMin
      ? (rangoMin - valor) / rangoMin
      : (valor - rangoMax) / rangoMax;
  if (deviation > 0.3) {
    return { label: "Crítico", color: "bg-[#FEE2E2] text-[#991B1B]" };
  }
  return { label: "Atención", color: "bg-[#FEF3C7] text-[#92400E]" };
}

const eventIcons: Record<string, React.ElementType> = {
  diagnostico: Stethoscope,
  consulta: ClipboardList,
  examen: FlaskConical,
  cambio_medicacion: Pill,
};

const eventColors: Record<string, string> = {
  diagnostico: "#DC2626",
  consulta: "#0EA5C4",
  examen: "#16A34A",
  cambio_medicacion: "#F59E0B",
};

const eventBg: Record<string, string> = {
  diagnostico: "#FEE2E2",
  consulta: "#F0F9FF",
  examen: "#DCFCE7",
  cambio_medicacion: "#FEF3C7",
};

export default function PatientClient({ id, initialData }: { id: string, initialData: any }) {
  const router = useRouter();

  const patient = initialData;
  const patientLabs = useMemo(
    () =>
      labResults
        .filter((l) => l.pacienteId === id)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [id]
  );
  const patientMeds = useMemo(
    () => medications.filter((m) => m.pacienteId === id),
    [id]
  );
  const patientEvents = useMemo(
    () =>
      timelineEvents
        .filter((e) => e.pacienteId === id)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [id]
  );
  const patientImages = useMemo(
    () => medicalImages.filter((i) => i.pacienteId === id),
    [id]
  );

  if (!patient) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-[#64748B]">Paciente no encontrado.</p>
        <Link href="/medico" className="text-[#0EA5C4] underline mt-4 block">
          Volver al panel
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back + Patient Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/medico")}
          className="flex items-center gap-1 text-sm text-[#64748B] hover:text-[#0EA5C4] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al panel
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#0EA5C4] to-[#0d8fa8] rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md">
            {patient.nombre.split(" ")[0][0]}
            {patient.nombre.split(" ")[2]?.[0] || patient.nombre.split(" ")[1][0]}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">
              {patient.nombre}
            </h1>
            <p className="text-sm text-[#64748B]">
              RUT: {patient.rut} · {patient.edad} años · {patient.sexo} ·{" "}
              {patient.prevision}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumen" className="mb-8">
        <TabsList className="bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl p-1 flex flex-wrap gap-1 h-auto">
          {[
            { value: "resumen", label: "Resumen" },
            { value: "examenes", label: "Exámenes" },
            { value: "medicacion", label: "Medicación" },
            { value: "imagenes", label: "Imágenes" },
            { value: "timeline", label: "Línea de tiempo" },
          ].map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="rounded-lg text-sm data-[state=active]:bg-white data-[state=active]:text-[#0EA5C4] data-[state=active]:shadow-sm px-4 py-2"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* RESUMEN */}
        <TabsContent value="resumen" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Demographics */}
            <Card className="lg:col-span-2 border-[#E2E8F0] rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-[#1E293B] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#0EA5C4]" /> Datos del Paciente
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-[#64748B]">Nombre:</span> <span className="font-medium text-[#1E293B]">{patient.nombre}</span></div>
                <div><span className="text-[#64748B]">RUT:</span> <span className="font-mono text-[#1E293B]">{patient.rut}</span></div>
                <div><span className="text-[#64748B]">Edad:</span> <span className="text-[#1E293B]">{patient.edad} años</span></div>
                <div><span className="text-[#64748B]">Sexo:</span> <span className="text-[#1E293B]">{patient.sexo}</span></div>
                <div><span className="text-[#64748B]">Grupo sanguíneo:</span> <span className="font-semibold text-[#DC2626]">{patient.grupoSanguineo}</span></div>
                <div><span className="text-[#64748B]">Previsión:</span> <span className="text-[#1E293B]">{patient.prevision}</span></div>
                <div className="flex items-start gap-1"><MapPin className="w-3.5 h-3.5 text-[#64748B] mt-0.5 flex-shrink-0" /> <span className="text-[#1E293B]">{patient.direccion}, {patient.comuna}</span></div>
                <div className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#64748B]" /> <span className="text-[#1E293B]">{patient.telefono}</span></div>
              </CardContent>
            </Card>

            {/* Diagnoses & Allergies */}
            <div className="space-y-4">
              <Card className="border-[#E2E8F0] rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-[#1E293B] flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-[#0EA5C4]" /> Diagnósticos Activos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {patient.diagnosticosActivos.map((d) => (
                      <Badge key={d} className="bg-[#F0F9FF] text-[#0EA5C4] border-[#0EA5C4]/20 font-medium">{d}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-[#E2E8F0] rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-[#1E293B] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#F59E0B]" /> Alergias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patient.alergias.length === 0 ? (
                    <p className="text-sm text-[#64748B]">Sin alergias conocidas</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {patient.alergias.map((a) => (
                        <Badge key={a} className="bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/20 font-medium">{a}</Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="border-[#E2E8F0] rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold text-[#1E293B] flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#16A34A]" /> Contacto de Emergencia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#1E293B]">{patient.contactoEmergencia}</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Vital Signs */}
          <Card className="mt-6 border-[#E2E8F0] rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#1E293B] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0EA5C4]" /> Signos Vitales Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {[
                  { label: "Presión Arterial", value: patient.signosVitales.presionArterial, icon: Heart, color: "#DC2626", bg: "#FEE2E2" },
                  { label: "Frec. Cardíaca", value: patient.signosVitales.frecuenciaCardiaca, icon: Activity, color: "#0EA5C4", bg: "#F0F9FF" },
                  { label: "Temperatura", value: patient.signosVitales.temperatura, icon: Thermometer, color: "#F59E0B", bg: "#FEF3C7" },
                  { label: "Saturación O₂", value: patient.signosVitales.saturacionO2, icon: Droplets, color: "#0EA5C4", bg: "#F0F9FF" },
                  { label: "Peso", value: patient.signosVitales.peso, icon: Weight, color: "#16A34A", bg: "#DCFCE7" },
                  { label: "Talla", value: patient.signosVitales.talla, icon: Ruler, color: "#8B5CF6", bg: "#F3E8FF" },
                  { label: "IMC", value: patient.signosVitales.imc, icon: User, color: "#64748B", bg: "#F1F5F9" },
                ].map((v) => (
                  <div key={v.label} className="bg-white border border-[#E2E8F0] rounded-xl p-3 text-center">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: v.bg }}>
                      <v.icon className="w-4 h-4" style={{ color: v.color }} />
                    </div>
                    <p className="text-lg font-bold text-[#1E293B]">{v.value}</p>
                    <p className="text-[10px] text-[#64748B] font-medium">{v.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EXÁMENES */}
        <TabsContent value="examenes" className="mt-6">
          <Card className="border-[#E2E8F0] rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-[#1E293B] flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-[#16A34A]" /> Resultados de Laboratorio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F7FAFC]">
                      <TableHead className="text-xs font-semibold text-[#64748B] uppercase">Fecha</TableHead>
                      <TableHead className="text-xs font-semibold text-[#64748B] uppercase">Examen</TableHead>
                      <TableHead className="text-xs font-semibold text-[#64748B] uppercase text-right">Valor</TableHead>
                      <TableHead className="text-xs font-semibold text-[#64748B] uppercase">Unidad</TableHead>
                      <TableHead className="text-xs font-semibold text-[#64748B] uppercase">Rango Ref.</TableHead>
                      <TableHead className="text-xs font-semibold text-[#64748B] uppercase text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientLabs.map((l) => {
                      const status = getLabStatus(l.valor, l.rangoMin, l.rangoMax);
                      return (
                        <TableRow key={l.id} className="hover:bg-[#F7FAFC]">
                          <TableCell className="text-sm text-[#64748B]">
                            {new Date(l.fecha).toLocaleDateString("es-CL")}
                          </TableCell>
                          <TableCell className="text-sm font-medium text-[#1E293B]">
                            {l.examen}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-[#1E293B] text-right">
                            {l.valor}
                          </TableCell>
                          <TableCell className="text-sm text-[#64748B]">
                            {l.unidad}
                          </TableCell>
                          <TableCell className="text-sm text-[#64748B]">
                            {l.rangoMin} - {l.rangoMax}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${status.color} text-xs font-medium border-0`}>
                              {status.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MEDICACIÓN */}
        <TabsContent value="medicacion" className="mt-6">
          <Card className="border-[#E2E8F0] rounded-2xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-[#1E293B] flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#F59E0B]" /> Medicación
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F7FAFC]">
                      <TableHead className="text-xs font-semibold text-[#64748B] uppercase">Medicamento</TableHead>
                      <TableHead className="text-xs font-semibold text-[#64748B] uppercase">Dosis</TableHead>
                      <TableHead className="text-xs font-semibold text-[#64748B] uppercase">Frecuencia</TableHead>
                      <TableHead className="text-xs font-semibold text-[#64748B] uppercase">Vía</TableHead>
                      <TableHead className="text-xs font-semibold text-[#64748B] uppercase">Inicio</TableHead>
                      <TableHead className="text-xs font-semibold text-[#64748B] uppercase text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientMeds.map((m) => (
                      <TableRow
                        key={m.id}
                        className={`hover:bg-[#F7FAFC] ${m.estado === "Suspendido" ? "opacity-60" : ""}`}
                      >
                        <TableCell className={`text-sm font-medium ${m.estado === "Suspendido" ? "line-through text-[#94A3B8]" : "text-[#1E293B]"}`}>
                          {m.medicamento}
                        </TableCell>
                        <TableCell className="text-sm text-[#64748B]">{m.dosis}</TableCell>
                        <TableCell className="text-sm text-[#64748B]">{m.frecuencia}</TableCell>
                        <TableCell className="text-sm text-[#64748B]">{m.via}</TableCell>
                        <TableCell className="text-sm text-[#64748B]">
                          {new Date(m.fechaInicio).toLocaleDateString("es-CL")}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-xs font-medium border-0 ${m.estado === "Activo" ? "bg-[#DCFCE7] text-[#166534]" : "bg-[#F1F5F9] text-[#64748B]"}`}>
                            {m.estado}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IMÁGENES */}
        <TabsContent value="imagenes" className="mt-6">
          {patientImages.length === 0 ? (
            <Card className="border-[#E2E8F0] rounded-2xl">
              <CardContent className="p-12 text-center">
                <ImageIcon className="w-12 h-12 text-[#E2E8F0] mx-auto mb-3" />
                <p className="text-[#64748B]">No hay imágenes médicas registradas para este paciente.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {patientImages.map((img) => (
                <Card key={img.id} className="border-[#E2E8F0] rounded-2xl overflow-hidden">
                  <div className="h-40 bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-10 h-10 text-[#94A3B8] mx-auto mb-2" />
                      <p className="text-xs text-[#94A3B8] font-medium">Imagen de ejemplo</p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="font-semibold text-sm text-[#1E293B] mb-1">{img.tipo}</p>
                    <p className="text-xs text-[#64748B] mb-2">{img.descripcion}</p>
                    <div className="flex items-center justify-between text-xs text-[#94A3B8]">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(img.fecha).toLocaleDateString("es-CL")}</span>
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {img.centro.split(" ").slice(0, 2).join(" ")}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* LÍNEA DE TIEMPO */}
        <TabsContent value="timeline" className="mt-6">
          <Card className="border-[#E2E8F0] rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-[#1E293B]">
                Historia Clínica Cronológica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-[#E2E8F0]" />
                <div className="space-y-6">
                  {patientEvents.map((ev, i) => {
                    const Icon = eventIcons[ev.tipo] || ClipboardList;
                    const color = eventColors[ev.tipo] || "#64748B";
                    const bg = eventBg[ev.tipo] || "#F1F5F9";
                    return (
                      <div key={ev.id} className="relative flex gap-4 ml-0">
                        <div className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm" style={{ backgroundColor: bg }}>
                          <Icon className="w-5 h-5" style={{ color }} />
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-1">
                            <p className="font-semibold text-sm text-[#1E293B]">{ev.titulo}</p>
                            <span className="text-xs text-[#94A3B8]">
                              {new Date(ev.fecha).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
                            </span>
                          </div>
                          <p className="text-sm text-[#64748B] mb-2">{ev.descripcion}</p>
                          <p className="text-xs text-[#94A3B8]">
                            {ev.profesional} · {ev.centro}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Predictive Card */}
      <Card className="border-[#E2E8F0] rounded-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
          <div className="w-14 h-14 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-[#94A3B8]" />
          </div>
          <h3 className="text-lg font-bold text-[#1E293B] mb-2">
            Imhotep — Motor de IA Predictiva
          </h3>
          <p className="text-sm text-[#64748B] max-w-md text-center mb-4 px-6">
            Próximamente: Análisis de patrones con Imhotep — Esta función detectará
            automáticamente anomalías y sugerirá posibles diagnósticos basados
            en la historia clínica del paciente.
          </p>
          <Button
            disabled
            className="bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed rounded-xl"
          >
            <Brain className="w-4 h-4 mr-2" />
            Activar Imhotep (en desarrollo)
          </Button>
        </div>
        <CardContent className="p-8 opacity-30">
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-[#F7FAFC] rounded-xl" />
            <div className="h-24 bg-[#F7FAFC] rounded-xl" />
            <div className="h-24 bg-[#F7FAFC] rounded-xl" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

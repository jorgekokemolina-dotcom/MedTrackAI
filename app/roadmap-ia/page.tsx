"use client";

import {
  Brain,
  ShieldAlert,
  TrendingUp,
  MapPin,
  Sparkles,
  Mail,
  ArrowRight,
  Cpu,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Brain,
    title: "Detección de anomalías en laboratorio",
    description:
      "Identificación automática de valores fuera de rango y tendencias preocupantes en resultados de laboratorio. El modelo analizará series temporales de exámenes para detectar patrones que podrían pasar desapercibidos en revisiones manuales, alertando al médico antes de que un valor alcance niveles críticos.",
    eta: "Q1 2027",
  },
  {
    icon: ShieldAlert,
    title: "Interacciones medicamentosas",
    description:
      "Alertas en tiempo real sobre combinaciones de fármacos potencialmente peligrosas. Al prescribir un nuevo medicamento, el sistema verificará automáticamente la compatibilidad con todos los fármacos activos del paciente, considerando dosis, vía de administración y condiciones preexistentes.",
    eta: "Q2 2027",
  },
  {
    icon: TrendingUp,
    title: "Predicción de reingreso hospitalario",
    description:
      "Modelos predictivos para identificar pacientes con alto riesgo de rehospitalización en los próximos 30 días. Utilizando datos clínicos, demográficos y de adherencia al tratamiento, el sistema calculará un score de riesgo que permitirá intervención preventiva temprana.",
    eta: "Q3 2027",
  },
  {
    icon: MapPin,
    title: "Alertas al centro más cercano",
    description:
      "Notificaciones automáticas al centro de salud más cercano ante emergencias detectadas. Cuando el sistema identifique una situación de riesgo inminente basada en signos vitales o resultados críticos, podrá notificar proactivamente al servicio de urgencias más cercano al domicilio del paciente.",
    eta: "Q4 2027",
  },
];

export default function RoadmapIAPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-[#0EA5C4] to-[#8B5CF6] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#0EA5C4]/20">
          <Cpu className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-[#1E293B] mb-3">
          Roadmap de Imhotep — Motor de IA
        </h1>
        <p className="text-base text-[#64748B] max-w-2xl mx-auto">
          <span className="font-semibold text-[#1E293B]">Imhotep</span>, el motor de inteligencia artificial de MedTrack AI,
          integrará modelos especializados en salud para transformar la forma
          en que se analizan y utilizan los datos clínicos en Chile.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0EA5C4] via-[#8B5CF6] to-[#EC4899] hidden sm:block" />

        <div className="space-y-8">
          {features.map((feature, i) => (
            <div key={feature.title} className="relative flex gap-6">
              {/* Timeline dot */}
              <div className="hidden sm:flex relative z-10 w-16 flex-shrink-0 items-start justify-center pt-2">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-[#0EA5C4] flex items-center justify-center shadow-md">
                  <div className="w-2 h-2 rounded-full bg-[#0EA5C4] animate-pulse" />
                </div>
              </div>

              {/* Card */}
              <Card className="flex-1 border-[#E2E8F0] rounded-2xl hover:shadow-lg hover:border-[#0EA5C4]/30 transition-all duration-300 overflow-hidden group">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#F0F9FF] rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#0EA5C4] transition-colors duration-300">
                      <feature.icon className="w-6 h-6 text-[#0EA5C4] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                        <h3 className="text-lg font-bold text-[#1E293B]">
                          {feature.title}
                        </h3>
                        <div className="flex gap-2">
                          <Badge className="bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/20 text-xs font-semibold">
                            <Sparkles className="w-3 h-3 mr-1" />
                            En desarrollo
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-[#E2E8F0] text-[#64748B] text-xs"
                          >
                            {feature.eta}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-[#64748B] leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <Card className="border-[#E2E8F0] rounded-2xl bg-gradient-to-br from-[#F0F9FF] to-[#F7FAFC]">
          <CardContent className="p-8 sm:p-12">
            <h2 className="text-2xl font-bold text-[#1E293B] mb-3">
              ¿Interesado en ser parte del piloto?
            </h2>
            <p className="text-sm text-[#64748B] max-w-lg mx-auto mb-6">
              Estamos buscando hospitales y centros de salud innovadores para
              implementar el primer piloto de MedTrack AI en Chile. Contáctanos
              para ser parte de esta transformación.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="mailto:contacto@medtrack.ai"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#0EA5C4] hover:bg-[#0d8fa8] text-white rounded-xl font-medium text-sm transition-colors shadow-md shadow-[#0EA5C4]/20"
              >
                <Mail className="w-4 h-4" /> contacto@medtrack.ai
              </a>
              <span className="text-xs text-[#94A3B8]">
                Demo funcional · Datos ficticios
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

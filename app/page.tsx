"use client";

import Link from "next/link";
import {
  Activity,
  Stethoscope,
  User,
  Shield,
  ArrowRight,
  Heart,
  FileText,
  BarChart3,
  Building2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F0F9FF] via-white to-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#0EA5C4]/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#16A34A]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
          {/* Logo grande */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0EA5C4] to-[#0d8fa8] rounded-3xl flex items-center justify-center shadow-lg shadow-[#0EA5C4]/20 animate-pulse-slow">
              <Activity className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-[#1E293B] mb-4 tracking-tight">
            MedTrack <span className="text-[#0EA5C4]">AI</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#64748B] mb-2 max-w-2xl mx-auto font-medium">
            Plataforma de historia clínica unificada
          </p>
          <p className="text-base text-[#94A3B8] mb-12 max-w-xl mx-auto">
            Conectando el sistema de salud chileno con tecnología inteligente
          </p>

          {/* Role Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
            {/* Médico */}
            <Link href="/medico" className="group">
              <Card className="h-full border-[#E2E8F0] bg-white hover:border-[#0EA5C4]/40 hover:shadow-xl hover:shadow-[#0EA5C4]/10 transition-all duration-300 rounded-2xl overflow-hidden group-hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#F0F9FF] rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#0EA5C4] transition-colors duration-300">
                    <Stethoscope className="w-8 h-8 text-[#0EA5C4] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1E293B] mb-2">
                    Ingresar como Médico
                  </h2>
                  <p className="text-sm text-[#64748B] mb-4">
                    Accede a fichas clínicas, exámenes de laboratorio, historial
                    de medicación y línea de tiempo de tus pacientes.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#0EA5C4] group-hover:gap-2 transition-all">
                    Acceder al panel <ArrowRight className="w-4 h-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>

            {/* Paciente */}
            <Link href="/paciente" className="group">
              <Card className="h-full border-[#E2E8F0] bg-white hover:border-[#16A34A]/40 hover:shadow-xl hover:shadow-[#16A34A]/10 transition-all duration-300 rounded-2xl overflow-hidden group-hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#DCFCE7] rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#16A34A] transition-colors duration-300">
                    <User className="w-8 h-8 text-[#16A34A] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1E293B] mb-2">
                    Ingresar como Paciente
                  </h2>
                  <p className="text-sm text-[#64748B] mb-4">
                    Revisa tus exámenes, medicamentos y citas. Descarga
                    reportes y comparte tu historial de forma segura.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#16A34A] group-hover:gap-2 transition-all">
                    Ver mi historial <ArrowRight className="w-4 h-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>

            {/* Autoridad / Director */}
            <Link href="/autoridad" className="group">
              <Card className="h-full border-[#E2E8F0] bg-white hover:border-[#8B5CF6]/40 hover:shadow-xl hover:shadow-[#8B5CF6]/10 transition-all duration-300 rounded-2xl overflow-hidden group-hover:-translate-y-1">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#F3E8FF] rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-[#8B5CF6] transition-colors duration-300">
                    <Building2 className="w-8 h-8 text-[#8B5CF6] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1E293B] mb-2">
                    Ingresar como Autoridad / Director
                  </h2>
                  <p className="text-sm text-[#64748B] mb-4">
                    Panel de gestión con indicadores operacionales, clínicos y de
                    impacto MedTrack para directores y autoridades de salud.
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#8B5CF6] group-hover:gap-2 transition-all">
                    Ver panel de gestión <ArrowRight className="w-4 h-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Admin link */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/admin/cargar-datos"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F7FAFC] hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] rounded-xl text-sm font-medium transition-colors border border-[#E2E8F0]"
            >
              <FileText className="w-4 h-4" /> Cargar datos clínicos
            </Link>
            <Link
              href="/admin/estadisticas"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F7FAFC] hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#1E293B] rounded-xl text-sm font-medium transition-colors border border-[#E2E8F0]"
            >
              <BarChart3 className="w-4 h-4" /> Ver estadísticas
            </Link>
          </div>

          {/* Disclaimer */}
          <div className="inline-flex items-center gap-2 bg-[#FEF3C7] border border-[#F59E0B]/20 rounded-xl px-5 py-3 text-sm text-[#92400E]">
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>
              Esta es una demostración con datos ficticios. No contiene
              información de pacientes reales.
            </span>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="bg-[#F7FAFC] py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-center text-2xl font-bold text-[#1E293B] mb-10">
            Una plataforma, toda la historia clínica
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: Heart,
                title: "Interoperabilidad",
                desc: "Unifica datos de múltiples centros de salud en un solo expediente clínico.",
                color: "#DC2626",
                bg: "#FEE2E2",
              },
              {
                icon: FileText,
                title: "Historial completo",
                desc: "Exámenes, medicamentos, diagnósticos e imágenes accesibles en tiempo real.",
                color: "#0EA5C4",
                bg: "#F0F9FF",
              },
              {
                icon: BarChart3,
                title: "Analítica avanzada",
                desc: "Estadísticas poblacionales y detección inteligente de patrones clínicos.",
                color: "#16A34A",
                bg: "#DCFCE7",
              },
            ].map((f) => (
              <Card
                key={f.title}
                className="border-[#E2E8F0] bg-white rounded-2xl"
              >
                <CardContent className="p-6 text-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: f.bg }}
                  >
                    <f.icon className="w-6 h-6" style={{ color: f.color }} />
                  </div>
                  <h4 className="font-semibold text-[#1E293B] mb-2">
                    {f.title}
                  </h4>
                  <p className="text-sm text-[#64748B]">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

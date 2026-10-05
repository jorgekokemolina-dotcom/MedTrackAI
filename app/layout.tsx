"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  Activity,
  Menu,
  X,
  Stethoscope,
  User,
  Settings,
  Brain,
  ChevronDown,
  BarChart3,
  Upload,
  Building2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors duration-200 ${
      isActive(path)
        ? "text-[#0EA5C4]"
        : "text-[#64748B] hover:text-[#1E293B]"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-[#0EA5C4] to-[#0d8fa8] rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#1E293B]">
              MedTrack <span className="text-[#0EA5C4]">AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={linkClass("/")}>
              Inicio
            </Link>
            <Link href="/medico" className={linkClass("/medico")}>
              <span className="flex items-center gap-1">
                <Stethoscope className="w-4 h-4" /> Médico
              </span>
            </Link>
            <Link href="/paciente" className={linkClass("/paciente")}>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" /> Paciente
              </span>
            </Link>
            {/* Admin dropdown */}
            <div className="relative">
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className={`flex items-center gap-1 text-sm font-medium transition-colors duration-200 ${
                  isActive("/admin")
                    ? "text-[#0EA5C4]"
                    : "text-[#64748B] hover:text-[#1E293B]"
                }`}
              >
                <Settings className="w-4 h-4" /> Administración{" "}
                <ChevronDown className="w-3 h-3" />
              </button>
              {adminOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setAdminOpen(false)}
                  />
                  <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-2 w-56 z-50">
                    <Link
                      href="/admin/cargar-datos"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#64748B] hover:text-[#0EA5C4] hover:bg-[#F0F9FF] transition-colors"
                      onClick={() => setAdminOpen(false)}
                    >
                      <Upload className="w-4 h-4" /> Cargar datos
                    </Link>
                    <Link
                      href="/admin/estadisticas"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#64748B] hover:text-[#0EA5C4] hover:bg-[#F0F9FF] transition-colors"
                      onClick={() => setAdminOpen(false)}
                    >
                      <BarChart3 className="w-4 h-4" /> Estadísticas
                    </Link>
                  </div>
                </>
              )}
            </div>
            <Link href="/autoridad" className={linkClass("/autoridad")}>
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4" /> Panel de Gestión
              </span>
            </Link>
            <Link href="/roadmap-ia" className={linkClass("/roadmap-ia")}>
              <span className="flex items-center gap-1">
                <Brain className="w-4 h-4" /> Imhotep IA
              </span>
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Badge className="bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/30 hover:bg-[#FEF3C7] font-semibold text-xs px-3 py-1">
              DEMO
            </Badge>
            <button
              className="md:hidden p-2 rounded-lg hover:bg-[#F7FAFC] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-[#64748B]" />
              ) : (
                <Menu className="w-5 h-5 text-[#64748B]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-[#E2E8F0] mt-2 pt-4 space-y-1">
            {[
              { href: "/", label: "Inicio" },
              { href: "/medico", label: "Médico" },
              { href: "/paciente", label: "Paciente" },
              { href: "/admin/cargar-datos", label: "Cargar datos" },
              { href: "/admin/estadisticas", label: "Estadísticas" },
              { href: "/autoridad", label: "Panel de Gestión" },
              { href: "/roadmap-ia", label: "Imhotep IA" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-[#F0F9FF] text-[#0EA5C4]"
                    : "text-[#64748B] hover:bg-[#F7FAFC] hover:text-[#1E293B]"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#F7FAFC] border-t border-[#E2E8F0] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-[#0EA5C4]" />
          <span className="text-sm font-semibold text-[#1E293B]">
            MedTrack AI
          </span>
        </div>
        <p className="text-xs text-[#64748B]">
          Demo funcional. Datos ficticios con fines demostrativos. No contiene
          información de pacientes reales.
        </p>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <title>MedTrack AI — Historia Clínica Unificada</title>
        <meta
          name="description"
          content="Plataforma de historia clínica unificada para el sistema de salud chileno. Demo funcional con datos ficticios."
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

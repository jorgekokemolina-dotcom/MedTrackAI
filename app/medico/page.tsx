"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Users, Stethoscope, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Type interface for our backend data
interface Patient {
  id: string;
  nombre: string;
  rut: string;
  edad: number;
  sexo: string;
  diagnosticosActivos: string[];
}

export default function MedicoDashboard() {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch real data on mount
  useEffect(() => {
    fetch('/api/medico/pacientes')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPatients(data.pacientes);
        }
      })
      .catch(err => console.error("Error cargando pacientes:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return patients;
    const q = search.toLowerCase();
    return patients.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.rut.toLowerCase().includes(q)
    );
  }, [search, patients]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F0F9FF] rounded-xl flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-[#0EA5C4]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">
              Panel del Médico (Conectado a Supabase)
            </h1>
            <p className="text-sm text-[#64748B]">
              Descifrado AES-256-GCM en servidor
            </p>
          </div>
        </div>
        {loading && (
          <div className="flex items-center text-sm text-[#64748B] gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" /> Descifrando datos...
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total descifrados", value: loading ? '-' : patients.length, icon: Users, color: "#0EA5C4", bg: "#F0F9FF" },
          { label: "Casos activos", value: loading ? '-' : patients.length, icon: Stethoscope, color: "#F59E0B", bg: "#FEF3C7" },
          { label: "En observación", value: loading ? '-' : Math.floor(patients.length * 0.1), icon: Stethoscope, color: "#DC2626", bg: "#FEE2E2" },
          { label: "Edad promedio", value: loading || patients.length === 0 ? '-' : Math.round(patients.reduce((a, p) => a + p.edad, 0) / patients.length), icon: Users, color: "#16A34A", bg: "#DCFCE7" },
        ].map((s) => (
          <Card key={s.label} className="border-[#E2E8F0] rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1E293B]">{s.value}</p>
                  <p className="text-xs text-[#64748B]">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card className="border-[#E2E8F0] rounded-2xl mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <Input
              placeholder="Buscar por nombre o RUT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-[#E2E8F0] rounded-xl h-11 text-sm"
            />
          </div>
          {search && (
            <p className="text-xs text-[#64748B] mt-2">
              {filtered.length} de {patients.length} pacientes
            </p>
          )}
        </CardContent>
      </Card>

      {/* Desktop Table */}
      <Card className="border-[#E2E8F0] rounded-2xl overflow-hidden hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F7FAFC] hover:bg-[#F7FAFC]">
              <TableHead className="text-[#64748B] font-semibold text-xs uppercase tracking-wider">Nombre</TableHead>
              <TableHead className="text-[#64748B] font-semibold text-xs uppercase tracking-wider">RUT</TableHead>
              <TableHead className="text-[#64748B] font-semibold text-xs uppercase tracking-wider">Edad</TableHead>
              <TableHead className="text-[#64748B] font-semibold text-xs uppercase tracking-wider">Sexo</TableHead>
              <TableHead className="text-[#64748B] font-semibold text-xs uppercase tracking-wider">Diagnósticos Activos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow
                key={p.id}
                className="cursor-pointer hover:bg-[#F0F9FF] transition-colors"
                onClick={() => router.push(`/medico/paciente/${p.id}`)}
              >
                <TableCell className="font-medium text-[#1E293B]">
                  {p.nombre}
                </TableCell>
                <TableCell className="text-[#64748B] font-mono text-sm">
                  {p.rut}
                </TableCell>
                <TableCell className="text-[#64748B]">{p.edad} años</TableCell>
                <TableCell className="text-[#64748B]">{p.sexo}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {p.diagnosticosActivos.map((d) => (
                      <Badge
                        key={d}
                        variant="secondary"
                        className="bg-[#F0F9FF] text-[#0EA5C4] border-[#0EA5C4]/20 text-xs font-medium"
                      >
                        {d}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-3">
        {filtered.map((p) => (
          <Link key={p.id} href={`/medico/paciente/${p.id}`}>
            <Card className="border-[#E2E8F0] rounded-xl hover:border-[#0EA5C4]/40 hover:shadow-md transition-all">
              <CardContent className="p-4">
                <p className="font-semibold text-[#1E293B] mb-1">{p.nombre}</p>
                <p className="text-xs text-[#64748B] font-mono mb-2">
                  {p.rut} · {p.edad} años · {p.sexo}
                </p>
                <div className="flex flex-wrap gap-1">
                  {p.diagnosticosActivos.map((d) => (
                    <Badge
                      key={d}
                      variant="secondary"
                      className="bg-[#F0F9FF] text-[#0EA5C4] border-[#0EA5C4]/20 text-xs"
                    >
                      {d}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

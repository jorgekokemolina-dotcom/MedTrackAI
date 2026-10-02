"use client";

import { useState, useMemo, useCallback } from "react";
import {
  BarChart3,
  Users,
  FlaskConical,
  ShieldCheck,
  Clock,
  Download,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import patients from "@/data/patients.json";
import labResults from "@/data/lab-results.json";
import healthCenters from "@/data/health-centers.json";

const PIE_COLORS = ["#0EA5C4", "#16A34A", "#F59E0B", "#8B5CF6", "#EC4899"];

export default function EstadisticasPage() {
  const [centerFilter, setCenterFilter] = useState("todos");
  const [dateFrom, setDateFrom] = useState("2025-07-01");
  const [dateTo, setDateTo] = useState("2026-07-14");

  // KPI data
  const totalPatients = patients.length;
  const recentExams = labResults.filter((l) => {
    const d = new Date(l.fecha);
    return d >= new Date("2026-06-01") && d <= new Date("2026-07-14");
  }).length;

  // Age distribution
  const ageData = useMemo(() => {
    const ranges = [
      { range: "18-30", min: 18, max: 30, count: 0 },
      { range: "31-45", min: 31, max: 45, count: 0 },
      { range: "46-60", min: 46, max: 60, count: 0 },
      { range: "61+", min: 61, max: 999, count: 0 },
    ];
    const filteredPatients = centerFilter === "todos"
      ? patients
      : patients.filter((p) => p.centroSalud === centerFilter);
    filteredPatients.forEach((p) => {
      const bucket = ranges.find((r) => p.edad >= r.min && p.edad <= r.max);
      if (bucket) bucket.count++;
    });
    return ranges.map((r) => ({ name: r.range, pacientes: r.count }));
  }, [centerFilter]);

  // Glucose trend over time
  const glucoseTrend = useMemo(() => {
    const glucoseExams = labResults
      .filter(
        (l) =>
          l.examen === "Glucosa en ayunas" &&
          new Date(l.fecha) >= new Date(dateFrom) &&
          new Date(l.fecha) <= new Date(dateTo)
      )
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

    const monthlyMap = new Map<string, { sum: number; count: number }>();
    glucoseExams.forEach((l) => {
      const month = l.fecha.substring(0, 7);
      const entry = monthlyMap.get(month) || { sum: 0, count: 0 };
      entry.sum += l.valor;
      entry.count++;
      monthlyMap.set(month, entry);
    });

    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      mes: new Date(month + "-01").toLocaleDateString("es-CL", { month: "short", year: "2-digit" }),
      promedio: Math.round(data.sum / data.count),
    }));
  }, [dateFrom, dateTo]);

  // Diagnosis distribution
  const diagnosisData = useMemo(() => {
    const counts = new Map<string, number>();
    const filteredPatients = centerFilter === "todos"
      ? patients
      : patients.filter((p) => p.centroSalud === centerFilter);
    filteredPatients.forEach((p) => {
      p.diagnosticosActivos.forEach((d) => {
        counts.set(d, (counts.get(d) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [centerFilter]);

  const handleExportPDF = useCallback(async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(14, 165, 196);
    doc.text("MedTrack AI - Reporte Estadístico", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text(`Fecha: ${new Date().toLocaleDateString("es-CL")}`, 20, 32);
    doc.text(`Centro: ${centerFilter === "todos" ? "Todos" : centerFilter}`, 20, 39);

    doc.setDrawColor(226, 232, 240);
    doc.line(20, 45, 190, 45);

    doc.setFontSize(14);
    doc.text("Métricas Clave (KPI)", 20, 55);
    doc.setFontSize(10);
    doc.text(`• Total pacientes: ${totalPatients}`, 25, 65);
    doc.text(`• Exámenes cargados este mes: ${recentExams}`, 25, 73);
    doc.text(`• Duplicados evitados (estimado): 7`, 25, 81);
    doc.text(`• Tiempo promedio de acceso: 1.2s`, 25, 89);

    doc.setFontSize(14);
    doc.text("Distribución por Diagnósticos", 20, 105);
    doc.setFontSize(10);
    diagnosisData.forEach((d, i) => {
      doc.text(`• ${d.name}: ${d.value} pacientes`, 25, 115 + i * 8);
    });

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("Este documento es una demostración. Datos ficticios.", 20, 285);
    doc.save("reporte_medtrack_ai.pdf");
  }, [centerFilter, diagnosisData, totalPatients, recentExams]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-[#F0F9FF] rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#0EA5C4]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">Estadísticas</h1>
            <p className="text-sm text-[#64748B]">
              Dashboard de métricas poblacionales
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total pacientes", value: totalPatients, icon: Users, color: "#0EA5C4", bg: "#F0F9FF" },
          { label: "Exámenes este mes", value: recentExams, icon: FlaskConical, color: "#16A34A", bg: "#DCFCE7" },
          { label: "Duplicados evitados", value: 7, icon: ShieldCheck, color: "#F59E0B", bg: "#FEF3C7" },
          { label: "Tiempo de acceso", value: "1.2s", icon: Clock, color: "#8B5CF6", bg: "#F3E8FF" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-[#E2E8F0] rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-[#1E293B]">{kpi.value}</p>
                  <p className="text-xs text-[#64748B] mt-1">{kpi.label}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: kpi.bg }}>
                  <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-[#E2E8F0] rounded-xl mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-[#64748B]">
              <Filter className="w-4 h-4" /> Filtros:
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              <Select value={centerFilter} onValueChange={(v) => setCenterFilter(v ?? "todos")}>
                <SelectTrigger className="rounded-xl border-[#E2E8F0] text-sm">
                  <SelectValue placeholder="Centro de salud" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los centros</SelectItem>
                  {healthCenters.map((c) => (
                    <SelectItem key={c.id} value={c.nombre}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-xl border-[#E2E8F0] text-sm"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-xl border-[#E2E8F0] text-sm"
              />
            </div>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="rounded-xl border-[#E2E8F0] text-[#64748B] hover:text-[#0EA5C4] hover:border-[#0EA5C4]"
            >
              <Download className="w-4 h-4 mr-1" /> Exportar reporte
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Age Distribution */}
        <Card className="border-[#E2E8F0] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#1E293B]">
              Pacientes por Rango Etario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748B" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
                  }}
                />
                <Bar dataKey="pacientes" fill="#0EA5C4" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart - Glucose Trend */}
        <Card className="border-[#E2E8F0] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#1E293B]">
              Tendencia de Glucosa Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={glucoseTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#64748B" }} />
                <YAxis tick={{ fontSize: 12, fill: "#64748B" }} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="promedio"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ fill: "#F59E0B", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Diagnosis Distribution */}
        <Card className="border-[#E2E8F0] rounded-2xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#1E293B]">
              Distribución de Diagnósticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={diagnosisData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={{ stroke: "#94A3B8" }}
                >
                  {diagnosisData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", color: "#64748B" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

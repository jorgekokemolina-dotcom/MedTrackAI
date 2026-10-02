"use client";

import { useState, useCallback } from "react";
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  ShieldAlert,
  Database,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDropzone } from "react-dropzone";
import patients from "@/data/patients.json";
import { generateSyntheticDataset } from "@/lib/synthetic-generator";

const dataTypes = [
  "Datos demográficos",
  "Exámenes de laboratorio",
  "Medicación",
  "Diagnósticos",
];

const etlSteps = [
  "Validando estructura del archivo...",
  "Calculando hash SHA-256 + Salt para RUTs...",
  "Aplicando cifrado por sobres (AES-256-GCM)...",
  "Insertando en Supabase (PostgreSQL)...",
  "Registrando traza en tabla Auditoría...",
];

export default function CargarDatosPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, unknown>[]>([]);
  const [preview, setPreview] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [dataType, setDataType] = useState("Datos demográficos");
  const [isRealData, setIsRealData] = useState(false);

  const [etlRunning, setEtlRunning] = useState(false);
  const [etlStep, setEtlStep] = useState(-1);
  const [etlProgress, setEtlProgress] = useState(0);
  const [etlDone, setEtlDone] = useState(false);
  const [etlResult, setEtlResult] = useState<{ processed: number; duplicates: number; message: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generador de datos sintéticos masivos
  const [generatingSynthetic, setGeneratingSynthetic] = useState(false);

  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePatient, setImagePatient] = useState("");
  const [imageType, setImageType] = useState("");
  const [imageDate, setImageDate] = useState("");
  const [imageCenter, setImageCenter] = useState("");
  const [imageAssociated, setImageAssociated] = useState(false);

  const parseCSV = useCallback(async (file: File) => {
    const Papa = (await import("papaparse")).default;
    const text = await file.text();
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (result: { data: Record<string, unknown>[] }) => {
        const rows = result.data;
        if (rows.length > 0) {
          const keys = Object.keys(rows[0]);
          setHeaders(keys);
          setParsedRows(rows);
          setPreview(
            rows.slice(0, 10).map((r) => keys.map((k) => String(r[k] ?? "")))
          );
        }
      },
    });
  }, []);

  const parseXLSX = useCallback(async (file: File) => {
    const XLSX = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
    if (rows.length > 0) {
      const keys = Object.keys(rows[0]);
      setHeaders(keys);
      setParsedRows(rows);
      setPreview(
        rows.slice(0, 10).map((r) => keys.map((k) => String(r[k] ?? "")))
      );
    }
  }, []);

  const parseJSON = useCallback(async (file: File) => {
    const text = await file.text();
    const json = JSON.parse(text);
    const rows = Array.isArray(json) ? json : [json];
    if (rows.length > 0) {
      const keys = Object.keys(rows[0]);
      setHeaders(keys);
      setParsedRows(rows);
      setPreview(
        rows.slice(0, 10).map((r) => keys.map((k) => String(r[k] ?? "")))
      );
    }
  }, []);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const f = acceptedFiles[0];
      if (!f) return;
      setFile(f);
      setEtlDone(false);
      setEtlStep(-1);
      setEtlProgress(0);
      setErrorMessage(null);
      setEtlResult(null);

      const ext = f.name.split(".").pop()?.toLowerCase();
      if (ext === "csv") await parseCSV(f);
      else if (ext === "xlsx" || ext === "xls") await parseXLSX(f);
      else if (ext === "json") await parseJSON(f);
    },
    [parseCSV, parseXLSX, parseJSON]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "application/json": [".json"],
    },
    maxFiles: 1,
  });

  const sendToApi = async (records: Record<string, unknown>[], isReal: boolean) => {
    setEtlRunning(true);
    setEtlDone(false);
    setErrorMessage(null);
    setEtlStep(0);
    setEtlProgress(10);

    // Animación visual de pasos de ingestión
    for (let i = 0; i < etlSteps.length; i++) {
      setEtlStep(i);
      setEtlProgress(((i + 1) / etlSteps.length) * 90);
      await new Promise((res) => setTimeout(res, 400));
    }

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataType,
          records,
          isRealData: isReal,
          source: isReal ? "hospital_rce_export" : "synthetic",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Error al procesar los datos");
        setEtlRunning(false);
        setEtlProgress(100);
        return;
      }

      setEtlProgress(100);
      setEtlResult({
        processed: data.processed ?? records.length,
        duplicates: data.duplicates ?? 0,
        message: data.message || "Procesamiento y cifrado completado.",
      });
      setEtlDone(true);
    } catch (err: unknown) {
      const errStr = err instanceof Error ? err.message : 'Error al conectar con la API';
      setErrorMessage(errStr);
    } finally {
      setEtlRunning(false);
    }
  };

  const handleRunEtl = () => {
    if (parsedRows.length === 0) return;
    sendToApi(parsedRows, isRealData);
  };

  const handleGenerateSynthetic = () => {
    setGeneratingSynthetic(true);
    setTimeout(() => {
      const synData = generateSyntheticDataset(10000);
      const rows = synData.patients.map((p) => ({
        rut: p.rut,
        nombre: p.nombreCompleto,
        fecha_nacimiento: p.fechaNacimiento,
        sexo: p.sexo,
        direccion: p.direccion,
        comuna: p.comuna,
      }));
      setHeaders(["rut", "nombre", "fecha_nacimiento", "sexo", "direccion", "comuna"]);
      setParsedRows(rows);
      setPreview(rows.slice(0, 10).map((r) => [r.rut, r.nombre, r.fecha_nacimiento, r.sexo, r.direccion, r.comuna]));
      setFile(new File([JSON.stringify(rows)], "synthetic_dataset_10000_patients.json", { type: "application/json" }));
      setGeneratingSynthetic(false);
    }, 500);
  };

  // Image dropzone
  const onImageDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0];
    if (!f) return;
    setImageFile(f);
    setImageAssociated(false);
    const url = URL.createObjectURL(f);
    setImagePreview(url);
  }, []);

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
  } = useDropzone({
    onDrop: onImageDrop,
    accept: { "image/*": [".jpg", ".jpeg", ".png"] },
    maxFiles: 1,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ADVERTENCIA LEGAL Y ÉTICA VISIBLE */}
      <div className="mb-6 bg-[#FEF2F2] border-l-4 border-[#DC2626] p-4 rounded-xl shadow-sm">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-[#991B1B]">
              ⚠️ ADVERTENCIA DE SEGURIDAD Y CUMPLIMIENTO LEGAL (LEY 19.628)
            </h3>
            <p className="text-xs text-[#7F1D1D] mt-1 leading-relaxed">
              Este sistema no debe recibir datos de pacientes reales hasta contar con:{" "}
              <strong>(1) convenio firmado con el centro de salud piloto</strong>,{" "}
              <strong>(2) aprobación del comité de ética</strong>,{" "}
              <strong>(3) DUA (acuerdo de uso de datos) vigente</strong>, y{" "}
              <strong>(4) una revisión de seguridad externa del cifrado y control de acceso.</strong>
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F0F9FF] rounded-xl flex items-center justify-center">
            <Upload className="w-5 h-5 text-[#0EA5C4]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">
              Carga e Ingesta de Datos Clínicos
            </h1>
            <p className="text-sm text-[#64748B]">
              Conexión directa a backend Supabase (PostgreSQL) con cifrado por sobres AES-256-GCM
            </p>
          </div>
        </div>

        <Button
          onClick={handleGenerateSynthetic}
          disabled={generatingSynthetic}
          variant="outline"
          className="border-[#0EA5C4] text-[#0EA5C4] hover:bg-[#F0F9FF] rounded-xl flex items-center gap-2"
        >
          {generatingSynthetic ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          Generar Dataset Sintético (~10.000 pacientes)
        </Button>
      </div>

      {/* File Upload Section */}
      <Card className="border-[#E2E8F0] rounded-2xl mb-8">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#1E293B] flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#0EA5C4]" /> Ingesta de Archivos Clínicos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-[#0EA5C4] bg-[#F0F9FF]"
                : "border-[#E2E8F0] bg-[#F7FAFC] hover:border-[#0EA5C4]/50 hover:bg-[#F0F9FF]/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#1E293B] mb-1">
              {isDragActive
                ? "Suelta el archivo aquí..."
                : "Arrastra un archivo CSV, XLSX o JSON aquí"}
            </p>
            <p className="text-xs text-[#94A3B8]">
              o haz clic para seleccionar un archivo
            </p>
          </div>

          {/* File info */}
          {file && (
            <div className="flex items-center justify-between bg-[#F7FAFC] rounded-xl p-3 border border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0EA5C4]" />
                <span className="text-sm font-medium text-[#1E293B]">{file.name}</span>
                <span className="text-xs text-[#94A3B8]">
                  ({(file.size / 1024).toFixed(1)} KB — {parsedRows.length} filas)
                </span>
              </div>
              <button onClick={() => { setFile(null); setPreview([]); setHeaders([]); setParsedRows([]); setEtlDone(false); setErrorMessage(null); }}>
                <X className="w-4 h-4 text-[#94A3B8] hover:text-[#DC2626]" />
              </button>
            </div>
          )}

          {/* Preview */}
          {headers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-[#64748B]" />
                <span className="text-sm font-medium text-[#1E293B]">
                  Vista previa de datos a cifrar e ingresar (primeras 10 filas)
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F7FAFC]">
                      {headers.map((h, i) => (
                        <TableHead key={i} className="text-xs font-semibold text-[#64748B] whitespace-nowrap">
                          {h}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, i) => (
                      <TableRow key={i}>
                        {row.map((cell, j) => (
                          <TableCell key={j} className="text-xs text-[#1E293B] whitespace-nowrap">
                            {String(cell).substring(0, 40)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Selector de Tipo de Dato + Opción de Origen Real (Simulación de Bloqueo) */}
          {parsedRows.length > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[#64748B] mb-1 block">
                    Tipo de dato clínico
                  </label>
                  <Select value={dataType} onValueChange={(v) => setDataType(v ?? "Datos demográficos")}>
                    <SelectTrigger className="rounded-xl border-[#E2E8F0]">
                      <SelectValue placeholder="Seleccionar tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      {dataTypes.map((dt) => (
                        <SelectItem key={dt} value={dt}>
                          {dt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#1E293B] cursor-pointer p-2 rounded-xl border border-[#E2E8F0] bg-[#F7FAFC]">
                    <input
                      type="checkbox"
                      checked={isRealData}
                      onChange={(e) => setIsRealData(e.target.checked)}
                      className="rounded text-[#0EA5C4] focus:ring-[#0EA5C4]"
                    />
                    <span>Marcar este lote como <strong>"Origen Pacientes Reales (RCE)"</strong></span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleRunEtl}
                  disabled={etlRunning}
                  className="bg-[#0EA5C4] hover:bg-[#0d8fa8] text-white rounded-xl font-medium"
                >
                  {etlRunning ? "Procesando y Cifrando..." : "Cifrar con Envelope Encryption e Insertar en Supabase"}
                </Button>
              </div>
            </div>
          )}

          {/* Mensajes de error de bloqueo explicito */}
          {errorMessage && (
            <div className="p-4 bg-[#FEF2F2] rounded-xl border border-[#DC2626]/30 text-[#991B1B]">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">Error en la Ingesta / Bloqueo de Seguridad</p>
                  <p className="text-xs mt-1 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* ETL Progress */}
          {(etlRunning || etlDone) && !errorMessage && (
            <div className="bg-[#F7FAFC] rounded-xl p-6 border border-[#E2E8F0]">
              <Progress value={etlProgress} className="h-2 mb-4" />
              <div className="space-y-2 mb-4">
                {etlSteps.map((step, i) => (
                  <div key={step} className="flex items-center gap-2 text-sm">
                    {etlStep > i || etlDone ? (
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                    ) : etlStep === i ? (
                      <div className="w-4 h-4 border-2 border-[#0EA5C4] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-[#E2E8F0] rounded-full" />
                    )}
                    <span className={etlStep >= i || etlDone ? "text-[#1E293B] font-medium" : "text-[#94A3B8]"}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>

              {etlDone && etlResult && (
                <div className="p-4 bg-[#DCFCE7] rounded-xl border border-[#16A34A]/20">
                  <p className="text-sm font-semibold text-[#166534] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Ingesta y Cifrado Exitoso
                  </p>
                  <p className="text-xs text-[#166534] mt-1">
                    {etlResult.message}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Badge className="bg-[#166534] text-white border-0 text-[10px]">
                      AES-256-GCM Envelope Encryption
                    </Badge>
                    <Badge className="bg-[#166534] text-white border-0 text-[10px]">
                      SHA-256 Rut Hash + Salt
                    </Badge>
                    <Badge className="bg-[#166534] text-white border-0 text-[10px]">
                      Auditoría Registrada
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Upload Section */}
      <Card className="border-[#E2E8F0] rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-[#1E293B] flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[#8B5CF6]" /> Metadatos de Imágenes Médicas (Supabase Storage)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            {...getImageRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
              isImageDragActive
                ? "border-[#8B5CF6] bg-[#F3E8FF]"
                : "border-[#E2E8F0] bg-[#F7FAFC] hover:border-[#8B5CF6]/50"
            }`}
          >
            <input {...getImageInputProps()} />
            <ImageIcon className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#1E293B]">
              Arrastra imágenes médicas (JPG, PNG) para registrar metadatos
            </p>
            <p className="text-xs text-[#94A3B8]">Las imágenes reales se derivan a Supabase Storage</p>
          </div>

          {imagePreview && (
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-48 h-48 rounded-xl overflow-hidden border border-[#E2E8F0] flex-shrink-0">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-xs font-medium text-[#64748B] mb-1 block">Asociar a paciente</label>
                  <Select value={imagePatient} onValueChange={(v) => setImagePatient(v ?? "")}>
                    <SelectTrigger className="rounded-xl border-[#E2E8F0]">
                      <SelectValue placeholder="Seleccionar paciente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nombre} — {p.rut}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#64748B] mb-1 block">Tipo de estudio</label>
                    <Input
                      value={imageType}
                      onChange={(e) => setImageType(e.target.value)}
                      placeholder="Ej: Radiografía de Tórax"
                      className="rounded-xl border-[#E2E8F0] text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#64748B] mb-1 block">Fecha</label>
                    <Input
                      type="date"
                      value={imageDate}
                      onChange={(e) => setImageDate(e.target.value)}
                      className="rounded-xl border-[#E2E8F0] text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#64748B] mb-1 block">Centro de Salud</label>
                    <Input
                      value={imageCenter}
                      onChange={(e) => setImageCenter(e.target.value)}
                      placeholder="Ej: Hospital Barros Luco"
                      className="rounded-xl border-[#E2E8F0] text-sm"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => setImageAssociated(true)}
                  disabled={!imagePatient}
                  className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl"
                >
                  Asociar Imagen y Registrar Auditoría
                </Button>
                {imageAssociated && (
                  <Badge className="bg-[#DCFCE7] text-[#166534] border-0 ml-2">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Imagen y metadatos registrados correctamente
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

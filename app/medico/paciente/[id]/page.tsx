import patients from "@/data/patients.json";
import PatientClient from "./PatientClient";

export function generateStaticParams() {
  return patients.map((p) => ({ id: p.id }));
}

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientClient id={id} />;
}

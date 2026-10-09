import TeachersView from "@/components/teachers/TeachersView";

export const dynamic = "force-dynamic";

export default function DashboardProfesoresPage() {
  return <TeachersView basePath="/dashboard/profesores" />;
}
import TeacherProfile from "@/components/teachers/TeacherProfile";

export const dynamic = "force-dynamic";

export default async function DashboardProfesorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <TeacherProfile
      id={id}
      basePath="/dashboard/profesores"
      lessonsPath="/dashboard/lecciones"
    />
  );
}
import TeacherProfile from "@/components/teachers/TeacherProfile";

export const dynamic = "force-dynamic";

export default async function ProfesorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TeacherProfile id={id} basePath="/profesores" lessonsPath={null} />;
}
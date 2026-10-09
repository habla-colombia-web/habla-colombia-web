import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentsDashboard from "@/components/admin/StudentsDashboard";
import { toStudent, type StudentRaw } from "@/lib/students";

export default async function AdminEstudiantesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const sp = await searchParams;
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q) ?? "";

  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data: isAdmin } = await sb.rpc("is_admin");
  if (!isAdmin) redirect("/");

  const { data, error } = await sb.rpc("admin_list_students");
  const students = ((data ?? []) as unknown as StudentRaw[]).map(toStudent);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-bold text-navy">Estudiantes</h1>
      <p className="mt-2 text-sm text-muted">
        Aqui puedes ver el progreso, nivel y estado de tus estudiantes.
      </p>
      <div className="mt-6">
        {error ? (
          <p className="text-muted">
            No pudimos cargar los estudiantes. Revisa que el SQL del lote 1
            se haya ejecutado.
          </p>
        ) : (
          <StudentsDashboard key={q} students={students} initialQuery={q} />
        )}
      </div>
    </div>
  );
}
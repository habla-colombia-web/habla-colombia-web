import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CourseModules from "@/components/admin/CourseModules";

type CourseRow = { id: string; title: string };
type ModuleRow = { id: string; course_id: string; title: string; position: number };
type LessonRow = {
  id: string;
  course_id: string;
  title: string;
  module_id: string | null;
};

export default async function AdminModulosPage() {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data: isAdmin } = await sb.rpc("is_admin");
  if (!isAdmin) redirect("/");

  const [coursesRes, modulesRes, lessonsRes] = await Promise.all([
    sb.from("courses").select("id,title").order("title"),
    sb.from("course_modules").select("id,course_id,title,position").order("position"),
    sb.from("lessons").select("id,course_id,title,module_id").order("sort"),
  ]);

  const courses = (coursesRes.data ?? []) as unknown as CourseRow[];
  const modules = (modulesRes.data ?? []) as unknown as ModuleRow[];
  const lessons = (lessonsRes.data ?? []) as unknown as LessonRow[];

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Link href="/admin" className="text-sm font-semibold text-brand">
        Volver al panel
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-navy">Modulos</h1>
      <p className="mt-2 text-sm text-muted">
        Agrupa las clases de cada curso en modulos. Las clases sin modulo se
        muestran primero.
      </p>

      {modulesRes.error ? (
        <p className="mt-8 text-muted">
          No pudimos cargar los modulos. Revisa que la tabla exista en Supabase.
        </p>
      ) : courses.length === 0 ? (
        <p className="mt-8 text-muted">Primero necesitas cursos.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {courses.map((c) => (
            <details
              key={c.id}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <summary className="cursor-pointer text-base font-bold text-navy">
                {c.title}
              </summary>
              <div className="mt-4">
                <CourseModules
                  courseId={c.id}
                  modules={modules.filter((m) => m.course_id === c.id)}
                  lessons={lessons.filter((l) => l.course_id === c.id)}
                />
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
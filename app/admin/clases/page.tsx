import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LessonEditor from "@/components/admin/LessonEditor";
import { toBogotaInput } from "@/lib/lessons";

type CourseRow = { id: string; title: string };
type TeacherRow = { id: string; name: string };
type LessonRow = {
  id: string;
  course_id: string;
  kind: "grabada" | "en_vivo";
  title: string;
  description: string | null;
  video_url: string | null;
  meeting_url: string | null;
  material_url: string | null;
  starts_at: string | null;
  teacher_id: string | null;
  sort: number;
  is_published: boolean;
};

export default async function AdminClasesPage() {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data: isAdmin } = await sb.rpc("is_admin");
  if (!isAdmin) redirect("/");

  const [coursesRes, teachersRes, lessonsRes] = await Promise.all([
    sb.from("courses").select("id,title").order("title"),
    sb.from("teachers").select("id,name").order("name"),
    sb
      .from("lessons")
      .select(
        "id,course_id,kind,title,description,video_url,meeting_url,material_url,starts_at,teacher_id,sort,is_published",
      )
      .order("sort")
      .order("starts_at"),
  ]);

  const courses = (coursesRes.data ?? []) as unknown as CourseRow[];
  const teachers = (teachersRes.data ?? []) as unknown as TeacherRow[];
  const lessons = (lessonsRes.data ?? []) as unknown as LessonRow[];

  const courseOptions = courses.map((c) => ({ id: c.id, label: c.title }));
  const teacherOptions = teachers.map((t) => ({ id: t.id, label: t.name }));

  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Link href="/admin" className="text-sm font-semibold text-brand">
        Volver al panel
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-navy">Clases</h1>
      <p className="mt-2 text-sm text-muted">
        Las clases solo las ven los estudiantes inscritos en ese curso. Las
        horas se escriben en hora de Colombia.
      </p>

      <h2 className="mt-10 text-2xl font-bold text-navy">Agregar clase</h2>
      {courses.length === 0 ? (
        <p className="mt-4 text-muted">Primero necesitas cursos.</p>
      ) : (
        <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <LessonEditor courses={courseOptions} teachers={teacherOptions} />
        </div>
      )}

      <h2 className="mt-14 text-2xl font-bold text-navy">Clases por curso</h2>
      {lessonsRes.error ? (
        <p className="mt-4 text-muted">No pudimos cargar las clases.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {courses.map((c) => {
            const list = lessons.filter((l) => l.course_id === c.id);
            return (
              <details
                key={c.id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
              >
                <summary className="cursor-pointer text-base font-bold text-navy">
                  {c.title} ({list.length})
                </summary>
                <div className="mt-4 space-y-3">
                  {list.length === 0 && (
                    <p className="text-sm text-muted">Sin clases todavia.</p>
                  )}
                  {list.map((l) => (
                    <details
                      key={l.id}
                      className="rounded-xl border border-black/10 p-4"
                    >
                      <summary className="cursor-pointer text-sm font-semibold text-navy">
                        {l.kind === "en_vivo" ? "En vivo" : "Grabada"} -{" "}
                        {l.title}
                        {!l.is_published && (
                          <span className="ml-2 text-xs text-muted">(oculta)</span>
                        )}
                      </summary>
                      <div className="mt-4">
                        <LessonEditor
                          id={l.id}
                          courses={courseOptions}
                          teachers={teacherOptions}
                          values={{
                            course_id: l.course_id,
                            kind: l.kind,
                            title: l.title,
                            description: l.description ?? "",
                            video_url: l.video_url ?? "",
                            meeting_url: l.meeting_url ?? "",
                            material_url: l.material_url ?? "",
                            starts_at: toBogotaInput(l.starts_at),
                            teacher_id: l.teacher_id ?? "",
                            sort: String(l.sort),
                            is_published: l.is_published,
                          }}
                        />
                      </div>
                    </details>
                  ))}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </section>
  );
}
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import { formatClassDate } from "@/lib/teachers";

type Teacher = {
  id: string;
  name: string;
  specialty: string | null;
  bio: string | null;
  image_url: string | null;
};
type LessonRow = {
  id: string;
  title: string;
  starts_at: string;
  courses: { title: string } | { title: string }[] | null;
};

function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    timeZone: "America/Bogota",
    dateStyle: "full",
  });
}

export default async function TeacherProfile({
  id,
  basePath,
  lessonsPath,
}: {
  id: string;
  basePath: string;
  lessonsPath: string | null;
}) {
  let teacher: Teacher | null = null;
  try {
    const { data } = await getSupabase()
      .from("teachers")
      .select("id,name,specialty,bio,image_url")
      .eq("id", id)
      .eq("is_published", true)
      .maybeSingle();
    teacher = (data ?? null) as Teacher | null;
  } catch {
    teacher = null;
  }
  if (!teacher) notFound();

  let lessons: LessonRow[] = [];
  try {
    const sb = await createClient();
    const { data } = await sb
      .from("lessons")
      .select("id,title,starts_at,courses(title)")
      .eq("teacher_id", teacher.id)
      .eq("kind", "en_vivo")
      .eq("is_published", true)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at");
    lessons = (data ?? []) as unknown as LessonRow[];
  } catch {
    lessons = [];
  }

  const days = new Map<string, LessonRow[]>();
  for (const l of lessons) {
    const k = dayKey(l.starts_at);
    days.set(k, [...(days.get(k) ?? []), l]);
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <Link href={basePath} className="text-sm font-semibold text-brand">
        Volver a profesores
      </Link>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 md:flex">
        {teacher.image_url ? (
          <div
            role="img"
            aria-label={teacher.name}
            className="h-80 w-full bg-cover bg-top md:h-auto md:w-72 md:shrink-0"
            style={{ backgroundImage: `url("${teacher.image_url}")` }}
          />
        ) : (
          <div className="flex h-80 w-full items-center justify-center bg-linear-to-br from-brand to-navy text-7xl font-bold text-white md:h-auto md:w-72 md:shrink-0">
            {teacher.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-navy">{teacher.name}</h1>
          {teacher.specialty && (
            <p className="mt-1 text-base font-semibold text-brand">
              {teacher.specialty}
            </p>
          )}
          {teacher.bio && (
            <p className="mt-4 whitespace-pre-line leading-relaxed text-muted">
              {teacher.bio}
            </p>
          )}
        </div>
      </div>

      <h2 id="calendario" className="mt-12 scroll-mt-24 text-2xl font-bold text-navy">
        Calendario de clases
      </h2>
      <p className="mt-1 text-sm text-muted">
        Clases en vivo próximas con {teacher.name}. Las horas son de Colombia.
      </p>

      {days.size === 0 ? (
        <p className="mt-6 rounded-2xl bg-white p-6 text-sm text-muted shadow-sm ring-1 ring-black/5">
          Sin horarios disponibles por ahora.
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {[...days.entries()].map(([day, items]) => (
            <div key={day}>
              <h3 className="text-sm font-bold capitalize text-navy">{day}</h3>
              <ul className="mt-2 space-y-2">
                {items.map((l) => {
                  const c = Array.isArray(l.courses) ? l.courses[0] : l.courses;
                  return (
                    <li
                      key={l.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
                    >
                      <div>
                        <p className="text-sm font-semibold text-navy">{l.title}</p>
                        <p className="text-xs text-muted">
                          {formatClassDate(l.starts_at)}
                          {c?.title ? ` · ${c.title}` : ""}
                        </p>
                      </div>
                      {lessonsPath && (
                        <Link
                          href={`${lessonsPath}/${l.id}`}
                          className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-navy hover:brightness-95"
                        >
                          Ver clase
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
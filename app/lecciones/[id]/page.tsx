import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { embedUrl, formatBogota, safeHttps } from "@/lib/lessons";
import { orderLessons, percent } from "@/lib/progress";
import CompleteButton from "@/components/dashboard/CompleteButton";
import ProgressBar from "@/components/dashboard/ProgressBar";

type TeacherRef = { name: string };
type LessonFull = {
  id: string;
  course_id: string;
  module_id: string | null;
  kind: "grabada" | "en_vivo";
  title: string;
  description: string | null;
  video_url: string | null;
  meeting_url: string | null;
  material_url: string | null;
  starts_at: string | null;
  sort: number;
  teachers: TeacherRef | TeacherRef[] | null;
};
type Sibling = {
  id: string;
  title: string;
  kind: "grabada" | "en_vivo";
  sort: number;
  module_id: string | null;
};
type ModuleRow = { id: string; title: string; position: number };
type ProgressRow = { lesson_id: string | number; completed: boolean };

const LIVE_WINDOW_MS = 2 * 3600000;

function getNow() {
  return Date.now();
}

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

export default async function LeccionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const userId = auth.user.id;

  const { data: row } = await sb
    .from("lessons")
    .select(
      "id,course_id,module_id,kind,title,description,video_url,meeting_url,material_url,starts_at,sort,teachers(name)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!row) notFound();
  const lesson = row as unknown as LessonFull;

  const [courseRes, siblingsRes, modulesRes, progressRes, enrollRes, adminRes] =
    await Promise.all([
      sb.from("courses").select("id,title").eq("id", lesson.course_id).maybeSingle(),
      sb
        .from("lessons")
        .select("id,title,kind,sort,module_id")
        .eq("course_id", lesson.course_id),
      sb
        .from("course_modules")
        .select("id,title,position")
        .eq("course_id", lesson.course_id)
        .order("position"),
      sb.from("lesson_progress").select("lesson_id,completed").eq("user_id", userId),
      sb
        .from("enrollments")
        .select("id")
        .eq("course_id", lesson.course_id)
        .eq("user_id", userId)
        .eq("status", "activa")
        .maybeSingle(),
      sb.rpc("is_admin"),
    ]);

  const enrolled = Boolean(enrollRes.data);
  if (!enrolled && !adminRes.data) notFound();

  const courseTitle =
    (courseRes.data as { title?: string } | null)?.title ?? "Curso";
  const modules = (modulesRes.data ?? []) as unknown as ModuleRow[];
  const ordered = orderLessons(
    (siblingsRes.data ?? []) as unknown as Sibling[],
    modules,
  );
  const done = new Set(
    ((progressRes.data ?? []) as unknown as ProgressRow[])
      .filter((p) => p.completed)
      .map((p) => String(p.lesson_id)),
  );

  const idx = ordered.findIndex((l) => String(l.id) === String(lesson.id));
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;
  const doneCount = ordered.filter((l) => done.has(String(l.id))).length;
  const isDone = done.has(String(lesson.id));

  const teacher = one(lesson.teachers);
  const embed = embedUrl(lesson.video_url);
  const videoLink = safeHttps(lesson.video_url);
  const meeting = safeHttps(lesson.meeting_url);
  const material = safeHttps(lesson.material_url);
  const liveOpen =
    lesson.kind === "en_vivo" &&
    lesson.starts_at !== null &&
    new Date(lesson.starts_at).getTime() + LIVE_WINDOW_MS >= getNow();

  const groups: { title: string; items: Sibling[] }[] = [];
  const loose = ordered.filter(
    (l) => !l.module_id || !modules.some((m) => m.id === l.module_id),
  );
  if (loose.length > 0) {
    groups.push({ title: modules.length > 0 ? "General" : "Clases", items: loose });
  }
  for (const m of modules) {
    const items = ordered.filter((l) => l.module_id === m.id);
    if (items.length > 0) groups.push({ title: m.title, items });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link
        href={`/dashboard/curso/${lesson.course_id}`}
        className="text-sm font-semibold text-brand"
      >
        Volver al curso: {courseTitle}
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <h1 className="text-3xl font-bold text-navy">{lesson.title}</h1>
          {lesson.kind === "en_vivo" && lesson.starts_at && (
            <p className="mt-2 text-sm font-medium capitalize text-foreground">
              {formatBogota(lesson.starts_at)}{" "}
              <span className="normal-case text-muted">(hora de Colombia)</span>
            </p>
          )}
          {teacher && (
            <p className="mt-1 text-sm text-muted">Profesor: {teacher.name}</p>
          )}
          {lesson.description && (
            <p className="mt-4 leading-relaxed text-foreground">
              {lesson.description}
            </p>
          )}

          {liveOpen && meeting && (
            <a
              href={meeting}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy hover:brightness-95"
            >
              Entrar a la clase
            </a>
          )}

          {embed ? (
            <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                src={embed}
                title={lesson.title}
                loading="lazy"
                allow="accelerometer; encrypted-media; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="h-full w-full"
              />
            </div>
          ) : (
            videoLink && (
              <a
                href={videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-full border border-navy px-5 py-2 text-sm font-semibold text-navy"
              >
                Ver video
              </a>
            )
          )}

          {material && (
            <a
              href={material}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 block text-sm font-semibold text-brand underline"
            >
              Descargar material de apoyo
            </a>
          )}

          <div className="mt-8">
            {enrolled ? (
              <CompleteButton
                lessonId={String(lesson.id)}
                userId={userId}
                completed={isDone}
              />
            ) : (
              <p className="text-sm text-muted">
                Vista previa de administrador: el progreso no se guarda.
              </p>
            )}
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-6">
            {prev ? (
              <Link
                href={`/dashboard/lecciones/${prev.id}`}
                className="rounded-full border border-navy px-5 py-2 text-sm font-semibold text-navy hover:bg-black/5"
              >
                Clase anterior
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/dashboard/lecciones/${next.id}`}
                className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy hover:brightness-95"
              >
                Siguiente clase
              </Link>
            ) : (
              <Link
                href={`/dashboard/curso/${lesson.course_id}`}
                className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy hover:brightness-95"
              >
                Volver al curso
              </Link>
            )}
          </div>
        </div>

        <aside
          aria-label="Contenido del curso"
          className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
        >
          <ProgressBar
            value={percent(doneCount, ordered.length)}
            label={`${doneCount} de ${ordered.length} clases`}
          />
          <div className="mt-5 space-y-5">
            {groups.map((g) => (
              <div key={g.title}>
                <p className="text-xs font-bold uppercase tracking-wide text-muted">
                  {g.title}
                </p>
                <ul className="mt-2 space-y-1">
                  {g.items.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/dashboard/lecciones/${l.id}`}
                        aria-current={String(l.id) === String(lesson.id) ? "page" : undefined}
                        className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ${
                          String(l.id) === String(lesson.id)
                            ? "bg-navy text-white"
                            : "text-navy hover:bg-black/5"
                        }`}
                      >
                        <span>{l.title}</span>
                        {done.has(String(l.id)) && (
                          <span className="text-xs font-semibold">Hecha</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
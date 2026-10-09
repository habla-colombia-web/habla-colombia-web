import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { embedUrl, formatBogota, safeHttps } from "@/lib/lessons";

type TeacherRef = { name: string };
type Lesson = {
  id: string;
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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LIVE_WINDOW_MS = 2 * 3600000;

function getNow() {
  return Date.now();
}

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function startMs(l: Lesson) {
  return l.starts_at ? new Date(l.starts_at).getTime() : 0;
}

function LessonCard({ lesson, finished }: { lesson: Lesson; finished: boolean }) {
  const teacher = one(lesson.teachers);
  const embed = embedUrl(lesson.video_url);
  const videoLink = safeHttps(lesson.video_url);
  const meeting = safeHttps(lesson.meeting_url);
  const material = safeHttps(lesson.material_url);

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-base font-bold text-navy">{lesson.title}</h3>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            lesson.kind === "en_vivo"
              ? finished
                ? "bg-black/5 text-muted"
                : "bg-emerald-100 text-emerald-700"
              : "bg-brand/10 text-brand"
          }`}
        >
          {lesson.kind === "en_vivo"
            ? finished
              ? "Finalizada"
              : "En vivo"
            : "Grabada"}
        </span>
      </div>

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
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {lesson.description}
        </p>
      )}

      {lesson.kind === "en_vivo" && meeting && !finished && (
        <a
          href={meeting}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy hover:brightness-95"
        >
          Entrar a la clase
        </a>
      )}

      {embed ? (
        <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl bg-black">
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
            className="mt-4 inline-block rounded-full border border-navy px-5 py-2 text-sm font-semibold text-navy"
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
          className="mt-3 block text-sm font-semibold text-brand underline"
        >
          Descargar material de apoyo
        </a>
      )}
    </article>
  );
}

export default async function CursoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: course } = await sb
    .from("courses")
    .select("id,title,level")
    .eq("id", id)
    .maybeSingle();
  if (!course) notFound();

  const { data: isAdmin } = await sb.rpc("is_admin");
  const { data: enrollment } = await sb
    .from("enrollments")
    .select("id")
    .eq("course_id", id)
    .eq("user_id", auth.user.id)
    .eq("status", "activa")
    .maybeSingle();

  if (!isAdmin && !enrollment) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-3xl font-bold text-navy">{course.title}</h1>
        <p className="mt-4 text-muted">
          Este contenido es solo para estudiantes inscritos en el curso.
        </p>
        <Link
          href="/#cursos"
          className="mt-8 inline-block rounded-full bg-gold px-6 py-3 font-semibold text-navy hover:brightness-95"
        >
          Ver cursos
        </Link>
      </section>
    );
  }

  const { data, error } = await sb
    .from("lessons")
    .select(
      "id,kind,title,description,video_url,meeting_url,material_url,starts_at,sort,teachers(name)",
    )
    .eq("course_id", id)
    .eq("is_published", true)
    .order("sort");

  const lessons = (data ?? []) as unknown as Lesson[];
  const now = getNow();

  const live = lessons.filter((l) => l.kind === "en_vivo");
  const upcoming = live
    .filter((l) => startMs(l) + LIVE_WINDOW_MS >= now)
    .sort((a, b) => startMs(a) - startMs(b));
  const past = live
    .filter((l) => startMs(l) + LIVE_WINDOW_MS < now)
    .sort((a, b) => startMs(b) - startMs(a));
  const recorded = lessons.filter((l) => l.kind === "grabada");

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/mis-reservas" className="text-sm font-semibold text-brand">
        Volver a mis cursos
      </Link>
      <h1 className="mt-2 text-3xl font-bold text-navy">{course.title}</h1>
      <p className="mt-1 text-sm text-muted">Nivel {course.level}</p>

      {error ? (
        <p className="mt-8 text-muted">
          No pudimos cargar las clases en este momento. Intenta de nuevo en
          unos minutos.
        </p>
      ) : lessons.length === 0 ? (
        <p className="mt-8 text-muted">
          Aún no hay clases publicadas para este curso. Pronto verás aquí los
          horarios y el material.
        </p>
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <h2 className="mt-10 text-2xl font-bold text-navy">
                Próximas clases en vivo
              </h2>
              <div className="mt-4 space-y-4">
                {upcoming.map((l) => (
                  <LessonCard key={l.id} lesson={l} finished={false} />
                ))}
              </div>
            </>
          )}

          {recorded.length > 0 && (
            <>
              <h2 className="mt-10 text-2xl font-bold text-navy">
                Clases grabadas
              </h2>
              <div className="mt-4 space-y-4">
                {recorded.map((l) => (
                  <LessonCard key={l.id} lesson={l} finished={false} />
                ))}
              </div>
            </>
          )}

          {past.length > 0 && (
            <>
              <h2 className="mt-10 text-2xl font-bold text-navy">
                Clases anteriores
              </h2>
              <div className="mt-4 space-y-4">
                {past.map((l) => (
                  <LessonCard key={l.id} lesson={l} finished />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
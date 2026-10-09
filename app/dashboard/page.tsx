import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProgressBar from "@/components/dashboard/ProgressBar";
import { formatBogota } from "@/lib/lessons";
import { orderLessons, percent } from "@/lib/progress";

type CourseRef = { id: string; title: string; level: string };
type EnrollmentRow = {
  id: string;
  course_id: string;
  courses: CourseRef | CourseRef[] | null;
};
type LessonRow = {
  id: string;
  course_id: string;
  module_id: string | null;
  kind: "grabada" | "en_vivo";
  title: string;
  starts_at: string | null;
  sort: number;
};
type ModuleRow = { id: string; course_id: string; position: number };
type ProgressRow = { lesson_id: string | number; completed: boolean };

const LIVE_WINDOW_MS = 2 * 3600000;

function getNow() {
  return Date.now();
}

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function startMs(l: LessonRow) {
  return l.starts_at ? new Date(l.starts_at).getTime() : 0;
}

export default async function DashboardPage() {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");
  const uid = auth.user.id;

  const meta = auth.user.user_metadata?.full_name;
  const name =
    typeof meta === "string" && meta.trim()
      ? meta.trim().split(" ")[0]
      : (auth.user.email ?? "").split("@")[0];

  const enrollRes = await sb
    .from("enrollments")
    .select("id,course_id,courses(id,title,level)")
    .eq("user_id", uid)
    .eq("status", "activa")
    .order("created_at", { ascending: false });
  const enrollments = (enrollRes.data ?? []) as unknown as EnrollmentRow[];
  const courseIds = enrollments.map((e) => e.course_id);

  const { count: bookingsCount } = await sb
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", uid);

  let lessons: LessonRow[] = [];
  let modules: ModuleRow[] = [];
  const doneSet = new Set<string>();
  if (courseIds.length > 0) {
    const [lessonsRes, modulesRes, progressRes] = await Promise.all([
      sb
        .from("lessons")
        .select("id,course_id,module_id,kind,title,starts_at,sort")
        .in("course_id", courseIds),
      sb.from("course_modules").select("id,course_id,position").in("course_id", courseIds),
      sb.from("lesson_progress").select("lesson_id,completed").eq("user_id", uid),
    ]);
    lessons = (lessonsRes.data ?? []) as unknown as LessonRow[];
    modules = (modulesRes.data ?? []) as unknown as ModuleRow[];
    for (const p of (progressRes.data ?? []) as unknown as ProgressRow[]) {
      if (p.completed) doneSet.add(String(p.lesson_id));
    }
  }

  const rows = enrollments.map((e) => {
    const c = one(e.courses);
    const mods = modules.filter((m) => m.course_id === e.course_id);
    const ls = orderLessons(
      lessons.filter((l) => l.course_id === e.course_id),
      mods,
    );
    const done = ls.filter((l) => doneSet.has(String(l.id))).length;
    const next = ls.find((l) => !doneSet.has(String(l.id)));
    return {
      id: e.course_id,
      title: c?.title ?? "Curso",
      level: c?.level ?? "",
      total: ls.length,
      done,
      pct: percent(done, ls.length),
      nextTitle: next?.title ?? null,
      href: next ? `/lecciones/${next.id}` : `/curso/${e.course_id}`,
    };
  });

  const totalLessons = rows.reduce((s, r) => s + r.total, 0);
  const totalDone = rows.reduce((s, r) => s + r.done, 0);
  const completedCourses = rows.filter((r) => r.total > 0 && r.done === r.total).length;
  const nextLesson = rows.find((r) => r.nextTitle);

  const now = getNow();
  const nextLive = lessons
    .filter((l) => l.kind === "en_vivo" && l.starts_at && startMs(l) + LIVE_WINDOW_MS >= now)
    .sort((a, b) => startMs(a) - startMs(b))[0];

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Hola, {name}</h1>
      <p className="mt-1 text-sm text-muted">Este es tu progreso en Habla Colombia.</p>

      {enrollRes.error ? (
        <p className="mt-8 text-muted">
          No pudimos cargar tus cursos en este momento. Intenta de nuevo en unos
          minutos.
        </p>
      ) : (
        <>
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <ProgressBar
              value={percent(totalDone, totalLessons)}
              label="Mi progreso general"
            />
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <dt className="text-xs font-semibold uppercase text-muted">Cursos inscritos</dt>
              <dd className="mt-1 text-2xl font-bold text-navy">{rows.length}</dd>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <dt className="text-xs font-semibold uppercase text-muted">Cursos completados</dt>
              <dd className="mt-1 text-2xl font-bold text-navy">{completedCourses}</dd>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <dt className="text-xs font-semibold uppercase text-muted">Clases completadas</dt>
              <dd className="mt-1 text-2xl font-bold text-navy">
                {totalDone} de {totalLessons}
              </dd>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <dt className="text-xs font-semibold uppercase text-muted">Reservas</dt>
              <dd className="mt-1 text-2xl font-bold text-navy">{bookingsCount ?? 0}</dd>
            </div>
          </dl>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-navy p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
                Próxima lección
              </p>
              {nextLesson ? (
                <>
                  <p className="mt-2 text-lg font-bold">{nextLesson.nextTitle}</p>
                  <p className="text-sm text-white/70">{nextLesson.title}</p>
                  <Link
                    href={nextLesson.href}
                    className="mt-4 inline-block rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy hover:brightness-95"
                  >
                    Continuar aprendiendo
                  </Link>
                </>
              ) : (
                <p className="mt-2 text-sm text-white/80">
                  No tienes lecciones pendientes por ahora.
                </p>
              )}
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Próxima clase en vivo
              </p>
              {nextLive && nextLive.starts_at ? (
                <>
                  <p className="mt-2 text-lg font-bold text-navy">{nextLive.title}</p>
                  <p className="mt-1 text-sm capitalize text-foreground">
                    {formatBogota(nextLive.starts_at)}{" "}
                    <span className="normal-case text-muted">(hora de Colombia)</span>
                  </p>
                  <Link
                    href={`/lecciones/${nextLive.id}`}
                    className="mt-4 inline-block rounded-full border border-navy px-5 py-2 text-sm font-semibold text-navy hover:bg-black/5"
                  >
                    Ver clase
                  </Link>
                </>
              ) : (
                <p className="mt-2 text-sm text-muted">No hay clases en vivo programadas.</p>
              )}
            </div>
          </div>

          <h2 className="mt-12 text-2xl font-bold text-navy">Mis cursos</h2>
          {rows.length === 0 ? (
            <div className="mt-4">
              <p className="text-muted">Aún no te has inscrito a ningún curso.</p>
              <Link
                href="/cursos"
                className="mt-4 inline-block rounded-full bg-gold px-6 py-3 font-semibold text-navy hover:brightness-95"
              >
                Ver cursos
              </Link>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-navy">{r.title}</h3>
                      {r.level && <p className="text-sm text-muted">Nivel {r.level}</p>}
                    </div>
                    <Link
                      href={r.href}
                      className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-navy hover:brightness-95"
                    >
                      {r.done === 0 ? "Comenzar" : r.nextTitle ? "Continuar" : "Repasar"}
                    </Link>
                  </div>
                  <div className="mt-3">
                    <ProgressBar value={r.pct} label={`${r.done} de ${r.total} clases`} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
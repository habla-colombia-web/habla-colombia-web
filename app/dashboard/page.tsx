import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock,
  GraduationCap,
  MessageCircle,
  Video,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatBogota } from "@/lib/lessons";
import { bgImage, orderLessons, percent } from "@/lib/progress";

type CourseRef = {
  id: string;
  title: string;
  level: string;
  short_description: string | null;
  image_url: string | null;
};
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
  description: string | null;
  starts_at: string | null;
  teacher_id: string | null;
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

function dayParts(iso: string) {
  const d = new Date(iso);
  const tz = "America/Bogota";
  return {
    day: d.toLocaleDateString("es-CO", { day: "numeric", timeZone: tz }),
    month: d.toLocaleDateString("es-CO", { month: "short", timeZone: tz }),
    time: d.toLocaleTimeString("es-CO", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: tz,
    }),
  };
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
    .select("id,course_id,courses(id,title,level,short_description,image_url)")
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
        .select("id,course_id,module_id,kind,title,description,starts_at,teacher_id,sort")
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
    const complete = ls.length > 0 && done === ls.length;
    return {
      id: e.course_id,
      title: c?.title ?? "Curso",
      level: c?.level ?? "",
      description: c?.short_description ?? "",
      image: bgImage(c?.image_url),
      total: ls.length,
      done,
      complete,
      pct: percent(done, ls.length),
      nextId: next?.id ?? null,
      nextTitle: next?.title ?? null,
      nextDescription: next?.description ?? "",
      href: next ? `/lecciones/${next.id}` : `/curso/${e.course_id}`,
    };
  });

  const totalLessons = rows.reduce((s, r) => s + r.total, 0);
  const totalDone = rows.reduce((s, r) => s + r.done, 0);
  const completedCourses = rows.filter((r) => r.complete).length;
  const overall = percent(totalDone, totalLessons);
  const resume = rows.find((r) => r.nextId && r.done > 0) ?? rows.find((r) => r.nextId);

  const now = getNow();
  const nextLive = lessons
    .filter((l) => l.kind === "en_vivo" && l.starts_at && startMs(l) + LIVE_WINDOW_MS >= now)
    .sort((a, b) => startMs(a) - startMs(b))[0];

  let teacherName: string | null = null;
  if (nextLive?.teacher_id) {
    const { data: t } = await sb
      .from("teachers")
      .select("name")
      .eq("id", nextLive.teacher_id)
      .maybeSingle();
    teacherName = (t as { name?: string } | null)?.name ?? null;
  }
  const live = nextLive && nextLive.starts_at ? dayParts(nextLive.starts_at) : null;

  const quick = [
    { href: "/profesores", label: "Agendar clase", sub: "Reserva con un profesor", icon: CalendarDays, tone: "bg-blue-100 text-blue-600" },
    { href: "/cursos", label: "Ver cursos", sub: "Explora el catalogo", icon: BookOpen, tone: "bg-emerald-100 text-emerald-600" },
    { href: "/mis-reservas", label: "Mis reservas", sub: "Revisa tus reservas", icon: GraduationCap, tone: "bg-amber-100 text-amber-600" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {enrollRes.error ? (
        <p className="text-muted">
          No pudimos cargar tus cursos en este momento. Intenta de nuevo en unos minutos.
        </p>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-6">
            <section className="rounded-3xl bg-gradient-to-r from-navy to-brand p-8 text-white shadow-sm">
              <h1 className="text-3xl font-bold sm:text-4xl">Hola, {name}!</h1>
              <p className="mt-2 text-xl font-semibold">
                Tu español te lleva <span className="text-gold">más lejos</span>
              </p>
              <p className="mt-3 max-w-md text-sm text-white/80">
                Hoy es un gran día para seguir aprendiendo. Cada conversación te
                acerca a tus metas.
              </p>
              {resume ? (
                <Link
                  href={resume.href}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy hover:brightness-95"
                >
                  Continuar mi clase <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ) : (
                <Link
                  href="/cursos"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-navy hover:brightness-95"
                >
                  Ver cursos <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
            </section>

            <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:grid-cols-2 lg:grid-cols-4">
              {quick.map(({ href, label, sub, icon: Icon, tone }) => (
                <Link key={href} href={href} className="flex items-center gap-3 rounded-xl p-2 hover:bg-black/[0.03]">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-navy">{label}</span>
                    <span className="block truncate text-xs text-muted">{sub}</span>
                  </span>
                </Link>
              ))}
              <div aria-disabled="true" className="flex items-center gap-3 rounded-xl p-2 opacity-60">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <MessageCircle size={22} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-navy">Practicar con IA</span>
                  <span className="block truncate text-xs text-muted">Próximamente</span>
                </span>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-navy">Mis cursos</h2>
                <Link href="/cursos" className="text-sm font-medium text-brand hover:underline">
                  Ver todos
                </Link>
              </div>
              {rows.length === 0 ? (
                <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                  <p className="text-muted">Aún no te has inscrito a ningún curso.</p>
                  <Link
                    href="/cursos"
                    className="mt-4 inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:brightness-110"
                  >
                    Ver cursos
                  </Link>
                </div>
              ) : (
                <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {rows.map((r) => (
                    <li key={r.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                      <div
                        className="relative h-32 bg-gradient-to-br from-navy to-brand bg-cover bg-center"
                        style={r.image ? { backgroundImage: r.image } : undefined}
                      >
                        <span
                          className={`absolute bottom-2 left-2 rounded-md px-2 py-0.5 text-xs font-semibold text-white ${
                            r.complete ? "bg-navy" : r.done > 0 ? "bg-emerald-600" : "bg-violet-600"
                          }`}
                        >
                          {r.complete ? "Completado" : r.done > 0 ? "En curso" : "Por comenzar"}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="text-base font-bold text-navy">{r.title}</h3>
                        {r.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-muted">{r.description}</p>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                          <div
                            role="progressbar"
                            aria-valuenow={r.pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Progreso de ${r.title}`}
                            className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/10"
                          >
                            <div
                              className={`h-full rounded-full ${r.complete ? "bg-emerald-500" : "bg-brand"}`}
                              style={{ width: `${r.pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-navy">{r.pct}%</span>
                        </div>
                        <p className="mt-1 text-xs text-muted">
                          {r.done} de {r.total} clases
                        </p>
                        <Link
                          href={r.href}
                          className="mt-3 inline-flex items-center gap-1 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white hover:brightness-110"
                        >
                          {r.complete ? "Repasar" : r.done === 0 ? "Comenzar" : "Continuar"}
                          <ArrowRight size={14} aria-hidden="true" />
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="flex items-center gap-2 text-base font-bold text-navy">
                <BookOpen size={18} aria-hidden="true" /> Continúa donde quedaste
              </h2>
              {resume ? (
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div
                    className="h-24 w-32 shrink-0 rounded-xl bg-gradient-to-br from-navy to-brand bg-cover bg-center"
                    style={resume.image ? { backgroundImage: resume.image } : undefined}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted">{resume.title}</p>
                    <p className="text-lg font-bold text-navy">{resume.nextTitle}</p>
                    {resume.nextDescription && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{resume.nextDescription}</p>
                    )}
                    <Link
                      href={resume.href}
                      className="mt-3 inline-flex items-center gap-1 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
                    >
                      Continuar <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted">No tienes lecciones pendientes por ahora.</p>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="text-lg font-bold text-navy">Tu progreso general</h2>
              <div className="mt-4 flex items-center gap-4">
                <div className="relative h-32 w-32 shrink-0">
                  <svg
                    viewBox="0 0 36 36"
                    className="h-full w-full -rotate-90"
                    role="img"
                    aria-label={`Progreso general ${overall}%`}
                  >
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e3ebf8" strokeWidth="4" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9155"
                      fill="none"
                      stroke="#2f5bea"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${overall} ${100 - overall}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-navy">{overall}%</span>
                    <span className="text-[10px] text-muted">Completado</span>
                  </div>
                </div>
                <dl className="min-w-0 flex-1 space-y-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">Clases completadas</dt>
                    <dd className="font-semibold text-navy">{totalDone} / {totalLessons}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">Cursos completados</dt>
                    <dd className="font-semibold text-navy">{completedCourses} / {rows.length}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted">Reservas</dt>
                    <dd className="font-semibold text-navy">{bookingsCount ?? 0}</dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <h2 className="flex items-center gap-2 text-lg font-bold text-navy">
                <CalendarDays size={18} aria-hidden="true" /> Tu próxima clase
              </h2>
              {nextLive && live ? (
                <div className="mt-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 shrink-0 rounded-xl bg-[#eef4fc] py-2 text-center">
                      <p className="text-2xl font-bold leading-none text-navy">{live.day}</p>
                      <p className="text-xs capitalize text-muted">{live.month}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-navy">{nextLive.title}</p>
                      {teacherName && <p className="text-sm text-muted">Con {teacherName}</p>}
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                        <Clock size={14} aria-hidden="true" /> {live.time} (hora de Colombia)
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs capitalize text-muted">{formatBogota(nextLive.starts_at as string)}</p>
                  <Link
                    href={`/lecciones/${nextLive.id}`}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:brightness-110"
                  >
                    <Video size={16} aria-hidden="true" /> Unirse
                  </Link>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted">No hay clases en vivo programadas.</p>
              )}
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
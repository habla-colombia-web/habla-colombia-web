"use client";

import { useMemo, useState } from "react";
import { BookOpen, CheckCircle2, PauseCircle, Search, Users } from "lucide-react";
import {
  LEVELS,
  LEVEL_COLOR,
  STATUS_LABEL,
  avatarColor,
  initial,
  timeAgo,
  type LevelGroup,
  type StatusKey,
  type Student,
} from "@/lib/students";

const PAGE_SIZE = 8;

const STATUS_STYLE: Record<StatusKey, string> = {
  curso: "bg-emerald-100 text-emerald-700",
  pausa: "bg-amber-100 text-amber-700",
  completado: "bg-blue-100 text-blue-700",
};

function Avatar({ name, seed, size = 40 }: { name: string; seed: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{
        width: size,
        height: size,
        backgroundColor: avatarColor(seed),
        fontSize: size * 0.42,
      }}
    >
      {initial(name)}
    </span>
  );
}

function Kpi({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}>
        {icon}
      </span>
      <div>
        <p className="text-sm font-medium text-navy">{label}</p>
        <p className="text-3xl font-bold text-navy">{value}</p>
      </div>
    </div>
  );
}

export default function StudentsDashboard({
  students,
  initialQuery = "",
}: {
  students: Student[];
  initialQuery?: string;
}) {
  const [now] = useState(() => Date.now());
  const [q, setQ] = useState(initialQuery);
  const [level, setLevel] = useState<LevelGroup | "todos">("todos");
  const [status, setStatus] = useState<StatusKey | "todos">("todos");
  const [page, setPage] = useState(0);

  const totalStudents = useMemo(
    () => new Set(students.map((s) => s.userId)).size,
    [students],
  );
  const count = (k: StatusKey) => students.filter((s) => s.status === k).length;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return students.filter((s) => {
      if (level !== "todos" && s.level !== level) return false;
      if (status !== "todos" && s.status !== status) return false;
      if (!term) return true;
      return (
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.courseTitle.toLowerCase().includes(term)
      );
    });
  }, [students, q, level, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const slice = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const byLevel = LEVELS.map((l) => ({
    level: l,
    n: students.filter((s) => s.level === l).length,
  })).filter((x) => x.n > 0);
  const levelTotal = students.length;

  const activity = useMemo(() => {
    const ev: { at: string; text: string; color: string }[] = [];
    for (const s of students) {
      ev.push({
        at: s.enrolledAt,
        text: `${s.name} se inscribió en ${s.courseTitle}`,
        color: "#1d6fe0",
      });
      if (s.lastAt) {
        ev.push({
          at: s.lastAt,
          text: s.lastLesson
            ? `${s.name} avanzó en la clase "${s.lastLesson}"`
            : `${s.name} avanzó en sus clases`,
          color: "#0f9d73",
        });
      }
    }
    return ev
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 5);
  }, [students]);

  const top = useMemo(
    () =>
      students
        .filter((s) => s.percent > 0)
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 5),
    [students],
  );

  let offset = 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Total de estudiantes"
          value={totalStudents}
          tone="bg-blue-100 text-blue-600"
          icon={<Users size={22} aria-hidden="true" />}
        />
        <Kpi
          label="En curso"
          value={count("curso")}
          tone="bg-emerald-100 text-emerald-600"
          icon={<BookOpen size={22} aria-hidden="true" />}
        />
        <Kpi
          label="En pausa"
          value={count("pausa")}
          tone="bg-violet-100 text-violet-600"
          icon={<PauseCircle size={22} aria-hidden="true" />}
        />
        <Kpi
          label="Completados"
          value={count("completado")}
          tone="bg-amber-100 text-amber-600"
          icon={<CheckCircle2 size={22} aria-hidden="true" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-navy">Lista de estudiantes</h2>
            <div className="flex flex-wrap items-center gap-2">
              <label className="relative">
                <span className="sr-only">Buscar estudiante</span>
                <Search
                  size={16}
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="search"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Buscar estudiante..."
                  className="w-52 rounded-lg border border-black/15 bg-white py-2 pl-9 pr-3 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
                />
              </label>
              <select
                aria-label="Filtrar por nivel"
                value={level}
                onChange={(e) => {
                  setLevel(e.target.value as LevelGroup | "todos");
                  setPage(0);
                }}
                className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-navy"
              >
                <option value="todos">Todos los niveles</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filtrar por estado"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as StatusKey | "todos");
                  setPage(0);
                }}
                className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm text-navy"
              >
                <option value="todos">Todos los estados</option>
                <option value="curso">En curso</option>
                <option value="pausa">En pausa</option>
                <option value="completado">Completado</option>
              </select>
            </div>
          </div>

          {students.length === 0 ? (
            <p className="mt-6 text-muted">Aun no hay estudiantes inscritos.</p>
          ) : filtered.length === 0 ? (
            <p className="mt-6 text-muted">Ningun estudiante coincide con la busqueda.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="bg-black/[0.03] text-xs font-semibold text-muted">
                    <th className="px-3 py-2">Estudiante</th>
                    <th className="px-3 py-2">Nivel</th>
                    <th className="px-3 py-2">Progreso</th>
                    <th className="px-3 py-2">Última clase</th>
                    <th className="px-3 py-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {slice.map((s) => (
                    <tr key={s.key} className="border-t border-black/5">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={s.name} seed={s.email} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-navy">{s.name}</p>
                            <p className="truncate text-xs text-muted">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className="rounded-md px-2 py-1 text-xs font-semibold text-white"
                          style={{ backgroundColor: LEVEL_COLOR[s.level] }}
                        >
                          {s.level}
                        </span>
                        <p className="mt-1 text-xs text-muted">{s.courseTitle}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-xs font-semibold text-navy">{s.percent}%</p>
                        <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-black/10">
                          <div
                            className="h-full rounded-full bg-brand"
                            style={{ width: `${s.percent}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-muted">
                        {timeAgo(s.lastAt, now)}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[s.status]}`}
                        >
                          {STATUS_LABEL[s.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted">
                Mostrando {current * PAGE_SIZE + 1} -{" "}
                {current * PAGE_SIZE + slice.length} de {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={current === 0}
                  onClick={() => setPage(current - 1)}
                  className="rounded-lg border border-black/15 px-3 py-1.5 text-sm text-navy disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="text-sm text-navy">
                  {current + 1} / {pages}
                </span>
                <button
                  type="button"
                  disabled={current >= pages - 1}
                  onClick={() => setPage(current + 1)}
                  className="rounded-lg border border-black/15 px-3 py-1.5 text-sm text-navy disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="text-lg font-bold text-navy">Distribución por nivel</h2>
            {levelTotal === 0 ? (
              <p className="mt-4 text-sm text-muted">Sin datos todavia.</p>
            ) : (
              <div className="mt-4 flex items-center gap-4">
                <div className="relative h-32 w-32 shrink-0">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90" role="img" aria-label="Distribución por nivel">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#eef0f3" strokeWidth="5" />
                    {byLevel.map((x) => {
                      const pct = (x.n / levelTotal) * 100;
                      const el = (
                        <circle
                          key={x.level}
                          cx="18"
                          cy="18"
                          r="15.9155"
                          fill="none"
                          stroke={LEVEL_COLOR[x.level]}
                          strokeWidth="5"
                          strokeDasharray={`${pct} ${100 - pct}`}
                          strokeDashoffset={-offset}
                        />
                      );
                      offset += pct;
                      return el;
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-navy">{levelTotal}</span>
                    <span className="text-[10px] text-muted">inscripciones</span>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  {byLevel.map((x) => (
                    <li key={x.level} className="flex items-center gap-2 text-navy">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: LEVEL_COLOR[x.level] }}
                      />
                      {x.level}: {x.n} ({Math.round((x.n / levelTotal) * 100)}%)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="text-lg font-bold text-navy">Actividad reciente</h2>
            {activity.length === 0 ? (
              <p className="mt-4 text-sm text-muted">Sin actividad todavia.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {activity.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-navy">
                    <span
                      className="mt-1 h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: a.color }}
                    />
                    <span className="flex-1">{a.text}</span>
                    <span className="shrink-0 text-muted">{timeAgo(a.at, now)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <h2 className="text-lg font-bold text-navy">Top 5 por progreso</h2>
            {top.length === 0 ? (
              <p className="mt-4 text-sm text-muted">
                Aun no hay progreso registrado.
              </p>
            ) : (
              <ol className="mt-4 space-y-3">
                {top.map((s, i) => (
                  <li key={s.key} className="flex items-center gap-3 text-xs text-navy">
                    <span className="w-4 text-muted">{i + 1}.</span>
                    <Avatar name={s.name} seed={s.email} size={28} />
                    <span className="min-w-0 flex-1 truncate font-medium">{s.name}</span>
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/10">
                      <div
                        className="h-full rounded-full bg-brand"
                        style={{ width: `${s.percent}%` }}
                      />
                    </div>
                    <span className="w-9 text-right text-muted">{s.percent}%</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
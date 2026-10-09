"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { TEACHER_AREAS, matchesArea, norm } from "@/lib/teachers";

export type TeacherCard = {
  id: string;
  name: string;
  specialty: string | null;
  bio: string | null;
  image_url: string | null;
  nextClass: string | null;
};

export default function TeacherDirectory({
  teachers,
  basePath,
}: {
  teachers: TeacherCard[];
  basePath: string;
}) {
  const [q, setQ] = useState("");
  const [area, setArea] = useState("");

  const list = useMemo(() => {
    const nq = norm(q.trim());
    return teachers.filter((t) => {
      if (!matchesArea(t.specialty, area)) return false;
      if (!nq) return true;
      return norm(`${t.name} ${t.specialty ?? ""} ${t.bio ?? ""}`).includes(nq);
    });
  }, [teachers, q, area]);

  const chip = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition ${
      active ? "bg-navy text-white" : "bg-[#eaeefb] text-navy hover:bg-[#dde4f8]"
    }`;

  return (
    <div>
      <div className="mt-8 space-y-4">
        <label className="relative block max-w-md">
          <span className="sr-only">Buscar profesor</span>
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o especialidad"
            className="w-full rounded-full border border-black/15 bg-white py-2.5 pl-10 pr-4 text-sm text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por área">
          <button type="button" className={chip(area === "")} onClick={() => setArea("")}>
            Todos
          </button>
          {TEACHER_AREAS.map((a) => (
            <button
              key={a.key}
              type="button"
              aria-pressed={area === a.key}
              className={chip(area === a.key)}
              onClick={() => setArea(a.key)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="mt-10 text-muted">
          No encontramos profesores con ese filtro. Prueba con otra área o borra la búsqueda.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(16rem,20rem))] justify-center gap-6 sm:justify-start">
          {list.map((t) => (
            <article
              key={t.id}
              className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
            >
              {t.image_url ? (
                <div
                  role="img"
                  aria-label={t.name}
                  className="h-64 w-full bg-cover bg-top"
                  style={{ backgroundImage: `url("${t.image_url}")` }}
                />
              ) : (
                <div className="flex h-64 w-full items-center justify-center bg-linear-to-br from-brand to-navy text-6xl font-bold text-white">
                  {t.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-lg font-bold text-navy">{t.name}</h2>
                {t.specialty && (
                  <p className="text-sm font-semibold text-brand">{t.specialty}</p>
                )}
                {t.bio && (
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
                    {t.bio}
                  </p>
                )}
                <p className="mt-3 text-xs font-medium text-navy">
                  {t.nextClass ? (
                    <>
                      <span className="text-emerald-700">Próxima clase en vivo:</span>{" "}
                      {t.nextClass}
                    </>
                  ) : (
                    <span className="text-muted">Sin horarios publicados</span>
                  )}
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Link
                    href={`${basePath}/${t.id}`}
                    className="flex-1 rounded-full border border-navy px-4 py-2 text-center text-sm font-semibold text-navy hover:bg-black/5"
                  >
                    Ver perfil
                  </Link>
                  <Link
                    href={`${basePath}/${t.id}#calendario`}
                    className="flex-1 rounded-full bg-gold px-4 py-2 text-center text-sm font-semibold text-navy hover:brightness-95"
                  >
                    Reservar clase
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
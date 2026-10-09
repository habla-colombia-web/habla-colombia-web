import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { bgImage, formatPrice } from "@/lib/progress";

export const metadata: Metadata = {
  title: "Cursos - Habla Colombia",
  description:
    "Cursos de español colombiano para viajeros, para vivir en Colombia, para trabajar y para la vida social.",
};

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  image_url: string | null;
  level: string;
  price: number;
};

const GROUPS: Record<string, string[]> = {
  principiante: ["A1", "A2"],
  intermedio: ["B1", "B2"],
  avanzado: ["C1", "C2"],
};

const FILTERS = [
  { key: "", label: "Todos" },
  { key: "principiante", label: "Principiante" },
  { key: "intermedio", label: "Intermedio" },
  { key: "avanzado", label: "Avanzado" },
];

export default async function CursosPage({
  searchParams,
}: {
  searchParams: Promise<{ nivel?: string }>;
}) {
  const { nivel } = await searchParams;
  const active =
    nivel && Object.prototype.hasOwnProperty.call(GROUPS, nivel) ? nivel : "";

  const sb = await createClient();
  let query = sb
    .from("courses")
    .select("id,title,slug,short_description,image_url,level,price")
    .eq("is_published", true)
    .order("level")
    .order("title");
  if (active) query = query.in("level", GROUPS[active]);
  const { data, error } = await query;
  const courses = (data ?? []) as unknown as CourseRow[];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-widest text-brand">
        Nuestros cursos
      </p>
      <h1 className="mt-2 text-3xl font-bold text-navy">
        Elige el camino que se ajusta a tus objetivos
      </h1>

      <nav aria-label="Filtrar por nivel" className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.key ? `/cursos?nivel=${f.key}` : "/cursos"}
            aria-current={f.key === active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              f.key === active
                ? "bg-navy text-white"
                : "bg-[#eaeefb] text-navy hover:bg-[#dde4f8]"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      {error ? (
        <p className="mt-8 text-muted">
          No pudimos cargar los cursos en este momento. Intenta de nuevo en unos
          minutos.
        </p>
      ) : courses.length === 0 ? (
        <p className="mt-8 text-muted">No hay cursos en este nivel por ahora.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link
              key={c.id}
              href={`/cursos/${c.slug}`}
              className="block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
            >
              <div
                className="h-36 bg-linear-to-br from-brand to-navy bg-cover bg-center"
                style={{ backgroundImage: bgImage(c.image_url) }}
              />
              <div className="p-5">
                <h2 className="text-base font-bold text-navy">{c.title}</h2>
                {c.short_description && (
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {c.short_description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between text-xs font-semibold">
                  <span className="rounded-full bg-brand/10 px-2 py-1 text-brand">
                    Nivel {c.level}
                  </span>
                  <span className="text-navy">{formatPrice(c.price)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
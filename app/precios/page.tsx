import Link from "next/link";
import { getSupabase } from "@/lib/supabase/public";
import { formatPrice } from "@/lib/progress";
import type { Course } from "@/types";

export default async function PreciosPage() {
  const { data, error } = await getSupabase()
    .from("courses")
    .select("id,title,slug,short_description,image_url,level,price")
    .eq("is_published", true)
    .order("price")
    .order("title");

  const courses = (data ?? []) as Course[];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-widest text-brand">
        Precios
      </p>
      <h1 className="mt-2 text-3xl font-bold text-navy sm:text-4xl">
        Elige el plan que se ajusta a ti
      </h1>
      <p className="mt-3 text-sm text-muted">
        Todos los precios están expresados en dólares estadounidenses (USD).
      </p>

      {error ? (
        <p className="mt-8 text-muted">
          No pudimos cargar los precios en este momento. Intenta de nuevo en
          unos minutos.
        </p>
      ) : courses.length === 0 ? (
        <p className="mt-8 text-muted">Pronto publicaremos los precios.</p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            const isFree = Number(c.price) === 0;
            return (
              <div
                key={c.id}
                className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition hover:shadow-md"
              >
                <span className="w-fit rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  Nivel {c.level}
                </span>
                <h2 className="mt-4 text-lg font-bold text-navy">{c.title}</h2>
                {c.short_description && (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    {c.short_description}
                  </p>
                )}
                <div className="mt-6 border-t border-black/5 pt-5">
                  <p className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-navy">
                      {formatPrice(c.price)}
                    </span>
                    {isFree && (
                      <span className="text-sm font-semibold text-emerald-700">
                        Gratis
                      </span>
                    )}
                  </p>
                </div>
                <Link
                  href="/#cursos"
                  className="mt-4 rounded-full bg-gold px-4 py-2.5 text-center text-sm font-semibold text-navy hover:brightness-95"
                >
                  Inscribirme
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
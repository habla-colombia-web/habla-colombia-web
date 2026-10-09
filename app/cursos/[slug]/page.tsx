import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StartCourse from "@/components/courses/StartCourse";
import { bgImage, formatPrice } from "@/lib/progress";

type CourseRow = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  image_url: string | null;
  level: string;
  price: number;
};
type ModuleRow = {
  id: string;
  title: string;
  description: string | null;
  position: number;
};

export default async function CursoDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const sb = await createClient();

  const { data: row } = await sb
    .from("courses")
    .select(
      "id,title,slug,short_description,description,image_url,level,price",
    )
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();
  if (!row) notFound();
  const course = row as unknown as CourseRow;

  const { data: auth } = await sb.auth.getUser();
  const [modulesRes, countRes] = await Promise.all([
    sb
      .from("course_modules")
      .select("id,title,description,position")
      .eq("course_id", course.id)
      .order("position"),
    sb.rpc("course_lesson_count", { p_course: course.id }),
  ]);
  const modules = (modulesRes.data ?? []) as unknown as ModuleRow[];
  const lessonCount = typeof countRes.data === "number" ? countRes.data : null;

  let enrolled = false;
  if (auth.user) {
    const { data } = await sb
      .from("enrollments")
      .select("id")
      .eq("course_id", course.id)
      .eq("user_id", auth.user.id)
      .eq("status", "activa")
      .maybeSingle();
    enrolled = Boolean(data);
  }

  const isFree = Number(course.price) === 0;
  const text = course.description ?? course.short_description;

  return (
    <article>
      <div
        className="h-56 bg-linear-to-br from-brand to-navy bg-cover bg-center sm:h-72"
        style={{ backgroundImage: bgImage(course.image_url) }}
        role="img"
        aria-label={course.title}
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Link href="/cursos" className="text-sm font-semibold text-brand">
          Volver a los cursos
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-navy">{course.title}</h1>
        {text && <p className="mt-4 leading-relaxed text-foreground">{text}</p>}

        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <dt className="text-xs font-semibold uppercase text-muted">Nivel</dt>
            <dd className="mt-1 text-lg font-bold text-navy">{course.level}</dd>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <dt className="text-xs font-semibold uppercase text-muted">Modulos</dt>
            <dd className="mt-1 text-lg font-bold text-navy">{modules.length}</dd>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <dt className="text-xs font-semibold uppercase text-muted">Clases</dt>
            <dd className="mt-1 text-lg font-bold text-navy">
              {lessonCount ?? "-"}
            </dd>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <dt className="text-xs font-semibold uppercase text-muted">Precio</dt>
            <dd className="mt-1 text-lg font-bold text-navy">
              {formatPrice(course.price)}
            </dd>
          </div>
        </dl>

        <div className="mt-8">
          {enrolled ? (
            <Link
              href={`/curso/${course.id}`}
              className="inline-block rounded-full bg-gold px-6 py-3 font-semibold text-navy hover:brightness-95"
            >
              Continuar curso
            </Link>
          ) : !auth.user ? (
            <Link
              href="/login"
              className="inline-block rounded-full bg-gold px-6 py-3 font-semibold text-navy hover:brightness-95"
            >
              Iniciar sesión para comenzar
            </Link>
          ) : isFree ? (
            <StartCourse courseId={course.id} />
          ) : (
            <div>
              <button
                type="button"
                disabled
                className="rounded-full bg-gold px-6 py-3 font-semibold text-navy opacity-60"
              >
                Comprar curso
              </button>
              <p className="mt-2 text-sm text-muted">
                Los pagos estarán disponibles próximamente.
              </p>
            </div>
          )}
        </div>

        {modules.length > 0 && (
          <>
            <h2 className="mt-12 text-2xl font-bold text-navy">Contenido</h2>
            <ol className="mt-4 space-y-3">
              {modules.map((m, i) => (
                <li
                  key={m.id}
                  className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
                >
                  <p className="text-sm font-bold text-navy">
                    {i + 1}. {m.title}
                  </p>
                  {m.description && (
                    <p className="mt-1 text-sm text-muted">{m.description}</p>
                  )}
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </article>
  );
}
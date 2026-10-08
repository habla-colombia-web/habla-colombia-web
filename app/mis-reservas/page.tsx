import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CancelBookingButton from "@/components/bookings/CancelBookingButton";

type BookingRow = {
  id: number | string;
  place_name: string;
  tour_date: string;
  people: string;
  notes: string | null;
  status: string;
};
type CourseRef = { title: string; level: string };
type EnrollmentRow = {
  id: string;
  status: string;
  courses: CourseRef | CourseRef[] | null;
};

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function formatDate(d: string) {
  return new Date(`${d}T00:00:00`).toLocaleDateString("es-CO", {
    dateStyle: "long",
  });
}

export default async function MisReservasPage() {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");

  const [bookingsRes, enrollRes] = await Promise.all([
    sb
      .from("bookings")
      .select("id,place_name,tour_date,people,notes,status")
      .order("tour_date", { ascending: true }),
    sb
      .from("enrollments")
      .select("id,status,courses(title,level)")
      .order("created_at", { ascending: false }),
  ]);

  const bookings = (bookingsRes.data ?? []) as unknown as BookingRow[];
  const enrollments = (enrollRes.data ?? []) as unknown as EnrollmentRow[];

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Mis reservas</h1>

      {bookingsRes.error ? (
        <p className="mt-8 text-muted">
          No pudimos cargar tus reservas en este momento. Intenta de nuevo en
          unos minutos.
        </p>
      ) : bookings.length === 0 ? (
        <div className="mt-8">
          <p className="text-muted">Aún no tienes reservas.</p>
          <Link
            href="/#turismo"
            className="mt-4 inline-block rounded-full bg-gold px-6 py-3 font-semibold text-navy hover:brightness-95"
          >
            Ver lugares
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="text-base font-bold text-navy">
                  {b.place_name}
                </h2>
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold capitalize text-brand">
                  {b.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-foreground">
                {formatDate(b.tour_date)} · Personas: {b.people}
              </p>
              {b.notes && <p className="mt-2 text-sm text-muted">{b.notes}</p>}
              {b.status === "pendiente" && <CancelBookingButton id={b.id} />}
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-14 text-2xl font-bold text-navy">Mis cursos</h2>
      {enrollRes.error ? (
        <p className="mt-6 text-muted">
          No pudimos cargar tus cursos en este momento.
        </p>
      ) : enrollments.length === 0 ? (
        <div className="mt-6">
          <p className="text-muted">Aún no te has inscrito a ningún curso.</p>
          <Link
            href="/#cursos"
            className="mt-4 inline-block rounded-full bg-gold px-6 py-3 font-semibold text-navy hover:brightness-95"
          >
            Ver cursos
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {enrollments.map((e) => {
            const c = one(e.courses);
            return (
              <li
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
              >
                <div>
                  <h3 className="text-base font-bold text-navy">
                    {c?.title ?? "Curso"}
                  </h3>
                  {c && <p className="text-sm text-muted">Nivel {c.level}</p>}
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                  {e.status}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
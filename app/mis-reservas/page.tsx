import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CancelBookingButton from "@/components/bookings/CancelBookingButton";
import { bookingCode, statusClass, statusLabel } from "@/lib/bookings";

type PlaceRef = { image_url: string | null };
type BookingRow = {
  id: number | string;
  place_name: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  tour_date: string;
  people: string;
  notes: string | null;
  status: string;
  created_at: string;
  places: PlaceRef | PlaceRef[] | null;
};
type CourseRef = { title: string; level: string };
type EnrollmentRow = {
  id: string;
  status: string;
  course_id: string;
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
      .select(
        "id,place_name,customer_name,customer_phone,customer_email,tour_date,people,notes,status,created_at,places(image_url)",
      )
      .eq("user_id", auth.user.id)
      .order("tour_date", { ascending: true }),
    sb
      .from("enrollments")
      .select("id,status,course_id,courses(title,level)")
      .eq("user_id", auth.user.id)
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
          {bookings.map((b) => {
            const img = one(b.places)?.image_url ?? null;
            return (
              <li
                key={b.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 sm:flex"
              >
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={b.place_name}
                    className="h-40 w-full object-cover sm:h-auto sm:w-44"
                  />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-brand/10 text-xs text-muted sm:h-auto sm:w-44">
                    Sin imagen
                  </div>
                )}
                <div className="flex-1 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-muted">
                        {bookingCode(b.id)}
                      </p>
                      <h2 className="text-base font-bold text-navy">
                        {b.place_name}
                      </h2>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(b.status)}`}
                    >
                      {statusLabel(b.status)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-foreground">
                    {formatDate(b.tour_date)} · Personas: {b.people}
                  </p>
                  {b.notes && (
                    <p className="mt-2 text-sm text-muted">{b.notes}</p>
                  )}
                  <dl className="mt-3 space-y-0.5 text-xs text-muted">
                    {b.customer_name && <div>Reserva a nombre de {b.customer_name}</div>}
                    {b.customer_phone && <div>WhatsApp: {b.customer_phone}</div>}
                    {b.customer_email && <div>Correo: {b.customer_email}</div>}
                    <div>
                      Creada el{" "}
                      {new Date(b.created_at).toLocaleDateString("es-CO", {
                        dateStyle: "medium",
                      })}
                    </div>
                  </dl>
                  {b.status === "pendiente" && (
                    <CancelBookingButton id={b.id} />
                  )}
                </div>
              </li>
            );
          })}
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
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
              >
                <div>
                  <h3 className="text-base font-bold text-navy">
                    {c?.title ?? "Curso"}
                  </h3>
                  {c && <p className="text-sm text-muted">Nivel {c.level}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">
                    {e.status}
                  </span>
                  {e.status === "activa" && (
                    <Link
                      href={`/dashboard/curso/${e.course_id}`}
                      className="rounded-full bg-gold px-4 py-1.5 text-xs font-semibold text-navy hover:brightness-95"
                    >
                      Entrar al curso
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
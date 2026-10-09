import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StatusSelect from "@/components/admin/StatusSelect";
import { BOOKING_STATUS, bookingCode, whatsappLink } from "@/lib/bookings";

type PlaceRef = { image_url: string | null };
type BookingRow = {
  id: number | string;
  place_name: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  tour_date: string;
  people: string;
  notes: string | null;
  status: string;
  created_at: string;
  places: PlaceRef | PlaceRef[] | null;
};

type EnrollmentRow = {
  id: string;
  status: string;
  created_at: string;
  email: string;
  course_title: string;
};

const ENROLL_STATUS = ["activa", "cancelada"];

function one<T>(v: T | T[] | null): T | null {
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function formatDate(d: string) {
  return new Date(`${d}T00:00:00`).toLocaleDateString("es-CO", {
    dateStyle: "medium",
  });
}

export default async function AdminPage() {
  const sb = await createClient();
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: isAdmin } = await sb.rpc("is_admin");
  if (!isAdmin) redirect("/");

  const [bookingsRes, enrollRes] = await Promise.all([
    sb
      .from("bookings")
      .select(
        "id,place_name,customer_name,customer_phone,customer_email,tour_date,people,notes,status,created_at,places(image_url)",
      )
      .order("created_at", { ascending: false }),
    sb.rpc("admin_list_enrollments"),
  ]);

  const bookings = (bookingsRes.data ?? []) as unknown as BookingRow[];
  const enrollments = (enrollRes.data ?? []) as unknown as EnrollmentRow[];

  const th = "px-3 py-2 text-left text-xs font-semibold uppercase text-muted";
  const td = "px-3 py-3 align-top text-sm text-foreground";

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-navy">Panel de administración</h1>
        <Link
          href="/admin/contenido"
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-navy hover:brightness-95"
        >
          Editar contenido e imágenes
        </Link>
        <Link
          href="/admin/profesores"
          className="rounded-full border border-navy px-5 py-2 text-sm font-semibold text-navy hover:bg-black/5"
        >
          Administrar profesores
        </Link>
        <Link
          href="/admin/clases"
          className="rounded-full border border-navy px-5 py-2 text-sm font-semibold text-navy hover:bg-black/5"
        >
          Administrar clases
        </Link>
        <Link
          href="/admin/modulos"
          className="rounded-full border border-navy px-5 py-2 text-sm font-semibold text-navy hover:bg-black/5"
        >
          Administrar modulos
        </Link>
      </div>

      <h2 className="mt-10 text-2xl font-bold text-navy">
        Reservas ({bookings.length})
      </h2>
      {bookingsRes.error ? (
        <p className="mt-4 text-muted">No pudimos cargar las reservas.</p>
      ) : bookings.length === 0 ? (
        <p className="mt-4 text-muted">No hay reservas.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <table className="min-w-full divide-y divide-black/5">
            <thead>
              <tr>
                <th className={th}>Código</th>
                <th className={th}>Destino</th>
                <th className={th}>Cliente</th>
                <th className={th}>Contacto</th>
                <th className={th}>Fecha</th>
                <th className={th}>Personas</th>
                <th className={th}>Comentarios</th>
                <th className={th}>Creada</th>
                <th className={th}>Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {bookings.map((b) => {
                const img = one(b.places)?.image_url ?? null;
                return (
                  <tr key={b.id}>
                    <td className={`${td} whitespace-nowrap font-semibold`}>
                      {bookingCode(b.id)}
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        {img && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt=""
                            className="h-12 w-16 rounded-lg object-cover"
                          />
                        )}
                        <span>{b.place_name}</span>
                      </div>
                    </td>
                    <td className={td}>{b.customer_name}</td>
                    <td className={td}>
                      {b.customer_phone ? (
                        <a
                          href={whatsappLink(b.customer_phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-brand hover:underline"
                        >
                          {b.customer_phone}
                        </a>
                      ) : (
                        <span className="text-muted">Sin WhatsApp</span>
                      )}
                      {b.customer_email && (
                        <div className="text-xs text-muted">
                          {b.customer_email}
                        </div>
                      )}
                    </td>
                    <td className={td}>{formatDate(b.tour_date)}</td>
                    <td className={td}>{b.people}</td>
                    <td className={td}>{b.notes ?? ""}</td>
                    <td className={td}>
                      {new Date(b.created_at).toLocaleDateString("es-CO", {
                        dateStyle: "medium",
                      })}
                    </td>
                    <td className={td}>
                      <StatusSelect
                        table="bookings"
                        id={b.id}
                        current={b.status}
                        options={BOOKING_STATUS}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-14 text-2xl font-bold text-navy">
        Inscripciones ({enrollments.length})
      </h2>
      {enrollRes.error ? (
        <p className="mt-4 text-muted">No pudimos cargar las inscripciones.</p>
      ) : enrollments.length === 0 ? (
        <p className="mt-4 text-muted">No hay inscripciones.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <table className="min-w-full divide-y divide-black/5">
            <thead>
              <tr>
                <th className={th}>Correo</th>
                <th className={th}>Curso</th>
                <th className={th}>Fecha</th>
                <th className={th}>Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td className={td}>{e.email}</td>
                  <td className={td}>{e.course_title}</td>
                  <td className={td}>
                    {new Date(e.created_at).toLocaleDateString("es-CO", {
                      dateStyle: "medium",
                    })}
                  </td>
                  <td className={td}>
                    <StatusSelect
                      table="enrollments"
                      id={e.id}
                      current={e.status}
                      options={ENROLL_STATUS}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
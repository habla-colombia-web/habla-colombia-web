import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PlaceRef = { name: string; region: string };
type BookingRow = {
  id: string;
  tour_date: string;
  people: number;
  notes: string | null;
  status: string;
  places: PlaceRef | PlaceRef[] | null;
};

function placeOf(b: BookingRow): PlaceRef | null {
  return Array.isArray(b.places) ? (b.places[0] ?? null) : b.places;
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

  const { data, error } = await sb
    .from("bookings")
    .select("id,tour_date,people,notes,status,places(name,region)")
    .order("tour_date", { ascending: true });

  const bookings = (data ?? []) as unknown as BookingRow[];

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-navy">Mis reservas</h1>

      {error ? (
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
            const p = placeOf(b);
            return (
              <li
                key={b.id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-navy">
                      {p?.name ?? "Recorrido"}
                    </h2>
                    {p && <p className="text-sm text-muted">{p.region}</p>}
                  </div>
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold capitalize text-brand">
                    {b.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-foreground">
                  {formatDate(b.tour_date)} ·{" "}
                  {b.people === 1 ? "1 persona" : `${b.people} personas`}
                </p>
                {b.notes && (
                  <p className="mt-2 text-sm text-muted">{b.notes}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
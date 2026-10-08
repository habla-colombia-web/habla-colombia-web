"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Place } from "@/types";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "mt-1 w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-navy outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

export default function BookingModal({
  place,
  onClose,
}: {
  place: Place;
  onClose: () => void;
}) {
  // undefined = verificando, null = sin sesión, string = correo del usuario
  const [user, setUser] = useState<string | null | undefined>(undefined);
  const [date, setDate] = useState("");
  const [people, setPeople] = useState(1);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const today = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    let active = true;
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (active) setUser(data.user ? (data.user.email ?? "tu cuenta") : null);
      })
      .catch(() => {
        if (active) setUser(null);
      });
    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!date || date < today) {
      setError("Elige una fecha de hoy en adelante.");
      return;
    }
    setSaving(true);
    const sb = createClient();
    const { data: u } = await sb.auth.getUser();
    const meta = u.user?.user_metadata?.full_name;
    const customer =
      (typeof meta === "string" && meta.trim()) || u.user?.email || "Cliente";
    const { error } = await sb.from("bookings").insert({
      place_id: place.id,
      place_name: place.name,
      customer_name: customer,
      tour_date: date,
      people: String(people),
      notes: notes.trim() || null,
    });
    setSaving(false);
    if (error) {
      setError("No pudimos guardar tu reserva. Intenta de nuevo.");
      return;
    }
    setDone(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="max-h-full w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="booking-title" className="text-xl font-bold text-navy">
          Separar recorrido: {place.name}
        </h3>
        <p className="mt-1 text-sm text-muted">
          {place.region}
          {place.meta ? ` · ${place.meta}` : ""}
        </p>

        {user === undefined && (
          <p className="mt-4 text-sm text-muted">Verificando tu sesión...</p>
        )}

        {user === null && (
          <>
            <p className="mt-4 text-sm text-foreground">
              Para separar tu recorrido necesitas una cuenta.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-sm font-medium text-navy hover:bg-black/5"
              >
                Cancelar
              </button>
              <Link
                href="/login"
                className="rounded-full border border-navy px-4 py-2 text-sm font-semibold text-navy"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-navy hover:brightness-95"
              >
                Crear cuenta
              </Link>
            </div>
          </>
        )}

        {typeof user === "string" && done && (
          <>
            <p role="status" className="mt-4 text-sm font-medium text-emerald-700">
              Reserva guardada. Quedó en estado pendiente.
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-sm font-medium text-navy hover:bg-black/5"
              >
                Cerrar
              </button>
              <Link
                href="/mis-reservas"
                className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-navy hover:brightness-95"
              >
                Ver mis reservas
              </Link>
            </div>
          </>
        )}

        {typeof user === "string" && !done && (
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <label className="block text-sm font-medium text-navy">
              Fecha
              <input
                type="date"
                required
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-navy">
              Número de personas
              <input
                type="number"
                required
                min={1}
                max={20}
                value={people}
                onChange={(e) => setPeople(Number(e.target.value))}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-navy">
              Notas (opcional)
              <textarea
                rows={3}
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={inputClass}
              />
            </label>

            {error && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {error}
              </p>
            )}

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-sm font-medium text-navy hover:bg-black/5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-navy hover:brightness-95 disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Confirmar reserva"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
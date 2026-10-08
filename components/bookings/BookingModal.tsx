"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Place } from "@/types";
import { createClient } from "@/lib/supabase/client";

export default function BookingModal({
  place,
  onClose,
}: {
  place: Place;
  onClose: () => void;
}) {
  // undefined = verificando, null = sin sesión, string = correo del usuario
  const [user, setUser] = useState<string | null | undefined>(undefined);

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
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
          <p className="mt-4 text-sm text-foreground">
            Para separar tu recorrido necesitas una cuenta.
          </p>
        )}
        {typeof user === "string" && (
          <p className="mt-4 text-sm text-foreground">
            Sesión iniciada como <strong>{user}</strong>. La reserva completa
            se habilitará en la siguiente fase del proyecto.
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-navy hover:bg-black/5"
          >
            {user ? "Cerrar" : "Cancelar"}
          </button>
          {user === null && (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect } from "react";
import Link from "next/link";
import type { Place } from "@/types";

export default function BookingModal({
  place,
  onClose,
}: {
  place: Place;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

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
        <p className="mt-4 text-sm text-foreground">
          Para separar tu recorrido necesitas una cuenta. La reserva completa se
          habilitará en la siguiente fase del proyecto.
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
      </div>
    </div>
  );
}
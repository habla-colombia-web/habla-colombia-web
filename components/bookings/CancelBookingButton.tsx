"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CancelBookingButton({ id }: { id: number | string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function cancel() {
    if (!window.confirm("Cancelar esta reserva?")) return;
    setLoading(true);
    setError(false);
    const { error } = await createClient()
      .from("bookings")
      .update({ status: "cancelada" })
      .eq("id", id);
    setLoading(false);
    if (error) {
      setError(true);
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={cancel}
        disabled={loading}
        className="rounded-full border border-red-600 px-4 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        {loading ? "Cancelando..." : "Cancelar reserva"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          No pudimos cancelar la reserva. Intenta de nuevo.
        </p>
      )}
    </div>
  );
}